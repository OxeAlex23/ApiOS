import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    UserTypeId: {type: Number, required: true},
    FirstName: String,
    LastName: String,
    UserImgUrl: String,
    PhoneNumber: String,
    PhoneVerified: Boolean,
    EmailAddress: String,
    EmailVerified: Boolean,
    CPF: String,
    role:{type: String, enum: ['admin', 'employee', 'client'], default: 'employee'},
    businessId: {type: mongoose.Types.ObjectId, ref: 'BusinessSchema'},
    Active: Boolean,
    CreatedAt: {type: Date, default: Date.now}
});

export default mongoose.model('User', userSchema);