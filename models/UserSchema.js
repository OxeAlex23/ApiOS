import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  DefaultBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null},
  UserTypeId: { type: Number, required: true },
  FirstName: { type: String, required: true },
  LastName: String,
  UserImgUrl: String,
  PhoneNumber: String,
  PhoneVerified: Boolean,
  EmailAddress: { type: String, unique: true, sparse: true, lowercase: true, },
  EmailVerified: Boolean,
  CPF: { type: String, unique: true, sparse: true },
  Role: { type: String, enum: ['master', 'admin', 'employee'], default: 'employee' },
  BirthDate: { type: Date, required: true },
  Gender: { type: String, enum: ['M', 'F', 'U']},
  Password: { type: String },
  GoogleId: { type: String },
  Active: { type: Boolean, default: true },
  CreatedAt: { type: Date, default: Date.now }
});


export default mongoose.model('User', userSchema);