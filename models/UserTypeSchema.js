import mongoose from "mongoose";

const UserTypeSchema = new mongoose.Schema({
    UserTypeDesc: { type: String, enum: ['admin', 'employee', 'client'], default: 'employee' }
});

export default mongoose.model('UserType', UserTypeSchema);