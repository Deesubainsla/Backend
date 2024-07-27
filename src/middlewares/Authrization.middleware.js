import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken"



export const verifyjwt = asyncHandler(async(req, _, next)=>{
    //can use _ when parameter is not coming in use
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token) throw new ApiError(401, "Problem in retriving token in verifyjwt:")
        const decodedToken = jwt.verify(token,process.env.JWT_GENERATETOKEN_SECRETKEY)
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")
        if(!user) throw new ApiError(401," user not found in verifyjwt:")
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "verifyjwt has some problem:")
    }
})