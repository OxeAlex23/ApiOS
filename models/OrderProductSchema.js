import mongoose from "mongoose";

const OrderProductSchema = new mongoose.Schema({
   OrderId: {type: mongoose.Types.ObjectId, ref: 'Order', required: true},
   ProductId: {type: mongoose.Types.ObjectId, ref: 'Product', required: true},
   Quantity: Number
});

export default mongoose.model('OrderProduct', OrderProductSchema);