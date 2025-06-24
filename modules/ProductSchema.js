import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema({
    ProductName: String,
    ProductDescription: String,
    ProductCategoryId: Number,
    UnitPrice: Number,
    StockQuantity: Number,
    Sku: Number,
    ProductImgUrl: String,
    WeightGrams: Number,
    DimensionsCm: String,
    IsActive: Boolean,
    BusinessId: Number
});

export default productSchema;