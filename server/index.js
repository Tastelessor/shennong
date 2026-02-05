import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import fs from 'fs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const PORT = 3000;

// 配置上传
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
app.disable('etag');

// DB 初始化
const db = new sqlite3.Database('./shennong.db');
db.serialize(() => {
    // 确保所有字段存在
    const columns = [
        "ALTER TABLE users ADD COLUMN inviterId TEXT",
        "ALTER TABLE users ADD COLUMN partnerStatus TEXT DEFAULT 'none'",
        "ALTER TABLE users ADD COLUMN companyName TEXT",
        "ALTER TABLE users ADD COLUMN creditCode TEXT",
        "ALTER TABLE users ADD COLUMN licensePath TEXT"
    ];
    columns.forEach(sql => db.run(sql, () => {}));
    db.run(`ALTER TABLE chat_messages ADD COLUMN isRead INTEGER DEFAULT 0`, (err) => {
        // 忽略 "duplicate column name" 错误
    });
    db.run(`ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {});

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT UNIQUE, phone TEXT, password TEXT, name TEXT, role TEXT DEFAULT 'user',
        inviterId TEXT, partnerStatus TEXT DEFAULT 'none', companyName TEXT, creditCode TEXT, licensePath TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY, userId TEXT, userName TEXT, userPhone TEXT, date TEXT, service TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT, roomId TEXT, senderName TEXT, senderRole TEXT, content TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS visitors (id TEXT PRIMARY KEY, userId TEXT, name TEXT, phone TEXT)`);
    
    // 初始化管理员和客服
    db.run(`INSERT OR IGNORE INTO users (id, email, phone, password, name, role) VALUES (?, ?, ?, ?, ?, ?)`, ["admin_001", "admin@shennong.com", "0000", "admin123", "System Admin", "admin"]);
    db.run(`INSERT OR IGNORE INTO users (id, email, phone, password, name, role) VALUES (?, ?, ?, ?, ?, ?)`, ["agent_001", "agent@shennong.com", "1111", "agent123", "Online Agent 01", "agent"]);
});

const generateId = () => Math.random().toString(36).substr(2, 9);

// Socket.io
io.on('connection', socket => {
    socket.on('join_room', roomId => socket.join(roomId));
    socket.on('leave_room', roomId => socket.leave(roomId));
    socket.on('send_message', data => {
        const { roomId, senderName, senderRole, content } = data;
        db.run(`INSERT INTO chat_messages (roomId, senderName, senderRole, content) VALUES (?, ?, ?, ?)`,
            [roomId, senderName, senderRole, content], (err) => {
                if (!err) io.to(roomId).emit('receive_message', data);
            });
    });
});

// --- API ---
// 1. 获取系统监控数据 (折线图 + 实时概览)
app.get('/api/admin/stats', (req, res) => {
    const { period } = req.query; // 'hour', 'day', 'month', etc.
    // 模拟数据生成 (真实场景应使用 GROUP BY strftime 查询 chat_messages)
    // 为了演示效果，我们生成一组根据 period 变化的伪数据
    const generateChartData = (points) => {
        return Array.from({ length: points }, (_, i) => ({
            label: period === 'hour' ? `${i}m` : (period === 'day' ? `${i}h` : `Day ${i+1}`),
            users: Math.floor(Math.random() * 50) + 10,
            messages: Math.floor(Math.random() * 200) + 50
        }));
    };

    const countActiveUsers = new Promise(resolve => {
        // 过去1小时内发过消息的去重用户数
        db.get(`SELECT COUNT(DISTINCT senderName) as count FROM chat_messages WHERE timestamp > datetime('now', '-1 hour') AND senderRole='user'`, (err, row) => resolve(row?.count || 0));
    });

    const countMsgLastHour = new Promise(resolve => {
        db.get(`SELECT COUNT(*) as count FROM chat_messages WHERE timestamp > datetime('now', '-1 hour')`, (err, row) => resolve(row?.count || 0));
    });

    Promise.all([countActiveUsers, countMsgLastHour]).then(([activeUsers, msgCount]) => {
        res.json({
            current: {
                activeUsers: activeUsers + Math.floor(Math.random() * 5), // 加点随机噪音模拟实时
                activeAgents: 2, // 模拟在线客服数
                msgLastHour: msgCount
            },
            chart: generateChartData(period === 'hour' ? 12 : 7) // 返回最近12个点或7个点
        });
    });
});

// [新增] 标记预约为已处理
app.post('/api/admin/appointment-process/:id', (req, res) => {
    const { id } = req.params;
    const status = 'processed';
    db.run(`UPDATE appointments SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) return res.status(500).json({ message: "DB Error" });
        res.json({ message: "Updated" });
    });
});

// 1. 注册/登录/验证
app.post('/api/register', (req, res) => {
    const { email, phone, password, name } = req.body;
    db.get(`SELECT email FROM users WHERE email = ?`, [email], (err, row) => {
        if (row) return res.status(400).json({ message: "Email registered" });
        const id = generateId();
        db.run(`INSERT INTO users (id, email, phone, password, name, role) VALUES (?, ?, ?, ?, ?, 'user')`,
            [id, email, phone, password, name], (err) => {
                if (err) return res.status(500).json({ message: "Register failed" });
                res.status(201).json({ id, email, name, role: 'user' });
            });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, row) => {
        if (!row) return res.status(401).json({ message: "Invalid credentials" });
        res.json({ message: "Login success", user: row });
    });
});

app.get('/api/verify', (req, res) => {
    const { id } = req.query;
    db.get(`SELECT id, email, name, role, phone, inviterId, partnerStatus FROM users WHERE id = ?`, [id], (err, row) => {
        if (!row) return res.status(401).json({ message: "Unauthorized" });
        res.json(row);
    });
});

// 2. 用户功能
app.get('/api/user/profile/:id', (req, res) => {
    db.get(`SELECT id, name, email, role, phone, inviterId, partnerStatus, companyName FROM users WHERE id = ?`, [req.params.id], (err, row) => {
        res.json(row || {});
    });
});

app.post('/api/user/bind-inviter', (req, res) => {
    const { userId, inviterId } = req.body;
    if (userId === inviterId) return res.status(400).json({ message: "Cannot bind self" });
    
    db.get(`SELECT id FROM users WHERE id = ?`, [inviterId], (err, inviter) => {
        if (!inviter) return res.status(404).json({ message: "Inviter not found" });
        db.get(`SELECT COUNT(*) as count FROM users WHERE inviterId = ?`, [inviterId], (err, row) => {
            if (row.count >= 2) return res.status(400).json({ message: "Inviter full (max 2)" });
            db.run(`UPDATE users SET inviterId = ? WHERE id = ? AND inviterId IS NULL`, [inviterId, userId], function() {
                if (this.changes === 0) return res.status(400).json({ message: "Bind failed or already bound" });
                res.json({ message: "Bound successfully" });
            });
        });
    });
});

// [新增] 修改密码接口
app.post('/api/user/update-password', (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    db.get(`SELECT password FROM users WHERE id = ?`, [userId], (err, row) => {
        if (!row || row.password !== oldPassword) return res.status(400).json({ message: "旧密码错误" });
        db.run(`UPDATE users SET password = ? WHERE id = ?`, [newPassword, userId], (err) => {
            if (err) return res.status(500).json({ message: "Update failed" });
            res.json({ message: "密码修改成功" });
        });
    });
});

// [修复] 统计逻辑：包含直属下级本身
app.get('/api/user/invite-stats/:id', (req, res) => {
    const userId = req.params.id;
    db.all(`SELECT id FROM users WHERE inviterId = ?`, [userId], (err, directs) => {
        if (err || !directs.length) return res.json({ teamACount: 0, teamBCount: 0 });

        const getTeamSize = (rootId) => {
            return new Promise((resolve) => {
                // 递归统计 rootId 的所有下线
                db.all(`WITH RECURSIVE team AS (
                    SELECT id FROM users WHERE inviterId = ?
                    UNION ALL
                    SELECT u.id FROM users u INNER JOIN team t ON u.inviterId = t.id
                ) SELECT COUNT(*) as total FROM team`, [rootId], (err, row) => {
                    // 总人数 = 直属下级(1) + 他的所有下线(total)
                    const count = 1 + (row ? row[0].total : 0);
                    resolve(count);
                });
            });
        };

        const p1 = getTeamSize(directs[0]?.id);
        const p2 = directs[1] ? getTeamSize(directs[1].id) : Promise.resolve(0);

        Promise.all([p1, p2]).then(([c1, c2]) => {
            res.json({ teamACount: c1, teamBCount: c2 });
        });
    });
});

// 3. 合伙人流程
app.post('/api/partner/apply', upload.single('license'), (req, res) => {
    const { userId, companyName, creditCode } = req.body;
    const licensePath = req.file ? `/uploads/${req.file.filename}` : null;
    db.run(`UPDATE users SET partnerStatus = 'pending', companyName = ?, creditCode = ?, licensePath = ? WHERE id = ?`,
        [companyName, creditCode, licensePath, userId], (err) => {
            if (err) return res.status(500).json({ message: "Error" });
            res.json({ message: "Applied" });
        });
});

app.get('/api/admin/partner-applications', (req, res) => {
    db.all(`SELECT id, name, companyName, creditCode, licensePath FROM users WHERE partnerStatus = 'pending'`, (err, rows) => res.json(rows || []));
});

app.post('/api/admin/partner-approve/:id', (req, res) => {
    db.run(`UPDATE users SET partnerStatus = 'approved' WHERE id = ?`, [req.params.id], () => res.json({ message: "Approved" }));
});

app.get('/api/admin/partners-detailed', (req, res) => {
    db.all(`SELECT id, name, email, phone, companyName, creditCode, partnerStatus FROM users WHERE partnerStatus = 'approved'`, async (err, partners) => {
        if (err) return res.json([]);
        
        // 辅助函数：复用之前的递归统计逻辑
        const getTeamStats = (userId) => {
            return new Promise((resolve) => {
                db.all(`SELECT id FROM users WHERE inviterId = ?`, [userId], async (err, directs) => {
                     // 递归计算函数
                     const calcDeep = (rootId) => new Promise(rs => {
                        db.get(`WITH RECURSIVE team AS (
                            SELECT id FROM users WHERE inviterId = ?
                            UNION ALL
                            SELECT u.id FROM users u INNER JOIN team t ON u.inviterId = t.id
                        ) SELECT COUNT(*) as total FROM team`, [rootId], (e, r) => rs(r ? r.total : 0));
                     });

                     if (!directs || directs.length === 0) return resolve({ teamA: 0, teamB: 0 });
                     
                     const countA = await calcDeep(directs[0].id); // 直属下级 A 的所有下线
                     const countB = directs[1] ? await calcDeep(directs[1].id) : 0;
                     
                     // 团队人数 = 直属下级本人(1) + 他的下线
                     resolve({ 
                         teamA: 1 + countA, 
                         teamB: directs[1] ? (1 + countB) : 0 
                     });
                });
            });
        };

        const result = [];
        for (const p of partners) {
            const stats = await getTeamStats(p.id);
            result.push({
                ...p,
                teamACount: stats.teamA,
                teamBCount: stats.teamB,
                totalCount: stats.teamA + stats.teamB + 1 // +1 是他自己
            });
        }
        res.json(result);
    });
});

// 3. 撤销合伙人资格
app.post('/api/partner/revoke/:id', (req, res) => {
    const partnerId = req.params.id;
// 1. [向下] 释放该合伙人的所有直属下级 (允许下级重新绑定其他人)
        db.run(`UPDATE users SET inviterId = NULL WHERE inviterId = ?`, [partnerId], (err) => {
            if (err) console.error("Error freeing downlines", err);
        });

        // 2. [向上] 释放该合伙人占用的上级名额 (将自己的 inviterId 置空)
        // 这样他的上级目前邀请人数就会 -1，从而空出一个名额
        db.run(`UPDATE users SET inviterId = NULL WHERE id = ?`, [partnerId], (err) => {
            if (err) console.error("Error freeing upline quota", err);
        });
        
        // 3. [自身] 重置身份为普通用户
        db.run(`UPDATE users SET partnerStatus = 'none', role = 'user', companyName = NULL, creditCode = NULL, licensePath = NULL WHERE id = ?`, [partnerId], (err) => {
             if (err) return res.status(500).json({ message: "Revoke failed" });
             res.json({ message: "Partner revoked, downlines unbound, upline quota freed." });
        });
});

// 4. 获取邀请树 (递归结构)
app.get('/api/partner/tree/:id', (req, res) => {
    const rootId = req.params.id;
    
    const buildTree = async (userId) => {
        return new Promise((resolve) => {
            db.get(`SELECT id, name FROM users WHERE id = ?`, [userId], (err, user) => {
                if (!user) return resolve(null);
                
                db.all(`SELECT id FROM users WHERE inviterId = ?`, [userId], async (err, children) => {
                    const childrenNodes = [];
                    for (const child of children) {
                        const node = await buildTree(child.id);
                        if (node) childrenNodes.push(node);
                    }
                    
                    // 同时计算该节点的统计数据 (用于前端 Hover 展示)
                    // 为了性能这里可以简化，或者复用上面的逻辑。为演示方便，这里简单 Mock 或再次查询
                    // 真实生产环境应该在一个大的 SQL 中查出所有数据并在内存组装
                    resolve({
                        name: user.name,
                        id: user.id,
                        children: childrenNodes
                    });
                });
            });
        });
    };

    buildTree(rootId).then(tree => res.json(tree));
});

// 4. 其他数据接口 (预约、聊天、地图等)
app.post('/api/appointments', (req, res) => {
    const { userId, userName, userPhone, date, service, description } = req.body;
    const id = generateId();
    // 确保 status 默认为 'pending'
    db.run(
        `INSERT INTO appointments (id, userId, userName, userPhone, date, service, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`, 
        [id, userId || 'GUEST', userName, userPhone, date, service, description], 
        (err) => {
            if (err) return res.status(500).json({ message: "DB Error" });
            res.status(201).json({ message: "Appointment created" });
        }
    );
});

app.get('/api/appointments', (req, res) => {
    db.all(`SELECT * FROM appointments WHERE userId = ?`, [req.query.userId], (err, rows) => res.json(rows || []));
});
app.get('/api/admin/all', (req, res) => {
    db.all(`SELECT * FROM users`, (e, u) => db.all(`SELECT * FROM appointments`, (e, a) => db.all(`SELECT * FROM chat_messages`, (e, c) => res.json({users: u, appts: a, msgs: c}))));
});
app.get('/api/agent/sessions', (req, res) => {
    const sql = `
        SELECT roomId, senderName, content, timestamp as lastMsgTime,
        (SELECT COUNT(*) FROM chat_messages m2 
         WHERE m2.roomId = m1.roomId 
         AND m2.senderRole = 'user' ) as unreadCount
        FROM chat_messages m1
        WHERE id IN (SELECT MAX(id) FROM chat_messages GROUP BY roomId)
        ORDER BY timestamp DESC
    `;
    db.all(sql, [], (err, rows) => res.json(rows || []));
});
app.post('/api/chat/read', (req, res) => {
    const { roomId } = req.body;
    db.run(`UPDATE chat_messages SET isRead = 1 WHERE roomId = ? AND senderRole = 'user'`, [roomId], function(err) {
        if (err) return res.status(500).json({ message: "DB Error" });
        res.json({ message: "Marked as read" });
    });
});
app.get('/api/chat/history', (req, res) => {
    db.all(`SELECT * FROM chat_messages WHERE roomId = ? ORDER BY timestamp ASC`, [req.query.roomId], (err, rows) => res.json(rows || []));
});
app.get('/api/clinic-locations', (req, res) => {
    res.json([
        { id: 1, name: "Shen Nong TCM · Sylhet HQ", address: "Syhlet 3100, Zinda Bazar Road, Al-Hamra Shopping Complex, 1st Floor, Sylhet, Bangladesh", lat: 24.8995, lng: 91.8719 },
        { id: 2, name: "Shen Nong TCM · Airport Branch", address: "Syhlet 3101, Airport Road, Opposite Osmani Airport, Sylhet, Bangladesh", lat: 24.9633, lng: 91.8664 },
        { id: 3, name: "Shen Nong TCM · Amberkhana Branch", address: "Syhlet 3102, Amberkhana, Shahjalal Upashahar Main Gate, Sylhet, Bangladesh", lat: 24.9180, lng: 91.8807 }
    ]);
});
app.get('/api/visitors', (req, res) => {
    db.all(`SELECT * FROM visitors WHERE userId = ?`, [req.query.userId], (err, rows) => res.json(rows || []));
});
app.post('/api/visitors', (req, res) => {
    const { userId, name, phone } = req.body;
    
    // 1. 检查必填项
    if (!userId || !name || !phone) {
        return res.status(400).json({ message: "Missing fields" });
    }

    // 2. 检查是否存在重复
    db.get(
        `SELECT id FROM visitors WHERE userId = ? AND name = ? AND phone = ?`, 
        [userId, name, phone], 
        (err, existing) => {
            if (err) return res.status(500).json({ message: "DB Error" });
            
            if (existing) {
                // 如果已存在，直接返回 200 OK，不报错，也不重复插入
                return res.status(200).json({ id: existing.id, message: "Contact already exists" });
            }

            // 3. 不存在则插入
            const id = generateId();
            db.run(
                `INSERT INTO visitors (id, userId, name, phone) VALUES (?, ?, ?, ?)`, 
                [id, userId, name, phone], 
                (err) => {
                    if (err) return res.status(500).json({ message: "Save failed" });
                    res.status(201).json({ id, message: "Contact saved" });
                }
            );
        }
    );
});

app.delete('/api/visitors/:id', (req, res) => {
    db.run(`DELETE FROM visitors WHERE id = ?`, [req.params.id], () => res.json({message: "Deleted"}));
});

httpServer.listen(PORT, () => console.log(`Running on ${PORT}`));