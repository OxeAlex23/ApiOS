import OrderService from '../models/OrderServiceSchema.js';
import Order from '../models/OrderSchema.js';

export const calculateServiceTotal = async (orderId) => {
    try {
        const orderServices = await OrderService.find({ OrderId: orderId }).populate('ServiceId');
        const order = await Order.findOne(orderId);
        if (!order) {
            throw new Error('Order Not Found');
        }

         const discount = order.DiscountAmount || 0;

         let total = 0;
        orderServices.forEach(orderService => {
           const price = orderService.ServiceId?.BasePrice || 0;
            const quantity = orderService.Quantity || 1;
            total += price * quantity;
            
        });

         let applyDiscount = total - discount;
        if (applyDiscount < 0) {
            applyDiscount = 0;
        }

         const updateOrder = await Order.findByIdAndUpdate( orderId,{ TotalAmount: applyDiscount },{ new: true } );
         return updateOrder;
    } catch (err) {
        console.error('Error calculating order total: ', err);
        throw err;
    }
}