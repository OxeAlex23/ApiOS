import mongoose from "mongoose";
import { calculateOrderTotal } from "../routes/calculateOrderTotal.js";


const OrderProductSchema = new mongoose.Schema({
  OrderId: { type: mongoose.Types.ObjectId, ref: 'Order', required: true },
  ProductId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
  Quantity: { type: Number, default: 1 },
  UnitPriceAtOrder: { type: Number }
});


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
  if (docs.length > 0) {
    await calculateOrderTotal(docs[0].OrderId);
  }
});

OrderProductSchema.post('deleteOne', { document: true, query: false }, async function () {
  await calculateOrderTotal(this.OrderId);
});

export default mongoose.model('OrderProduct', OrderProductSchema)