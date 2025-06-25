import express from 'express';
const router = express.Router();
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import compraRoutes from './compra.routes.js';
import businessRoutes from './business.routes.js';
import orderRoutes from './order.routes.js';
import orderteackRoutes from './orderTrack.routes.js';

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/compras', compraRoutes);
router.use('/business', businessRoutes);
router.use('/orders', orderRoutes);
router.use('/orderTracks', orderteackRoutes);

export default router;