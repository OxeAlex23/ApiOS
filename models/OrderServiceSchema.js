import mongoose from "mongoose";

const OrderServiceSchema = new mongoose.Schema({
    OrderId: {type: mongoose.Types.ObjectId, ref: "OrderSchema", required: true},
    ServiceId: {type: mongoose.Types.ObjectId, ref: "ServicesSchema", required: true},
    Quantity: Number
});

export default mongoose.model('OrderServiceSchema', OrderServiceSchema);