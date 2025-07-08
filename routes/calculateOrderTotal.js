import OrderProduct from "../models/OrderProductSchema.js";
import Order from "../models/OrderSchema.js";

export const calculateOrderTotal = async (orderId) => {
    try {

        const orderProducts = await OrderProduct.find({ OrderId: orderId }).populate('ProductId');


        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Ordem não encontrada');
        }

        const discount = order.DiscountAmount || 0;

        let total = 0;
        orderProducts.forEach(orderProduct => {
            const price = orderProduct.ProductId?.UnitPrice || 0;
            const quantity = orderProduct.Quantity || 1;
            total += price * quantity;
        });

        let applyDiscount = total - discount;
        if (applyDiscount < 0) {
            applyDiscount = 0;
        }


        const updateOrder = await Order.findByIdAndUpdate(
            orderId,
            { TotalAmount: applyDiscount },
            { new: true }
        );

        return updateOrder;
    } catch (error) {
        console.error('Erro ao calcular total da ordem:', error);
        throw error;
    }
};
