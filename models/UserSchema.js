import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  UserTypeId: { type: Number, required: true },
  FirstName: { type: String, required: true },
  LastName: String,
  UserImgUrl: String,
  PhoneNumber: String,
  PhoneVerified: Boolean,
  EmailAddress: {type: String, unique: true, sparse: true, lowercase: true,},
  EmailVerified: Boolean,
  CPF: {type: String, unique: true, sparse: true},
  role: { type: String, enum: ['admin', 'employee', 'client'], default: 'employee' },
  businessId: { type: mongoose.Types.ObjectId, ref: 'Business'},
  Active: { type: Boolean, default: true },
  CreatedAt: { type: Date, default: Date.now }
});


export default mongoose.model('User', userSchema);