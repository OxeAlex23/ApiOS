import OrderService from '../models/OrderServiceSchema.js';
import Order from '../models/OrderSchema.js';

export const calculateServiceTotal = async (orderId) => {
    try {
        const orderSevices = await OrderService.find({ OrderId: orderId }).populate('ServiceId');
        const order = await Order.findOne(orderId);
        if (!order) {
            throw new Error('Ordem não encontrada');
        }

         const discount = order.DiscountAmount || 0;

         let total = 0;
        orderSevices.forEach(orderService => {
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
        console.error('Erro ao calcular total da ordem:', err);
        throw err;
    }
}