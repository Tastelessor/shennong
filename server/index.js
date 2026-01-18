import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer'; // 引入 multer
import path from 'path';
import fs from 'fs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const PORT = 3000;

// upload dir
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// ---------- 1. DB Init (SQLite) ----------
const db = new sqlite3.Database('./shennong.db', err => {
    if (err) console.error("DB connection failed:", err.message);
    else console.log("Connected to SQLite (shennong.db)");
});

db.serialize(() => {
// 更新 users 表，增加合伙人和邀请字段
    db.run(`ALTER TABLE users ADD COLUMN inviterId TEXT`, err => {});
    db.run(`ALTER TABLE users ADD COLUMN partnerStatus TEXT DEFAULT 'none'`, err => {});
    db.run(`ALTER TABLE users ADD COLUMN companyName TEXT`, err => {});
    db.run(`ALTER TABLE users ADD COLUMN creditCode TEXT`, err => {});
    db.run(`ALTER TABLE users ADD COLUMN licensePath TEXT`, err => {});
    // users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT UNIQUE, phone TEXT, password TEXT, name TEXT, role TEXT DEFAULT 'user'
    )`);
    // appointments table
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY, userId TEXT, userName TEXT, userPhone TEXT, date TEXT, service TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // chat history table
    db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT, roomId TEXT, senderName TEXT, senderRole TEXT, content TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // frequent-visitors table
    db.run(`CREATE TABLE IF NOT EXISTS visitors (id TEXT PRIMARY KEY, userId TEXT, name TEXT, phone TEXT)`);

    // seed admin & agent for quick test
    const adminId = "admin_001";
    db.run(`INSERT OR IGNORE INTO users (id, email, phone, password, name, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [adminId, "admin@shennong.com", "0000", "admin123", "System Admin", "admin"]);

    const agentId = "agent_001";
    db.run(`INSERT OR IGNORE INTO users (id, email, phone, password, name, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [agentId, "agent@shennong.com", "1111", "agent123", "Online Agent 01", "agent"]);
});

// ---------- Helper ----------
const generateId = () => Math.random().toString(36).substr(2, 9);

// ---------- 2. Socket.io Real-time Chat ----------
// server/index.js 中的 Socket 部分
io.on('connection', socket => {
    
    socket.on('join_room', roomId => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined: ${roomId}`);
    });

    // 新增：离开房间处理
    socket.on('leave_room', roomId => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left: ${roomId}`);
    });

    socket.on('send_message', data => {
        const { roomId, senderName, senderRole, content } = data;
        
        // 存入数据库
        db.run(`INSERT INTO chat_messages (roomId, senderName, senderRole, content) VALUES (?, ?, ?, ?)`,
            [roomId, senderName, senderRole, content]);

        // 只发送给对应房间的人
        // 注意：使用 io.to(roomId) 而不是 socket.to(roomId)
        // socket.to 会排除发送者自己，而客服系统通常需要多端同步
        io.to(roomId).emit('receive_message', data);
    });
});

// ---------- 3. REST API ----------

// 获取个人详细资料
app.get('/api/user/profile/:id', (req, res) => {
    db.get(`SELECT id, name, email, role, phone, inviterId, partnerStatus, companyName FROM users WHERE id = ?`, 
        [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ message: "Not found" });
        res.json(row);
    });
});

// 绑定邀请人逻辑
app.post('/api/user/bind-inviter', (req, res) => {
    const { userId, inviterId } = req.body;
    if (userId === inviterId) return res.status(400).json({ message: "Cannot bind yourself" });

    // 1. 检查邀请人是否存在
    db.get(`SELECT id FROM users WHERE id = ?`, [inviterId], (err, inviter) => {
        if (!inviter) return res.status(404).json({ message: "Inviter not found" });

        // 2. 检查该邀请人是否已经邀请了2个人（限制）
        db.get(`SELECT COUNT(*) as count FROM users WHERE inviterId = ?`, [inviterId], (err, row) => {
            if (row.count >= 2) return res.status(400).json({ message: "This inviter has reached maximum capacity (2)" });

            // 3. 执行绑定
            db.run(`UPDATE users SET inviterId = ? WHERE id = ? AND inviterId IS NULL`, 
                [inviterId, userId], function(err) {
                if (this.changes === 0) return res.status(400).json({ message: "Already bound or user error" });
                res.json({ message: "Bound successfully" });
            });
        });
    });
});

// 申请合伙人 (上传营业执照)
app.post('/api/partner/apply', upload.single('license'), (req, res) => {
    const { userId, companyName, creditCode } = req.body;
    const licensePath = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(`UPDATE users SET 
            partnerStatus = 'pending', 
            companyName = ?, 
            creditCode = ?, 
            licensePath = ? 
            WHERE id = ?`,
        [companyName, creditCode, licensePath, userId], function(err) {
            if (err) return res.status(500).json({ message: "Apply failed" });
            res.json({ message: "Application submitted" });
        });
});

// 管理员：获取所有待审核合伙人
app.get('/api/admin/partner-applications', (req, res) => {
    db.all(`SELECT id, name, companyName, creditCode, licensePath, partnerStatus FROM users WHERE partnerStatus = 'pending'`, 
    (err, rows) => {
        res.json(rows || []);
    });
});

// 管理员：审核通过合伙人
app.post('/api/admin/partner-approve/:id', (req, res) => {
    db.run(`UPDATE users SET partnerStatus = 'approved' WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ message: "Approval failed" });
        res.json({ message: "Partner approved" });
    });
});

// 合伙人：获取邀请统计 (递归简单实现：A 邀请 B, B 邀请 C, 都算在 A 身上)
app.get('/api/user/invite-stats/:id', (req, res) => {
    const userId = req.params.id;
    // 获取直属下线列表
    db.all(`SELECT id FROM users WHERE inviterId = ?`, [userId], (err, directs) => {
        if (err || !directs.length) return res.json({ teamACount: 0, teamBCount: 0 });

        // 我们假设 A 邀请了 B1 和 B2。teamACount 是 B1 及其所有下属的数量
        const getTeamSize = (rootId) => {
            return new Promise((resolve) => {
                db.all(`WITH RECURSIVE team AS (
                    SELECT id FROM users WHERE inviterId = ?
                    UNION ALL
                    SELECT u.id FROM users u INNER JOIN team t ON u.inviterId = t.id
                ) SELECT COUNT(*) as total FROM team`, [rootId], (err, row) => {
                    resolve(row ? row[0].total : 0);
                });
            });
        };

        // 计算两个支队的总人数
        const p1 = getTeamSize(directs[0]?.id);
        const p2 = directs[1] ? getTeamSize(directs[1].id) : Promise.resolve(0);

        Promise.all([p1, p2]).then(([c1, c2]) => {
            res.json({ teamACount: c1, teamBCount: c2 });
        });
    });
});

// 调整客服会话接口：支持未读计数预览
app.get('/api/agent/sessions', (req, res) => {
    const sql = `
        SELECT roomId, senderName, content, timestamp as lastMsgTime,
        (SELECT COUNT(*) FROM chat_messages m2 WHERE m2.roomId = m1.roomId AND m2.senderRole = 'user') as unreadCount
        FROM chat_messages m1
        WHERE id IN (SELECT MAX(id) FROM chat_messages GROUP BY roomId)
        ORDER BY timestamp DESC
    `;
    db.all(sql, [], (err, rows) => res.json(rows || []));
});

// registration
app.post('/api/register', (req, res) => {
    const { email, phone, password, name } = req.body;
    db.get(`SELECT email FROM users WHERE email = ?`, [email], (err, row) => {
        if (row) return res.status(400).json({ message: "Email already registered, please log in" });
        const id = generateId();
        db.run(`INSERT INTO users (id, email, phone, password, name, role) VALUES (?, ?, ?, ?, ?, 'user')`,
            [id, email, phone, password, name], function (err) {
                if (err) return res.status(500).json({ message: "Registration failed" });
                res.status(201).json({ id, email, name, role: 'user', phone });
            });
    });
});

// login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, row) => {
        if (err || !row) return res.status(401).json({ message: "Invalid email or password" });
        res.json({ message: "Login successful", user: row });
    });
});

// create appointment
app.post('/api/appointments', (req, res) => {
    const { userId, userName, userPhone, date, service, description } = req.body;
    const id = generateId();
    db.run(`INSERT INTO appointments (id, userId, userName, userPhone, date, service, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId || 'GUEST', userName, userPhone, date, service, description], function (err) {
            if (err) return res.status(500).json({ message: "DB error" });
            res.status(201).json({ message: "Appointment created" });
        });
});

// user appointments
app.get('/api/appointments', (req, res) => {
    const { userId } = req.query;
    db.all(`SELECT * FROM appointments WHERE userId = ?`, [userId], (err, rows) => res.json(rows || []));
});

// frequent visitors
app.get('/api/visitors', (req, res) => {
    const { userId } = req.query;
    db.all(`SELECT * FROM visitors WHERE userId = ?`, [userId], (err, rows) => res.json(rows || []));
});

// add visitor
app.post('/api/visitors', (req, res) => {
    const { userId, name, phone } = req.body;
    if (!userId || !name) return res.status(400).json({ message: "Incomplete data" });

    db.get(`SELECT COUNT(*) as count FROM visitors WHERE userId = ?`, [userId], (err, row) => {
        if (err) return res.status(500).json({ message: "DB error" });
        const MAX = 5;
        if (row.count >= MAX) return res.status(400).json({ message: `Max contacts reached (${MAX})` });

        db.get(`SELECT id FROM visitors WHERE userId = ? AND name = ?`, [userId, name], (err, existing) => {
            if (existing) return res.status(200).json({ message: "Contact already exists" });
            const id = generateId();
            db.run(`INSERT INTO visitors (id, userId, name, phone) VALUES (?, ?, ?, ?)`,
                [id, userId, name, phone], function (err) {
                    if (err) return res.status(500).json({ message: "Insert failed" });
                    res.status(201).json({ message: "Saved", id });
                });
        });
    });
});

// delete visitor
app.delete('/api/visitors/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM visitors WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ message: "Delete failed" });
        if (this.changes === 0) return res.status(404).json({ message: "Contact not found" });
        res.json({ message: "Deleted" });
    });
});

// admin all data
app.get('/api/admin/all', (req, res) => {
    db.all(`SELECT * FROM users`, (e1, users) => {
        db.all(`SELECT * FROM appointments`, (e2, appts) => {
            db.all(`SELECT * FROM chat_messages`, (e3, msgs) => {
                res.json({ users: users || [], appts: appts || [], msgs: msgs || [] });
            });
        });
    });
});

// verify token-less user
app.get('/api/verify', (req, res) => {
    const { id } = req.query;
    db.get(`SELECT id, email, name, role, phone FROM users WHERE id = ?`, [id], (err, row) => {
        if (err || !row) return res.status(401).json({ message: "Unauthorized" });
        res.json(row);
    });
});

// active chat sessions for agents
app.get('/api/agent/sessions', (req, res) => {
    const sql = `SELECT roomId, senderName, MAX(timestamp) as lastMsgTime, content 
                 FROM chat_messages 
                 GROUP BY roomId 
                 ORDER BY lastMsgTime DESC`;
    db.all(sql, [], (err, rows) => res.json(rows || []));
});

// chat history for a room
app.get('/api/chat/history', (req, res) => {
    const { roomId } = req.query;
    db.all(`SELECT * FROM chat_messages WHERE roomId = ? ORDER BY timestamp ASC`, [roomId], (err, rows) => res.json(rows || []));
});

// clinic branches
app.get('/api/clinic-locations', (req, res) => {
    const locations = [
        { id: 1, name: "Shen Nong TCM · Sylhet HQ", address: "Syhlet 3100, Zinda Bazar Road, Al-Hamra Shopping Complex, 1st Floor, Sylhet, Bangladesh", lat: 24.8995, lng: 91.8719 },
        { id: 2, name: "Shen Nong TCM · Airport Branch", address: "Syhlet 3101, Airport Road, Opposite Osmani Airport, Sylhet, Bangladesh", lat: 24.9633, lng: 91.8664 },
        { id: 3, name: "Shen Nong TCM · Amberkhana Branch", address: "Syhlet 3102, Amberkhana, Shahjalal Upashahar Main Gate, Sylhet, Bangladesh", lat: 24.9180, lng: 91.8807 }
    ];
    res.json(locations);
});

// ---------- Start Server ----------
httpServer.listen(PORT, () => {
    console.log(`Backend running (SQLite + Socket.io) on http://localhost:${PORT}`);
});