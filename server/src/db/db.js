import mongoose from "mongoose"
import {DB_NAME} from "../constant.js"


const connectDB = async () => {
    try {
        console.log(`${process.env.MONGODB_URL}/${DB_NAME}`)
        const connectionInstance =   await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("Connection task : " + connectionInstance.connection)
        console.log(`\n connection done ..!! DB HOST ${connectionInstance.connection.host}`);
    }catch(error){
        console.log("Error", error)
        process.exit(1)
    }
}


export default connectDB