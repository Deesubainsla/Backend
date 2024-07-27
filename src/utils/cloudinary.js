import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

 
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_KEY, 
        api_secret: process.env.CLOUDINARY_SECRET 
    })

   const uploadonCloudinary = async (localFilePath)=>{

    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload( localFilePath , { resource_type:'auto' });
        // console.log('This is response from Cloudinary:', response);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        //This down statement will remove the locally saved storage file to optimize resources              
        fs.unlinkSync(localFilePath);
        console.log("Cloudinary upload Error:");
    }
   }

   export {uploadonCloudinary}