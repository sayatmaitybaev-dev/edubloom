"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/register', async (req, res) => {
    const { name, email, phone, password, role } = req.body;
    if (!name || !password || !role) {
        res.status(400).json({ error: 'name, password and role are required' });
        return;
    }
    if (!email && !phone) {
        res.status(400).json({ error: 'email or phone is required' });
        return;
    }
    if (!['teacher', 'student'].includes(role)) {
        res.status(400).json({ error: 'role must be teacher or student' });
        return;
    }
    try {
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email: email || null, phone: phone || null, passwordHash, role },
        });
        const token = (0, auth_1.signToken)(user.id, user.role);
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : '';
        if (msg.includes('Unique constraint')) {
            res.status(409).json({ error: 'Email or phone already registered' });
        }
        else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});
router.post('/login', async (req, res) => {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) {
        res.status(400).json({ error: 'password and email or phone are required' });
        return;
    }
    try {
        const user = await prisma.user.findFirst({
            where: email ? { email } : { phone },
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = (0, auth_1.signToken)(user.id, user.role);
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch {
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/me', async (req, res) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const jwt = await Promise.resolve().then(() => __importStar(require('jsonwebtoken')));
        const SECRET = process.env.JWT_SECRET || 'edubloom_secret_2024';
        const payload = jwt.default.verify(header.slice(7), SECRET);
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});
exports.default = router;
