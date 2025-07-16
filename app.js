import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import orderProductRoutes from './routes/orderProduct.routes.js'
import businessRoutes from './routes/business.routes.js';
import orderRoutes from './routes/order.routes.js';
import orderTrackRoutes from './routes/orderTrack.routes.js';
import serviceRoutes from './routes/services.routes.js';
import orderServiceRoutes from './routes/orderService.routes.js';
import customerRoutes from './routes/customer.routes.js';
import productCategoryRoutes from './routes/productCategory.routes.js';
import orderStatusRoutes from './routes/orderStatus.routes.js';
import businessUserRoleRoutes from './routes/businessUserRole.routes.js';
import businessUserRoutes from './routes/businessUser.routes.js';
import userTypeRoutes from './routes/userType.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orderProducts', orderProductRoutes);
app.use('/business', businessRoutes);
app.use('/orders', orderRoutes);
app.use('/orderTracks', orderTrackRoutes);
app.use('/services', serviceRoutes);
app.use('/orderServices', orderServiceRoutes);
app.use('/customers', customerRoutes);
app.use('/productsCategory', productCategoryRoutes);
app.use('/ordersStatus', orderStatusRoutes);
app.use('/businessUserRole', businessUserRoleRoutes);
app.use('/businessUsers', businessUserRoutes);
app.use('/userTypes', userTypeRoutes);
app.use('/employees', employeeRoutes);

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@alex0.xoui1gx.mongodb.net/?retryWrites=true&w=majority&appName=Alex0`).then(() => {
    app.listen(process.env.PORT);
    console.log('connected to data base!');
}).catch (err => console.error(err)); 