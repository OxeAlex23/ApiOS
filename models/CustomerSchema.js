import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    BusinessId: {type: mongoose.Types.ObjectId, ref: 'Business', required: true},
    CustomerName: {type: String, required: true},
    Address: String,
    CustomerEmail: {type: String, required: true, unique: true},
    CustomerPhone: {type: String, required: true, unique: true},
    CustomerType: {type: String, enum: ['Individual', 'Company'], required: true},
    DocNumber: {type: String, required: true, unique: true}
});

export default mongoose.model('Customer', CustomerSchema);