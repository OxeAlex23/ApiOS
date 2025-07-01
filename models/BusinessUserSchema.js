import mongoose from "mongoose";

const BusinessUserSchema = new mongoose.Schema({
    UserId: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    BusinessId: {type: mongoose.Types.ObjectId, ref: 'Business', required: true},
});

export default mongoose.model('BusinessUser', BusinessUserSchema );