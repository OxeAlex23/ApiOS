import mongoose from "mongoose";
import Order from './OrderSchema.js';
import Product from './ProductSchema.js';

const OrderProductSchema = new mongoose.Schema({
   OrderId: {type: mongoose.Types.ObjectId, ref: 'Order', required: true},
   ProductId: {type: mongoose.Types.ObjectId, ref: 'Product', required: true},
   Quantity: Number
});


async function calculateOrderTotal(orderId) {
  const orderProducts = await mongoose.model('OrderProduct').find({ OrderId: orderId }).populate('ProductId');
  
  let total = 0;
  orderProducts.forEach(item => {
    const price = item.ProductId.BasePrice || 0;
    total += price * item.Quantity;
  });

  await Order.findByIdAndUpdate(orderId, { TotalAmount: total });
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

export default mongoose.model('OrderProduct', OrderProductSchema);