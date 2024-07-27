import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/AsyncHandler.js'
import { uploadonCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken"





const userRegister = asyncHandler( async(req,res)=>{
      //getting user info from req.body
      //validating user info
      //check if user already exist
      //check for image and avatar(compulsory field)
      //also upload at cloudinary
      //create user object for DB upload
      //remove password and refreshtoken from response
      //check for user creation or assure it
      //return response


      //step no.1 getting data
      const {fullname, username,email, password} = req.body
      // console.log("Displaying req.body:",req.body);
      
      //step no.2 check validity
      if([fullname,username, email, password].some( field => field?.trim === "" )){
            throw new ApiError(400,'All fields are required:');
      }
      
      //step no.3 check for already existed user
      //user model can directly communicate with DB for us bcz it is a DB model present in it:
      const existedUser = await User.findOne({
            $or: [ { username } , { email }]
      })
      if(existedUser) throw new ApiError(409, 'user with this email or username already exist');

      //step no.4 checking for image or avatar
      // const avatarLocalPath =  req.files?.avatar[0]?.path;
      const avatarLocalPath = req.files?.avatar[0]?.path;
      // const coverimgLocalPath =  req.files?.coverimg[0]?.path;
      let coverimgLocalPath;
      var coverimg;
       if(req.files && Array.isArray(req.files.coverimg) && req.files.coverimg.length>0){ 
            coverimgLocalPath = req.files?.coverimg[0]?.path;
            coverimg = await uploadonCloudinary(coverimgLocalPath);
      }

       if(!avatarLocalPath) throw new ApiError(400,'Avatar file is required:')

      //step no.5 upload them on cloudinary and get the access url
      const avatar = await uploadonCloudinary(avatarLocalPath);
      

      if(!avatar) throw new ApiError(400, 'Avatar file cloudinary Error:')

      //step no.6 making user object for DB upload 
      const user = await User.create(
                        {
                              username: username.toLowerCase(),
                              fullname,
                              email,
                              password,
                              avatar: avatar.url,
                              coverimg: coverimg?.url || ""

                        }
                  )

      //step no.7 checking for user creation and removing password and refreshtokens
      const createdUser = await User.findById(user._id);
      // .select(
      //       "-password -refreshtoken"
      // )

      if(!createdUser) throw new ApiError(500, "Something went wrong while registering the user:")

      try {
            await User.destroy({
                  where: {
                        id: user._id
                    }
                  });
                  console.log("The user has destroyed successfully:")
      } catch (error) {
          console.log(error);
      }
      
      
      //step no.8 last step returning the response(res)
      return res.status(201).json(
            new ApiResponse(200,createdUser, "User Registered Successfully:")
      )


})


const AccessandRefreshToken = async(userId)=>{

       try {
            console.log("i am entering in it:")
            const user = await User.findById(userId)
            const accessToken = await user.generateAccessToken()
            const refreshToken = await user.generateRefreshToken()
      
            user.refreshtoken = refreshToken
            await user.save({validateBeforeSave: false})
      
            return {refreshToken, accessToken}

      } catch (error) {
            throw new ApiError( 500 , "Unable to generate AccessandRefreshToken", error?.message)
      }
     
}

const loginUser = asyncHandler( async(req, res)=>{
     // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body //step no.1

     //step no.2
    if(!email && !username) throw new ApiError(500,"email or username is mandatory:")

      //step no.3
      const user = await User.findOne({
            $or:[ {username}, {email} ]
      })

      if(!user) throw new ApiError(404 , "User is not found give proper email or username:")

      //checking password
      const passwordValidity = await user.isPasswordCorrect(password)

      if(!passwordValidity) throw new ApiError(401 ,"Your password is incorrect:")

      //step no.5
      const {refreshToken, accessToken} = await AccessandRefreshToken(user._id)
      const loggedInUsers = await User.findById(user._id).select("-password -refreshtoken")

      //step no.6 managing cookies
      const options = {
            httpOnly: true,
            secure: true
      }

      return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
            new ApiResponse(200,
                  {user: loggedInUsers, accessToken, refreshToken},
                  "User has loggedin successfully:"
            )
      )


})

const logoutUser = asyncHandler(async(req, res)=>{
     User.findByIdAndUpdate(
      req.user._id,
      {
            $set:{
                  refreshtoken: undefined
            }
      },
      {
            new: true
      }
     )

     const options = {
      httpOnly: true,
      secure: true
      }

      return res.status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(new ApiResponse(200,{}, "User has loggedout successfully:"))
})

const refreshAccessToken = asyncHandler( async(req, res)=>{

      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if(!incomingRefreshToken){
            throw new ApiError(401, "IncomingRefreshToken not found:");
      }

      //jwt.verify gives decoded info to access:
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESHTOKEN_SECRETKEY)
      if(!decodedToken){
            throw new ApiError(401, "decoded Token not found:")
      }

      const user = User.findById(decodedToken._id);

      if(incomingRefreshToken !== user.refreshtoken){
            throw new ApiError(401, "RefreshTokens are different need to login again:")
      }

      const {refreshToken,accessToken} = await generateAccessToken(decodedToken._id)
      const options = {
            httpOnly: true,
            secure: true
      }

      return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
            new ApiResponse(200,{accessToken, refreshToken }, "Resession started successfully:")
      )
      
})

const passwordChange = asyncHandler(async(req,res)=>{
      const{currentpassword, newpassword} = req.body

      const user = await User.findById(req.user._id);
      const ispasswordcorrect = await user.isPasswordCorrect(currentpassword);

      if(!ispasswordcorrect){
            throw new ApiError(400 , "Current password is not correct:")
      }

      user.password = newpassword;
      await user.save({validateBeforeSave:false})

      return res.status(200).json(new ApiResponse(200, {}, "Your password has changed successfully:"))
})

const getUser = asyncHandler(async(req, res )=>{
      return res.status(200)
      .json(new ApiResponse(200, req.user, "Current user fetched successfully:"))
})

const updateAvatar = asyncHandler(async(req,res)=>{
      const newAvatar = req.file?.avatar;
      if(!newAvatar){
            throw new ApiError(400, "New Avatar is not found:")
      }

      const cloudinaryAvatar = await uploadonCloudinary(newAvatar);
      if(!cloudinaryAvatar.url){
            throw new ApiError(404, "Avatarurl not found for uploadation:")
      }

      const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                  $set:{
                        avatar: cloudinaryAvatar.url
                  }
            },
            {new:true}
      ).select("-password")

      res.status(200)
      .json(new ApiResponse(200, user, "Avatar has updated successfully:"))

})


const updatecoverimg = asyncHandler(async(req,res)=>{
      const newCoverimg = req.file?.coverimg;
      if(!newCoverimg){
            throw new ApiError(400, "New coverimg is not found:")
      }

      const cloudinarycoverimg = await uploadonCloudinary(newCoverimg);
      if(!cloudinarycoverimg.url){
            throw new ApiError(404, "Coverimg url not found for uploadation:")
      }

      const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                  $set:{
                        coverimg: cloudinarycoverimg.url
                  }
            },
            {new:true}
      ).select("-password")

      res.status(200)
      .json(new ApiResponse(200, user, "Coverimg has updated successfully:"))

})

const getUserChannelProfile = asyncHandler(async(req, res)=>{
      //getting username of the channel which we have clicked:
      const {username} = req.params
      //isse woh channel ka naam mil jaega jisko hmne khola h url ke through:
      if(!username?.trim()){
            throw new ApiError(401, "Username not found in getChannelProfile:")
      }

      const channel = await User.aggregate([
            {
                  /*ab User jo ki database me h as a collection us document collection se
                  hmne woh channel seperate kr liya jiko click kiya tha or jiska username mere pass h
                  */
                  $match: username?.toLowerCase()
            },
            {
                  /*
                  remember one thing lookup also add a new field with name "as" which you have provided in lookup:  now our first lookup add all the subscription schema document who have subscribed 
                  to this channel and second lookup will give channel document to whom we have subscribed:
                  */ 
                  $lookup:{
                        from: "subscriptions",
                        localField: "_id",
                        foreignField: "channel",
                        as: "subscribers"
                  }
            },
            {
                  $lookup:{
                        from: "subscriptions",
                        localField: "_id",
                        foreignField: "subscriber",
                        as: "subscribedTo"
                  }
            },
            {     //addfirld is for adding new field to the output document:
                  $addFields:{
                        subscribersCount:{
                              $size: "$subscribers"
                        },
                        channelSubscribedToCount:{
                              $size: "$subscribedTo"
                        },

                        /*
                        About isSubscribed we have got out id by using req.user middleware which we have created
                        and compare our id to the subscribers of that channel on which we have clicked:
                        */
                        isSubscribed:{
                              $cont:{
                                    if:{ $in:[ req.user?._id , "$subscribers.subscriber"]},
                                    then: true,
                                    else: false
                              }
                        }
                        
                  }
            },
            {
                  $project:{
                        fullname:1,
                        avatar:1,
                        coverimg:1,
                        subscribersCount:1,
                        channelSubscribedToCount:1,
                        isSubscribed:1
                  }
            }
      ])

      if(!channel?.length){
            throw new ApiError(404, "Channel is not found in getUserChannelProfile:")
      }

      return res.status(200)
      .json(new ApiResponse(200,channel[0], "Channel has fetched successfully:"))
})

export {userRegister,loginUser, logoutUser, refreshAccessToken, passwordChange, getUser,
      updateAvatar, updatecoverimg
}