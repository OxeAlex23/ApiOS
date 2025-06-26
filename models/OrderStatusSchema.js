import mongoose from "mongoose";

const OrderStatusSchema = new mongoose.Schema({
    OrderStatusDesc: {type: String, required: true}
});

export default mongoose.model('OrderStatusSchema', OrderStatusSchema)