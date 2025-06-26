import mongoose from "mongoose";

const OrderProductSchema = new mongoose.Schema({
   OrderId: {type: mongoose.Types.ObjectId, ref: 'OrderSchema', required: true},
   ProductId: {type: mongoose.Types.ObjectId, ref: 'ProductSchema', required: true},
   Quantity: Number
});

export default mongoose.model('OrderProductSchema', OrderProductSchema);