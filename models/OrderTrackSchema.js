import mongoose from "mongoose";

const OrderTrackSchema = new mongoose.Schema({
    OrderId: {type: mongoose.Types.ObjectId, ref: 'Order' ,required: true},
    OrderStatusId: {type: mongoose.Types.ObjectId, ref: 'OrderStatus', required: true},
    TrackCode: {type: String},
    Title: String,
    Description: String,
    Date: {type: Date, default: Date.now}
});

export default mongoose.model('OrderTrack', OrderTrackSchema);