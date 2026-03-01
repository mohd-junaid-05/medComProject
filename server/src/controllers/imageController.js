import OpenAI from 'openai';
import prisma from '../config/prismaClient.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const doctorId = req.doctor.id;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const medicalPrompt = `Medical illustration: ${prompt}. Professional, clinical, educational style.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: medicalPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = response.data[0].url;

    const savedImage = await prisma.generatedImage.create({
      data: {
        prompt,
        imageUrl,
        doctorId,
      },
    });

    res.status(201).json({
      message: 'Image generated successfully.',
      image: savedImage,
    });
  } catch (err) {
    console.error('Generate image error:', err);
    if (err.code === 'invalid_api_key') {
      return res.status(401).json({ error: 'Invalid OpenAI API key.' });
    }
    res.status(500).json({ error: 'Failed to generate image. Please try again.' });
  }
};

export const getMyImages = async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    const images = await prisma.generatedImage.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ images });
  } catch (err) {
    console.error('Get images error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor.id;

    const image = await prisma.generatedImage.findUnique({ where: { id } });

    if (!image) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    if (image.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Not authorized to delete this image.' });
    }

    await prisma.generatedImage.delete({ where: { id } });

    res.status(200).json({ message: 'Image deleted successfully.' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getStockImages = async (req, res) => {
  try {
    const { category } = req.query;

    const where = category && category !== 'all' ? { prompt: { contains: category, mode: 'insensitive' } } : {};

    const images = await prisma.generatedImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: { name: true, specialization: true },
        },
      },
    });

    res.status(200).json({ images });
  } catch (err) {
    console.error('Get stock images error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
