import asyncHandler from "express-async-handler";
import Product from "../model/Product.js"
import Category from "../model/Category.js";
import Brand from "../model/Brand.js";

// @desc - Create new product
// @route - POST/api/v1/products
//@access - Private/Admin

export const createProductCtrl = asyncHandler
    (async (req, res) => {

        const convertedImgs = req.files.map((file)=> file.path);
        const { name,
            description,
            category,
            sizes,
            colors,
            price,
            totalQty,
            brand
        } = req.body;

        // Product Exist
        const productExists = await Product.findOne({ name });
        if (productExists) {
            throw new Error("Product Already Exists");

        }
        //find the brand
        const brandFound = await Brand.findOne({
            name: brand?.toLowerCase(),
        });
        if (!brandFound) {
            throw new Error(
                "Brand not Fonud , please create brand first or check brand name"
            );
        }
        //find the category
        const categoryFound = await Category.findOne({
            name: category,
        });
        if (!categoryFound) {
            throw new Error(
                "Category not Fonud , please create category first or check category name"
            );
        }
        //create Product
        const product = await Product.create({
            name,
            description,
            brand,
            category,
            sizes,
            colors,
            user: req.userAuthId,
            price,
            totalQty,
            brand,
            images: convertedImgs,
        });
        //push the product into category
        categoryFound.products.push(product._id);
        //Resave
        await categoryFound.save();

        //push the product into brand
        brandFound.products.push(product._id);
        //Resave
        await brandFound.save();
        //send response
        res.json({
            status: "Success",
            message: "Product created successfully",
            product,
        });


    });


//@desc - Get all products
//@route - GET/api/v1/products
//@access- Public

export const getProductsCtrl = asyncHandler(async (req, res) => {
    // console.log(req.query);
    //query
    let productQuery = Product.find();
    // console.log(productQuery);

    // search by name
    if (req.query.name) {
        productQuery = productQuery.find({
            name: { $regex: req.query.name, $options: "i" },
        });
    }

    // search by brand
    if (req.query.brand) {
        productQuery = productQuery.find({
            brand: { $regex: req.query.brand, $options: "i" },
        });
    }

    // search by category
    if (req.query.category) {
        productQuery = productQuery.find({
            category: { $regex: req.query.category, $options: "i" },
        });
    }
    // search by colors
    if (req.query.colors) {
        productQuery = productQuery.find({
            colors: { $regex: req.query.colors, $options: "i" },
        });
    }
    // search by sizes
    if (req.query.sizes) {
        productQuery = productQuery.find({
            sizes: { $regex: req.query.sizes, $options: "i" },
        });
    }
    //filter by price range
    if (req.query.price) {
        const priceRange = req.query.price.split("-");
        //gte: greater than or equal
        //lte: less than or equal
        productQuery = productQuery.find({
            price: { $gte: priceRange[0], $lte: priceRange[1] },
        });
    }

    //PAGINATION
    //Page
    const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    //Limit
    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
    //start index
    const startIndex = (page - 1) * limit;
    //End index
    const endIndex = page * limit;
    //total product
    const total = await Product.countDocuments();
    productQuery = productQuery.skip(startIndex).limit(limit);

    //PAGINATION
    const pagination = {}
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit,
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit,
        };
    }

    // await the query
    const products = await productQuery.populate("reviews");
    // console.log(products);

    res.json({
        status: "Success",
        total,
        results: products.length,
        pagination,
        message: "Product Fetched Successfully",
        products,
    });
});

//@desc - Get Single Product
//@route - GET/api/v1/products/:id
//@access - Public

export const getProductCtrl = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate("reviews");
    if (!product) {
        throw new Error("Product Not Found");
    }
    res.json({
        status: "Success",
        message: "Product Fetched Successfully",
        product,
    });
});

//@desc - update product
//@route - PUT/api/products/:id/update
//@access - Private/Admin

export const updateProductCtrl = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        brand,
        category,
        sizes,
        colors,
        user,
        price,
        totalQty,
    } = req.body
    //Update product here
    const product = await Product.findByIdAndUpdate(req.params.id, {
        name,
        description,
        brand,
        category,
        sizes,
        colors,
        user,
        price,
        totalQty,
    },
        {
            new: true,
        }
    )
    res.json({
        status: "Success",
        message: "Product Updated Successfully",
        product,
    });
});

//@desc - delete product
// @route - DELETE/api/products/:id/delete
//@access - Private/Admin

export const deleteProductCtrl = asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({
        status: "Success",
        message: "Product Deleted Successfully",
    });
});
