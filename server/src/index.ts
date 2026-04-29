import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import studentsRouter from './routes/students';
import scheduleRouter from './routes/schedule';
import homeworkRouter from './routes/homework';
import gradesRouter from './routes/grades';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/grades', gradesRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
