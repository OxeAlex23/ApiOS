import express from 'express';
const router = express.Router();
import userRoutes from './user.routes';
import productRoutes from './product.routes';

router.use('/user', userRoutes);
router.use('/products', productRoutes);

module.exports = router;