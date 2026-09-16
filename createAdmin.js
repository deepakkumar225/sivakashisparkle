import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import Admin from "./models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@sivakashisparkle.com";
    const adminPassword = "Admin@12345";

    const existingAdmin = await Admin.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("==========================================");
      console.log(" Admin account already exists");
      console.log(` Email: ${adminEmail}`);
      console.log("==========================================");

      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    const admin = await Admin.create({
      name: "Sivakashi Sparkle Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("==========================================");
    console.log(" Admin Account Created Successfully");
    console.log("==========================================");
    console.log(` Email: ${admin.email}`);
    console.log(` Password: ${adminPassword}`);
    console.log(` Role: ${admin.role}`);
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("==========================================");
    console.error(" Failed to Create Admin Account");
    console.error("==========================================");
    console.error(error.message);

    process.exit(1);
  }
};

createAdmin();