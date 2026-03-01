import express from 'express';
import {
  generateImage,
  getMyImages,
  deleteImage,
  getStockImages,
} from '../controllers/imageController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', authMiddleware, generateImage);
router.get('/my-images', authMiddleware, getMyImages);
router.delete('/:id', authMiddleware, deleteImage);
router.get('/stock', authMiddleware, getStockImages);

export default router;
