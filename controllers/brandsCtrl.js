import asyncHandler from "express-async-handler";
import Brand from "../model/Brand.js";


//@desc - Create new Brand
//@route - POST/api/v1/categories
//@access - Private/Admin

export const createBrandCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    //brand exist
    const brandFound = await Brand.findOne({ name });
    if (brandFound) {
        throw new Error('Brand Already Exists')
    }

    // Create brand
    const brand = await Brand.create({
        name: name.toLowerCase(),
        user: req.userAuthId,
    });
    res.send({
        status: "Success",
        mesage: "Brand Created Successfully",
        brand,
    });
});


//@desc - Get all brand
//@route - GET/api/v1/brands
//@access - Public

export const getAllBrandsCtrl = asyncHandler(async (req, res) => {
    const brands = await Brand.find();

    res.json({
        status: "Success",
        messagge: "Brand find Successfully",
        brands,
    });
});

//@desc - Get single brand
//@route - GET/api/v1/brands/:id
//@access - Public

export const getSingleBrandCtrl = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    res.json({
        status: "Success",
        message: "Brand fetched successfully",
        brand,
    });
});

//@desc - update brand
//@route - PUT/api/v1/brands/:id
//@access - Public

export const updateBrandCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body
    //Update brand here
    const brand = await Brand.findByIdAndUpdate(
        req.params.id,
        {
            name,
        },
        {
            new: true,
        }
    )
    res.json({
        status: "Success",
        message: "Brand Updated Successfully",
        brand,
    });
});

//@desc - Delete brand
//@route - PUT/api/v1/brands/:id
//@access - Public

export const deleteBrandCtrl = asyncHandler(async (req, res) => {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({
        status: "Success",
        message: "Brand Deleted Successfully",
    });
});