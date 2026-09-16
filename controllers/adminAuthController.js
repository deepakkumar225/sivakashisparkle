import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";

/*
=========================================================
GENERATE ADMIN JWT TOKEN
=========================================================
*/

const generateAdminToken = (adminId) => {
  return jwt.sign(
    {
      id: adminId,
      role: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


/*
=========================================================
ADMIN LOGIN
=========================================================
*/

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find admin
    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    // Check admin status
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account has been deactivated.",
      });
    }

    // Check role
    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access denied.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    // Generate JWT
    const token = generateAdminToken(admin._id);

    res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to login as admin.",
    });
  }
};


/*
=========================================================
GET CURRENT ADMIN
=========================================================
*/

export const getCurrentAdmin = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        isActive: req.admin.isActive,
        createdAt: req.admin.createdAt,
        updatedAt: req.admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get Current Admin Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get admin information.",
    });
  }
};


/*
=========================================================
FORGOT PASSWORD - GENERATE & SEND OTP
=========================================================
*/

export const forgotPasswordAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your admin email address.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "No admin account found with that email address.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "This admin account is currently deactivated.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set 10-minute expiry
    admin.resetOtp = otp;
    admin.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save();

    console.log(`\n========================================`);
    console.log(`🔑 ADMIN OTP GENERATED FOR: ${cleanEmail}`);
    console.log(`🔐 OTP CODE: ${otp}`);
    console.log(`⏰ EXPIRES IN: 10 MINUTES`);
    console.log(`========================================\n`);

    res.status(200).json({
      success: true,
      message: "OTP has been generated successfully and sent to your admin email.",
      email: cleanEmail,
      // Provide OTP in response during testing/development for seamless UX
      otp,
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process forgot password request.",
    });
  }
};


/*
=========================================================
VERIFY OTP
=========================================================
*/

export const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and 6-digit OTP are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const admin = await Admin.findOne({
      email: cleanEmail,
      resetOtp: cleanOtp,
      resetOtpExpires: { $gt: new Date() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You may now set your new password.",
      email: cleanEmail,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
    });
  }
};


/*
=========================================================
RESET ADMIN PASSWORD
=========================================================
*/

export const resetAdminPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const admin = await Admin.findOne({
      email: cleanEmail,
      resetOtp: cleanOtp,
      resetOtpExpires: { $gt: new Date() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please start the password reset process again.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);

    // Clear reset OTP fields
    admin.resetOtp = null;
    admin.resetOtpExpires = null;
    await admin.save();

    console.log(`✅ Admin password reset successfully for: ${cleanEmail}`);

    res.status(200).json({
      success: true,
      message: "Admin password has been reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Admin Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
};