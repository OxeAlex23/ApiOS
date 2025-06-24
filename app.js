import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import userRoutes from './routes/user.routes.js';
import productRoute from './routes/product.routes.js';

const app = express();
app.use(express.json());

app.use('/users', userRoutes);
app.use('products', productRoute);

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@alex0.xoui1gx.mongodb.net/?retryWrites=true&w=majority&appName=Alex0`).then(() => {
    app.listen(process.env.PORT);
    console.log('connected to data base!');
}).catch (err => console.error(err)); 