import asyncHandler from "express-async-handler";
import Color from "../model/Color.js";


//@desc - Create new Color
//@route - POST/api/v1/categories
//@access - Private/Admin

export const createColorCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    //color exist
    const colorFound = await Color.findOne({ name });
    if (colorFound) {
        throw new Error('Brand Already Exists')
    }

    // Create color
    const color = await Color.create({
        name: name.toLowerCase(),
        user: req.userAuthId,
    });
    res.send({
        status: "Success",
        mesage: "Brand Created Successfully",
        color,
    });
});


//@desc - Get all color
//@route - GET/api/v1/color
//@access - Public

export const getAllColorsCtrl = asyncHandler(async (req, res) => {
    const colors = await Color.find();

    res.json({
        status: "Success",
        messagge: "Brand find Successfully",
        colors,
    });
});

//@desc - Get single color
//@route - GET/api/v1/colors/:id
//@access - Public

export const getSingleColorCtrl = asyncHandler(async (req, res) => {
    const color = await Color.findById(req.params.id);
    res.json({
        status: "Success",
        message: "Brand fetched successfully",
        color,
    });
});

//@desc - update color
//@route - PUT/api/v1/colors/:id
//@access - Public

export const updateColorCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body
    //Update color here
    const color = await Color.findByIdAndUpdate(
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
        color,
    });
});

//@desc - Delete color
//@route - PUT/api/v1/colors/:id
//@access - Public

export const deleteColorCtrl = asyncHandler(async (req, res) => {
    await Color.findByIdAndDelete(req.params.id);
    res.json({
        status: "Success",
        message: "Color Deleted Successfully",
    });
});