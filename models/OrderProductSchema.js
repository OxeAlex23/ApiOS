import mongoose from "mongoose";
import Order from './OrderSchema.js';
import Product from './ProductSchema.js';


const OrderProductSchema = new mongoose.Schema({
  OrderId: { type: mongoose.Types.ObjectId, ref: 'Order', required: true },
  ProductId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
  Quantity: { type: Number, default: 1 }
});


async function calculateOrderTotal(orderId) {
  try {
    const orderProducts = await OrderProduct.find({ OrderId: orderId }).populate('ProductId');

    let total = 0;
    orderProducts.forEach(item => {
      const price = item.ProductId?.BasePrice || 0;
      total += price * item.Quantity;
    });

    await Order.findByIdAndUpdate(orderId, { TotalAmount: total });
  } catch (error) {
    console.error('Erro ao calcular total do pedido:', error);
  }
}

OrderProductSchema.post('save', async function (doc, next) {
  await calculateOrderTotal(doc.OrderId);
  next();
});


OrderProductSchema.post('findOneAndUpdate', async function (doc, next) {
  if (doc) {
    await calculateOrderTotal(doc.OrderId);
  }
  next();
});


OrderProductSchema.post('insertMany', async function (docs) {
   console.log('HOOK: insertMany acionado!', docs.length);
  if (docs.length > 0) {
    await calculateOrderTotal(docs[0].OrderId);
  }
});


OrderProductSchema.post('deleteOne', { document: true, query: false }, async function () {
  await calculateOrderTotal(this.OrderId);
});

const OrderProduct = mongoose.model('OrderProduct', OrderProductSchema);
export default OrderProduct;
