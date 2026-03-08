import mongoose from "mongoose";

const OrderStatusSchema = new mongoose.Schema({
    OrderStatusDesc: {type: String, required: true},
    BusinessId: {type: mongoose.Types.ObjectId, ref: 'Business', required: true},
    ShowOnBoard: {type: Boolean, default: false},
    IsEditable: {type: Boolean, default: true},
    DisplayOrder: {type: Number, default: 1},
}, 
    {timestamps: true}
);

export default mongoose.model('OrderStatus', OrderStatusSchema)
