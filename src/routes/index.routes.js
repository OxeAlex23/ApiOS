import express from 'express';
const router = express.Router();

import userRoutes from '../modules/user/user.routes.js';
import productRoutes from '../modules/product/product.routes.js';
import orderProductRoutes from '../modules/order/orderProduct.routes.js';
import businessRoutes from '../modules/business/business.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import orderTrackRoutes from '../modules/order/orderTrack.routes.js';
import serviceRoutes from '../modules/service/service.routes.js';
import orderServiceRoutes from '../modules/order/orderService.routes.js';
import customerRoutes from '../modules/customer/customer.routes.js';
import productCategoryRoutes from '../modules/product/productCategory.routes.js';
import orderStatusRoutes from '../modules/order/orderStatus.routes.js';
import businessUserRoleRoutes from '../modules/business/businessUserRole.routes.js';
import businessUserRoutes from '../modules/business/businessUser.routes.js';
import userTypeRoutes from '../modules/user/userType.routes.js';
import employeeRoutes from '../modules/employee/employee.routes.js';

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orderProducts', orderProductRoutes);
router.use('/business', businessRoutes);
router.use('/orders', orderRoutes);
router.use('/orderTracks', orderTrackRoutes);
router.use('/services', serviceRoutes);
router.use('/orderServices', orderServiceRoutes);
router.use('/customers', customerRoutes);
router.use('/productsCategory', productCategoryRoutes);
router.use('/ordersStatus', orderStatusRoutes);
router.use('/businessUserRole', businessUserRoleRoutes);
router.use('/businessUsers', businessUserRoutes);
router.use('/userTypes', userTypeRoutes);
router.use('/employees', employeeRoutes);

export default router;