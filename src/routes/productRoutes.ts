import express, { RequestHandler } from 'express';
import { createProduct, getProducts, tryOnClothes } from '../controllers/productController';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', upload.single('image'), createProduct as RequestHandler);
router.post('/try-on', upload.single('selfie'), tryOnClothes as RequestHandler);
router.get('/', getProducts);

export default router; 