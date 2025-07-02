import OrderProduct from "../models/OrderProductSchema.js";
import Product from '../models/ProductSchema.js';
import Order from "../models/OrderSchema.js";

export const calculateOrderTotal = async (orderId) => {
    const orderProducts = await OrderProduct.find({OrderId: orderId}).populate('ProductId');

    let total = 0;
    orderProducts.forEach(orderProduct => {
        const price = orderProduct.ProductId.BasePrice || 0;
        const quantity = orderProduct.Quantity || 1;
        total += price * quantity;
    });

    const updateOrder = await Order.findByIdAndUpdate(orderId, {TotalAmount: total}, {new: true});
    return updateOrder;
}