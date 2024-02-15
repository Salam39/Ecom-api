import User from "../model/User.js";
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import generateToken from "../utils/generateToken.js";
import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";


/* @desc - Register User
@route - POST/api/v1/users/register
@access - Private/Admin
Here we are going to create a user control for registration , profile ,updating profile
logging and logout 
*/

// export const regiterUserCtrl = async (req, res) => {
//     res.json({
//         msg: "User register controller",
//     });
//     /* This is only fro test that user are register or not */
// };


export const regiterUserCtrl = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;

    // Check user exists or not
    const userExists = await User.findOne({ email });
    if (userExists) {
        // thorw response
        // res.json({
        //     msg: "User already registered"
        // });
        throw new Error("User Already Exist");
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create the user
    const user = await User.create({
        fullname,
        email,
        password: hashedPassword,
    });
    res.status(201).json({
        status: 'Success',
        message: 'User Register Successfully',
        data: user,
    });
})

// @desc - Login User
// @route - POST/api/v1/users/login
//@access - Public

export const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Find the user in DB by email only
    const userFound = await User.findOne({
        email,
    });
    if (userFound && await bcrypt.compare(password, userFound?.password)) {
        return res.json({
            status: 'success',
            message: 'User Logged in Successfully',
            userFound,
            token: generateToken(userFound?._id),
        });
    } else {
        // res.json({
        //     message: 'Invalid LogIn'
        // })
        throw new Error("Invalid login Credential"); // this syntax are used in express async handler

    }
}
);

// @desc - Get user profile
// @route - GET/api/v1/users/profile
//@access = Private

export const getUserProfileCtrl = asyncHandler(async (req, res) => {
    //find the user
    const user = await User.findById(req.userAuthId).populate("orders");
    // console.log(user)
    res.json({
        status: "success",
        message: "User profile fetched successfully",
        user,
    });
});

// @desc - Update user shipping address
// @route - PUT/api/v1/users/update/shipping
//@access = Private

export const updateShippingCtrl = asyncHandler(async (req, res) => {
    const { firstName,
        lastName,
        address,
        city,
        postalCode,
        province,
        country,
        phone,
    } = req.body;
    const user = await User.findByIdAndUpdate(req.userAuthId, {
        shippingAddress: {
            firstName,
            lastName,
            address,
            city,
            postalCode,
            province,
            country,
            phone,
        },
        hashShippingAddress: true,
    },
        {
            new: true,
        }
    );
    // send response
    res.json({
        status: "success",
        message: "User Shipping Address updated succcessfully",
        user,
    });

});