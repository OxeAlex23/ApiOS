import mongoose from "mongoose";

const ServicesSchema = new mongoose.Schema({
    BusinessId: {type: mongoose.Types.ObjectId, ref: 'Business', required: true},
    ServiceName: String,
    ServiceDescription: String,
    BasePrice: Number,
    ServiceImgUrl: String,
    IsActive: {type: Boolean, default: true}
});

export default mongoose.model('Services', ServicesSchema); 