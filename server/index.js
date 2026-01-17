import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const PORT = 3000;

// ---------- Middleware ----------
app.use(cors());
app.use(bodyParser.json());

// ---------- 1. DB Init (SQLite) ----------
const db = new sqlite3.Database('./shennong.db', err => {
    if (err) console.error("DB connection failed:", err.message);
    else console.log("Connected to SQLite (shennong.db)");
});

db.serialize(() => {
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
io.on('connection', socket => {
    console.log('Socket connected:', socket.id);

    socket.on('join_room', roomId => {
        socket.join(roomId);
        console.log(`User/Agent joined room: ${roomId}`);
    });

    socket.on('send_message', data => {
        const { roomId, senderName, senderRole, content } = data;
        // persist
        db.run(`INSERT INTO chat_messages (roomId, senderName, senderRole, content) VALUES (?, ?, ?, ?)`,
            [roomId, senderName, senderRole, content], err => { if (err) console.error(err); });
        // broadcast
        socket.to(roomId).emit('receive_message', data);
    });

    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// ---------- 3. REST API ----------

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