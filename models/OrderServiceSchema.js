import mongoose from "mongoose";

const OrderServiceSchema = new mongoose.Schema({
    OrderId: {type: mongoose.Types.ObjectId, ref: "Order", required: true},
    ServiceId: {type: mongoose.Types.ObjectId, ref: "Services", required: true},
    Quantity: Number
});

export default mongoose.model('OrderService', OrderServiceSchema);