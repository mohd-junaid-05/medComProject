import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingDoctor = await prisma.doctor.findUnique({ where: { email } });
    if (existingDoctor) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const doctor = await prisma.doctor.create({
      data: {
        name,
        email,
        password: hashedPassword,
        specialization,
      },
    });

    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, name: doctor.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const doctor = await prisma.doctor.findUnique({ where: { email } });
    if (!doctor) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, name: doctor.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.doctor.id },
      select: { id: true, name: true, email: true, specialization: true, createdAt: true },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    res.status(200).json({ doctor });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
