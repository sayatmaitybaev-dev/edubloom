"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireTeacher = requireTeacher;
exports.signToken = signToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || 'edubloom_secret_2024';
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const token = header.slice(7);
        const payload = jsonwebtoken_1.default.verify(token, SECRET);
        req.userId = payload.userId;
        req.userRole = payload.role;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
function requireTeacher(req, res, next) {
    if (req.userRole !== 'teacher') {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }
    next();
}
function signToken(userId, role) {
    return jsonwebtoken_1.default.sign({ userId, role }, SECRET, { expiresIn: '7d' });
}
