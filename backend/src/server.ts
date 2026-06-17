import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes      from './routes/auth';
import equipmentRoutes from './routes/equipment';
import roomRoutes      from './routes/rooms';
import categoryRoutes  from './routes/categories';
import inventoryRoutes from './routes/inventory';
import reportRoutes    from './routes/reports';
import userRoutes      from './routes/users';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',       authRoutes);
app.use('/api/equipment',  equipmentRoutes);
app.use('/api/rooms',      roomRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory',  inventoryRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/users',      userRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Сервер ${PORT} портта іске қосылды`));
