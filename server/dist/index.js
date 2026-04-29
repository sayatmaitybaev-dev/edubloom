"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const students_1 = __importDefault(require("./routes/students"));
const schedule_1 = __importDefault(require("./routes/schedule"));
const homework_1 = __importDefault(require("./routes/homework"));
const grades_1 = __importDefault(require("./routes/grades"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/students', students_1.default);
app.use('/api/schedule', schedule_1.default);
app.use('/api/homework', homework_1.default);
app.use('/api/grades', grades_1.default);
app.get('/api/health', (_req, res) => res.json({ ok: true }));
// Serve built frontend in production
const clientDist = path_1.default.join(__dirname, '../../client/dist');
app.use(express_1.default.static(clientDist));
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(clientDist, 'index.html'));
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
