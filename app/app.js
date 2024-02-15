import dotenv from "dotenv";
import Stripe from "stripe";
dotenv.config();// this will help us to access the variable that are available in .env file
import express from "express";
import dbConnect from "../config/dbConnect.js";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import categoriesRouter from "../routes/categoriesRouter.js";
import productsRouter from "../routes/productsRoute.js";
import userRoutes from "../routes/userRoute.js";
import brandsRouter from "../routes/brandsRouter.js";
import colorRouter from "../routes/colorRouter.js";
import reviewRouter from "../routes/reviewRouter.js";
import orderRouter from "../routes/ordersRouter.js";
import Order from "../model/Order.js";
import couponsRouter from "../routes/couponsRouter.js";




//db Connect
dbConnect();
const app = express();


// Stripe Webhook
// Stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_b739d7f761c46669d9e691d51a29c1b0addf2b1be38aa4fb3549892f5761a69e";

app.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    async (request, response) => {
        const sig = request.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
            console.log("event");
        } catch (err) {
            console.log("err", err.message)
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        if (event.type === "checkout.session.completed") {
            // update the order
            const session = event.data.object;
            const { orderId } = session.metadata;
            const paymentStatus = session.payment_status;
            const paymentMethod = session.payment_method_types[0];
            const totalAmount = session.amount_total;
            const currency = session.currency;
            // For checking these parameter we console log it
            // console.log({
            //     orderId,
            //     paymentStatus,
            //     paymentMethod,
            //     totalAmount,
            //     currency,
            // });

            // Find the order
            const order = await Order.findByIdAndUpdate(
                JSON.parse(orderId),
                {
                    totalPrice: totalAmount / 100,
                    currency,
                    paymentMethod,
                    paymentStatus,

                }, {
                new: true,
            }
            );
            console.log(order);

        } else {
            return;
        }
        // Handle the event
        // switch (event.type) {
        //     case 'payment_intent.succeeded':
        //         const paymentIntentSucceeded = event.data.object;
        //         // Then define and call a function to handle the event payment_intent.succeeded
        //         break;
        //     // ... handle other event types
        //     default:
        //         console.log(`Unhandled event type ${event.type}`);
        // }
        // Return a 200 response to acknowledge receipt of the event
        response.send();
    });




// pass incoming data
app.use(express.json());// we add here express as middleware because it not allow to pass data directly from userCtrl.

// Routes
app.use('/api/v1/users/', userRoutes);
app.use('/api/v1/products/', productsRouter);
app.use('/api/v1/categories/', categoriesRouter);
app.use('/api/v1/brands/', brandsRouter);
app.use('/api/v1/color/', colorRouter);
app.use('/api/v1/reviews/', reviewRouter);
app.use('/api/v1/orders/', orderRouter);
app.use('/api/v1/coupons/', couponsRouter);


//err middleware
app.use(notFound)
app.use(globalErrHandler);
export default app;