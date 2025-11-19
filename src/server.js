import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/userRoutes.js';
import authRouter from './routes/authRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import { query } from './db/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // this is to tell backend that which is your frontend to whom i will connect
app.use(express.json());  // parse json data
app.use(express.urlencoded({ extended: true })); // form data

app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'unreachable', error: err.message });
  }
});

app.use('/users', usersRouter); //. http://localhost:3000/users
app.use('/auth', authRouter); // http://localhost:3000/auth
app.use('/admin', adminRouter); // http://localhost:3000/admin

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});