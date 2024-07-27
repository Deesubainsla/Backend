import mongoose,{Schema,model} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        username: {
            type:String,
            require: true,
            unique: true,
            trim: true,
            index: true,
            lowercase: true
        },
        email: {
            type:String,
            require: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        fullname: {
            type:String,
            require: true,
           
            trim: true,
            index:true
        },
        avatar: {
            type:String, //cloudinary url
            required: true
        },
        coverimg: {
            type:String, //cloudinary url
            
        },
        watchHistory:{
            type: Schema.Types.ObjectId,
            ref: 'Video'
        },
        password:{
            type:String,
            required: [true, "password is required:"]
        },
        refreshtoken:{
            type: String
            
        }
    }, {timestamps: true}
)

//these following two block of codes are for bcrypt
// this if for password encryption
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})
//this is for password checking
userSchema.methods.isPasswordCorrect = async function (password){
            return await bcrypt.compare(password, this.password);
}

//these following are for JWT by schema.method
//This is for access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.JWT_GENERATETOKEN_SECRETKEY,
        {expiresIn: process.env.JWT_GENERATETOKEN_EXPITY}
    )
}
//this is for refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
           
        },
        process.env.JWT_REFRESHTOKEN_SECRETKEY,
        {expiresIn: process.env.JWT_REFRESHTOKEN_EXPITY}
    )
}

export const User = model('User', userSchema);