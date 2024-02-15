//brand Schema
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const BrandSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        image: {
            type: String,
            default: "https://unsplash.com/photos/fZ2frS7Vxkc",
            required: true,
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    {
        timestamps: true
    }
);
// Compile to form the Schema
const Brand = mongoose.model("Brand", BrandSchema);

export default Brand;