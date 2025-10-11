import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
  UserId: { type: mongoose.Types.ObjectId, ref: "User" },
  BusinessName: { type: String, required: true },
  FantasyName: { type: String, required: true },
  BusinessType: { type: String, required: true },
  CompanySize: { type: String, required: true },
  LegalNature: { type: String, required: true },
  FullAddress: { type: String, required: true },
  City: { type: String, required: true },
  Email: { type: String, required: true },
  Phone: { type: String, required: true },
  BusinessCode: { type: String, required: true },
  BusinessSituation: { type: String, required: true },
  IsMEI: { type: Boolean, required: true },
  Coordinates: { type: String },
  LogoImgUrl: { type: String },
  BrandPrimaryColor: {type: String},
  BrandSecondaryColor: {type: String},
  OwnerSignatureUrl: {type: String},
  ShowServicesProductsImages: {type: Boolean},
  OwnerName: {type: String},
  Instagram: {type: String},
  Facebook: {type: String},
  Twitter: {type: String},
  Tiktok: {type: String},
  CreateAt: { type: Date, default: Date.now },
  IsActive: { type: Boolean, default: true },
});

export default mongoose.model("Business", BusinessSchema);
