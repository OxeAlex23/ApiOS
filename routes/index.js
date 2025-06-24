import express from 'express';
const router = express.Router();
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';

router.use('/user', userRoutes);
router.use('/products', productRoutes);
export default router;