import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import dotenv from "dotenv"
dotenv.config();
import Order from "../model/Order.js";
import User from "../model/User.js";
import Product from "../model/Product.js";
import Coupon from "../model/Coupon.js";

// @desc create orders
// @route POSt/api/v1/order
//@access private


// Stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY);

export const createOrderCtrl = asyncHandler(async (req, res) => {
    //get the coupon
    // console.log(req.query);
    const { coupon } = req?.query;
    const couponFound = await Coupon.findOne({
        code: coupon?.toUpperCase(),
    });
    if (couponFound?.isExpired) {
        throw new Error("Coupon has expired")
    }
    if (!couponFound) {
        throw new Error("Coupon does not exists");
    }

    //get discount
    const discount = couponFound?.discount / 100;


    //Get the payload(customer, orderItem, shippingAddress, totalProce);
    const { orderItems, shippingAddress, totalPrice } = req.body;
    // console.log({
    //     orderItems,
    //     shippingAddress,
    //     totalPrice,
    // });

    // Find the user
    const user = await User.findById(req.userAuthId);

    //Check if the user has shipping address
    // if (!user?.hasShippingAddress) {
    //     throw new Error("Please provide shipping address")
    // }

    //Check if order is not empty
    if (orderItems?.length <= 0) {
        throw new Error("No order Items")
    }
    //Place/create order- save into DB
    const order = await Order.create({
        user: user?._id,
        orderItems,
        shippingAddress,
        totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice,

    });
    console.log(order);

    //push order into user
    user.orders.push(order?._id);
    await user.save();

    //Update the product qty
    const products = await Product.find({ _id: { $in: orderItems } })
    // console.log(products)
    orderItems?.map(async (order) => {
        const product = products?.find((product) => {
            return product?._id?.toString() === order?._id?.toString();
        });
        if (product) {
            product.totalSold += order.qty;
        }
        await product.save()
    })
    //make payment(stripe)
    // convert order items to have same structure that stripe need
    const convertedOrders = orderItems.map((item) => {
        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: item?.name,
                    description: item?.description,
                },
                unit_amount: item?.price * 100,
            },
            quantity: item?.qty,
        };
    });


    const session = await stripe.checkout.sessions.create({
        line_items: convertedOrders,
        metadata: {
            orderId: JSON.stringify(order?._id),
        },
        mode: "payment",
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
    });
    res.send({ url: session.url });

    //Payment webhook
    //Update the user order

    // res.json({
    //     success: true,
    //     message: "Order created",
    //     order,
    //     user,

    // })


});

// @desc get all orders
// @route GET/api/v1/orders
//@access private

export const getAllordersCtrl = asyncHandler(async (req, res) => {
    //For checking ctrl are working or not
    // res.json({
    //     msg: "Welcome orders Ctrl",
    // });

    // Find all orders
    const orders = await Order.find();
    res.json({
        success: true,
        message: "All orders",
        orders,
    });
});

// @desc get single orders
// @route GET/api/v1/orders/:id
//@access private/admin

export const getsingleOrderCtrl = asyncHandler(async (req, res) => {
    // get the order by id from params
    const id = req.params.id;
    const order = await Order.findById(id);
    // send response
    res.status(200).json({
        success: true,
        message: "Single Order",
        order,
    })
})


// @desc update orders
// @route PUT/api/v1/orders/update/:id
//@access private/admin


export const updateOrderCtrl = asyncHandler(async (req, res) => {
    //get id  from params
    const id = req.params.id;
    // update order

    const updatedOrder = await Order.findByIdAndUpdate(id, {
        status: req.body.status,
    },
        {
            new: true,
        },
    );
    res.status(200).json({
        success: true,
        message: "Order Updated",
        updatedOrder,
    });
});

// @desc get sales Min or max or averafe order
// @route PUT/api/v1/orders/sales/stats
//@access private/admin

export const getOrderStatsCtrl = asyncHandler(async(req,res)=>{
    //get order statistics
    const orders = await Order.aggregate([
        {
            $group:{
                _id: null,
                minimumSale: {
                    $min: "$totalPrice",
                },
                totalSales: {
                    $sum: "totalPrice",
                },
                maxSale: {
                    $max: "$totalPrice",
                },
                avgSale: {
                    $avg: "totalPrice",
                },
            },
        },
    ]);

    //get the date
     const date = new Date();
     const today = new Date(date.getFullYear(),  date.getMonth(),  date.getDate());
     const saleToday = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: today,
                },
            },
        },
        {
            $group:{
                _id:null,
                totalSales: {
                    $sum : "$totalPrice",
                },
            },
        },
     ]);
  
    //send response
    res.status(200).json({
        success: true,
        message:"Sum of orders",
        orders,
        saleToday,
    });
});