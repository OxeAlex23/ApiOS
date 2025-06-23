import express from 'express';
const router = express.Router();
import userRoutes from './user.routes';

router.use('/user', userRoutes);

module.exports = router;