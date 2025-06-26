import mongoose from "mongoose";

const BusinessUserSchema = new mongoose.Schema({
    UserId: {type: mongoose.Types.ObjectId, ref: 'UserSchema', required: true},
    BusinessId: {type: mongoose.Types.ObjectId, ref: 'BusinessSchema', required: true},
});

export default mongoose.model('BusinessUserSchema', BusinessUserSchema );