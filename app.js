import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import compraRoutes from './routes/compra.routes.js';
import businessRoutes from './routes/business.routes.js';
import orderRoutes from './routes/order.routes.js';
import orderTrackRoutes from './routes/orderTrack.routes.js';

const app = express();
app.use(express.json());

app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/compras', compraRoutes);
app.use('/business', businessRoutes);
app.use('/orders', orderRoutes);
app.use('/orderTracks', orderTrackRoutes);

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@alex0.xoui1gx.mongodb.net/?retryWrites=true&w=majority&appName=Alex0`).then(() => {
    app.listen(process.env.PORT);
    console.log('connected to data base!');
}).catch (err => console.error(err)); 