// require('dotenv').config({path: './env'})
// import dotenv from 'dotenv'
import 'dotenv/config'
import { app } from './app.js'
 // "dev": "nodemon -r dotenv/config --experimental-json-modules src/index"

// console.log("I am running")
import connectDB from './db/db.js'
// dotenv.config({
//     path: './env'
// })


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is listning on port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("error is found in connectDB .catch: ", error)
})