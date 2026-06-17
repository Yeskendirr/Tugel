import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Маршруттар осында қосылады
// app.use('/api/auth', authRoutes);
// app.use('/api/equipment', equipmentRoutes);
// app.use('/api/rooms', roomRoutes);
// app.use('/api/categories', categoryRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Сервер ${PORT} портта іске қосылды`);
});
