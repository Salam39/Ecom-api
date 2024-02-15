import express from "express";
import { getUserProfileCtrl, loginUserCtrl, regiterUserCtrl, updateShippingCtrl } from "../controllers/userCtrl.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const userRoutes = express.Router();

userRoutes.post('/register', regiterUserCtrl);
userRoutes.post('/login', loginUserCtrl);
userRoutes.get('/profile', isLoggedIn, getUserProfileCtrl);
userRoutes.put('/update/shipping', isLoggedIn, updateShippingCtrl);

export default userRoutes;