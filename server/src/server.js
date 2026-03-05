import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, '../../client')));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/pages/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/pages/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/pages/register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/pages/dashboard.html'));
});

app.get('/stock', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/pages/stock.html'));
});
app.get('/generate', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/pages/generate.html'));
});


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 MedComm server running on http://localhost:${PORT}`);
});
