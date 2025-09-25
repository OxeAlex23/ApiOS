import mongoose from "mongoose";
import { calculateServiceTotal } from "../routes/calculateServiceTotal.js";

const OrderServiceSchema = new mongoose.Schema({
  OrderId: { type: mongoose.Types.ObjectId, ref: "Order", required: true },
  ServiceId: { type: mongoose.Types.ObjectId, ref: "Services", required: true },
  Quantity: { type: Number },
  UnitPriceAtOrder: { type: Number }
});


OrderServiceSchema.post('save', async function (doc, next) {
  await calculateServiceTotal(doc.OrderId);
  next();
});

OrderServiceSchema.post('findOneAndUpdate', async function (doc, next) {
  if (doc) {
    await calculateServiceTotal(doc.OrderId);
  }
  next();
});

OrderServiceSchema.post('insertMany', async function (docs) {
  if (docs.length > 0) {
    await calculateServiceTotal(docs[0].OrderId);
  }
});

OrderServiceSchema.post('deleteOne', { document: true, query: false }, async function () {
  await calculateServiceTotal(this.OrderId);
});

export default mongoose.model('OrderService', OrderServiceSchema);