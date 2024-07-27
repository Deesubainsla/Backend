import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, userRegister } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/Authrization.middleware.js";
// import { verifyjwt } from "../middlewares/Authrization.middleware.js";

const router  = Router()

//Multer is required for handling files from client req
router.route("/register").post(
    upload.fields(//it is a function of multer (implementation of middleware actually)
        [{
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverimg",
            maxCount: 1
        }]
    ),
    userRegister
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyjwt, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router