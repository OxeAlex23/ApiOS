import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema({
    ProductName: {type: String, required: true},
    ProductDescription: String,
    ProductCategoryId: {type: mongoose.Types.ObjectId, ref: "ProductCategory"},
    UnitPrice: Number,
    StockQuantity: Number,
    Sku: Number,
    ProductImgUrl: String,
    WeightGrams: Number,
    DimensionsCm: String,
    IsActive: Boolean,
    BusinessId: {type: mongoose.Types.ObjectId, ref: "Business"}
});

export default mongoose.model('Product', productSchema);