import mongoose from "mongoose"

export const connectDB = async () => {
   try {
       await mongoose.connect(process.env.MONGODB_URI)
       console.log("database connected")
   } catch (error) {
       console.log({
           error, 
           message: "unable to connect to database"
       })
       process.exit(1)
   }
}