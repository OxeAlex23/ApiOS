import express from 'express';
const router = express.Router();
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import compraRoutes from './compra.routes.js'

router.use('/user', userRoutes);
router.use('/products', productRoutes);
router.use('/compras', compraRoutes);

export default router;