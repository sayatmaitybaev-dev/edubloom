"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate, auth_1.requireTeacher);
// Get all students for this teacher
router.get('/', async (req, res) => {
    const students = await prisma.student.findMany({
        where: { teacherId: req.userId },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
    res.json(students.map(s => ({ id: s.id, userId: s.userId, name: s.user.name, email: s.user.email, phone: s.user.phone })));
});
// Add existing user as student to this teacher
router.post('/', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        res.status(400).json({ error: 'userId required' });
        return;
    }
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'student') {
            res.status(404).json({ error: 'Student user not found' });
            return;
        }
        const existing = await prisma.student.findUnique({ where: { userId } });
        if (existing) {
            res.status(409).json({ error: 'Student already added' });
            return;
        }
        const student = await prisma.student.create({
            data: { userId, teacherId: req.userId },
        });
        res.json(student);
    }
    catch {
        res.status(500).json({ error: 'Server error' });
    }
});
// Remove student
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const student = await prisma.student.findFirst({ where: { id, teacherId: req.userId } });
    if (!student) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    await prisma.student.delete({ where: { id } });
    res.json({ ok: true });
});
exports.default = router;
