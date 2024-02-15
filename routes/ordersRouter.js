import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { createOrderCtrl, getAllordersCtrl, getOrderStatsCtrl, getsingleOrderCtrl, updateOrderCtrl } from "../controllers/orderCtrl.js";

const orderRouter = express.Router();

orderRouter.post("/", isLoggedIn, createOrderCtrl)
orderRouter.get("/", isLoggedIn, getAllordersCtrl)
orderRouter.get("/:id", isLoggedIn, getsingleOrderCtrl)
orderRouter.get("/sales/stats", isLoggedIn, getOrderStatsCtrl)
orderRouter.put("/update/:id", isLoggedIn, updateOrderCtrl)
export default orderRouter