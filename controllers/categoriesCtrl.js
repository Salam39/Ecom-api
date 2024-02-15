import asyncHandler from "express-async-handler";
import Category from "../model/Category.js";

//@desc - Create new Category
//@route - POST/api/v1/categories
//@access - Private/Admin

export const createCategoryCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    //category exist
    const categoryFound = await Category.findOne({ name });
    if (categoryFound) {
        throw new Error('Category Already Exists')
    }

    // Create Category
    const category = await Category.create({
        name: name.toLowerCase(),
        user: req.userAuthId,
        image: req.file.path,
    });
    res.send({
        status: "Success",
        mesage: "Category Created Successfully",
        category,
    });
});


//@desc - Get all categories
//@route - GET/api/v1/categories
//@access - Public

export const getAllCategoriesCtrl = asyncHandler(async (req, res) => {
    const categories = await Category.find();

    res.json({
        status: "Success",
        messagge: "Category find Successfully",
        categories,
    });
});

//@desc - Get single categories
//@route - GET/api/v1/categories/:id
//@access - Public

export const getSingleCategoryCtrl = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    res.json({
        status: "Success",
        message: "Category fetched successfully",
        category,
    });
});

//@desc - update categories
//@route - PUT/api/v1/categories/:id
//@access - Public

export const updateCategoryCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body
    //Update category here
    const category = await Category.findByIdAndUpdate(
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
        message: "Category Updated Successfully",
        category,
    });
});

//@desc - Delete categories
//@route - PUT/api/v1/categories/:id
//@access - Public

export const deleteCategoryCtrl = asyncHandler(async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({
        status: "Success",
        message: "Category Deleted Successfully",
    });
});