import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log("==========================================");
    console.log(" MongoDB Connected Successfully");
    console.log(` Database: ${connection.connection.name}`);
    console.log("==========================================");
  } catch (error) {
    console.error("==========================================");
    console.error(" MongoDB Connection Failed");
    console.error("==========================================");
    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;