"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate);
// Teacher: get own schedules
// Student: get own schedules
router.get('/', async (req, res) => {
    if (req.userRole === 'teacher') {
        const schedules = await prisma.schedule.findMany({
            where: { teacherId: req.userId },
            include: {
                students: { include: { student: { include: { user: { select: { name: true } } } } } },
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });
        res.json(schedules);
    }
    else {
        const student = await prisma.student.findUnique({ where: { userId: req.userId } });
        if (!student) {
            res.json([]);
            return;
        }
        const rows = await prisma.scheduleStudent.findMany({
            where: { studentId: student.id },
            include: {
                schedule: { include: { teacher: { select: { name: true } } } },
            },
        });
        res.json(rows.map(r => r.schedule));
    }
});
// Teacher: create schedule
router.post('/', auth_1.requireTeacher, async (req, res) => {
    const { subject, dayOfWeek, startTime, endTime, room, studentIds } = req.body;
    if (!subject || !dayOfWeek || !startTime || !endTime) {
        res.status(400).json({ error: 'subject, dayOfWeek, startTime, endTime required' });
        return;
    }
    const schedule = await prisma.schedule.create({
        data: {
            teacherId: req.userId,
            subject,
            dayOfWeek,
            startTime,
            endTime,
            room: room || null,
            students: studentIds?.length
                ? { create: studentIds.map((id) => ({ studentId: id })) }
                : undefined,
        },
    });
    res.json(schedule);
});
// Teacher: update schedule
router.put('/:id', auth_1.requireTeacher, async (req, res) => {
    const id = parseInt(req.params.id);
    const existing = await prisma.schedule.findFirst({ where: { id, teacherId: req.userId } });
    if (!existing) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    const { subject, dayOfWeek, startTime, endTime, room, studentIds } = req.body;
    const schedule = await prisma.schedule.update({
        where: { id },
        data: {
            subject: subject ?? existing.subject,
            dayOfWeek: dayOfWeek ?? existing.dayOfWeek,
            startTime: startTime ?? existing.startTime,
            endTime: endTime ?? existing.endTime,
            room: room !== undefined ? room : existing.room,
        },
    });
    if (studentIds !== undefined) {
        await prisma.scheduleStudent.deleteMany({ where: { scheduleId: id } });
        if (studentIds.length) {
            await prisma.scheduleStudent.createMany({
                data: studentIds.map((sid) => ({ scheduleId: id, studentId: sid })),
            });
        }
    }
    res.json(schedule);
});
// Teacher: delete schedule
router.delete('/:id', auth_1.requireTeacher, async (req, res) => {
    const id = parseInt(req.params.id);
    const existing = await prisma.schedule.findFirst({ where: { id, teacherId: req.userId } });
    if (!existing) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    await prisma.schedule.delete({ where: { id } });
    res.json({ ok: true });
});
exports.default = router;
