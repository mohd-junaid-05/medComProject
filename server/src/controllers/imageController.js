import prisma from '../config/prismaClient.js';

export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const doctorId = req.doctor.id;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const medicalPrompt = `Medical illustration: ${prompt}. Professional, clinical, educational style.`;

    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: medicalPrompt }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('HF Error:', error);
      return res.status(500).json({ error: 'Image generation failed. Try again in a moment.' });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    const savedImage = await prisma.generatedImage.create({
      data: { prompt, imageUrl, doctorId },
    });

    res.status(201).json({
      message: 'Image generated successfully.',
      image: savedImage,
    });
  } catch (err) {
    console.error('Generate image error:', err);
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
    if (!image) return res.status(404).json({ error: 'Image not found.' });
    if (image.doctorId !== doctorId) return res.status(403).json({ error: 'Not authorized.' });
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
    const where = category && category !== 'all'
      ? { prompt: { contains: category, mode: 'insensitive' } }
      : {};
    const images = await prisma.generatedImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { doctor: { select: { name: true, specialization: true } } },
    });
    res.status(200).json({ images });
  } catch (err) {
    console.error('Get stock images error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};