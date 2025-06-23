import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    UserId: {type: String, unique: true, required: true },
    UserTypeId: {type: Number, required: true},
    FirstName: String,
    LastName: String,
    UserImgUrl: String,
    PhoneNumber: String,
    PhoneVerified: Boolean,
    EmailAddress: String,
    EmailVerified: Boolean,
    CPF: String,
    Active: Boolean,
    CreatedAt: {type: Date, default: Date.now}
});

export default mongoose.model('User', userSchema);