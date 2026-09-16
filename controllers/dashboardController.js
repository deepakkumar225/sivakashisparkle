import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ContactMessage from "../models/ContactMessage.js";

/*
=========================================================
ADMIN DASHBOARD
=========================================================
*/

export const getDashboardStats = async (req, res) => {
  try {
    // Count users
    const totalUsers = await User.countDocuments();

    // Count products
    const totalProducts = await Product.countDocuments();

    // Count active products
    const activeProducts = await Product.countDocuments({
      status: "active",
    });

    // Count inactive products
    const inactiveProducts = await Product.countDocuments({
      status: "inactive",
    });

    // Count all orders
    const totalOrders = await Order.countDocuments();

    // Count pending orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: "Pending",
    });

    // Count confirmed orders
    const confirmedOrders = await Order.countDocuments({
      orderStatus: "Confirmed",
    });

    // Count processing orders
    const processingOrders = await Order.countDocuments({
      orderStatus: "Processing",
    });

    // Count shipped orders
    const shippedOrders = await Order.countDocuments({
      orderStatus: "Shipped",
    });

    // Count delivered orders
    const deliveredOrders = await Order.countDocuments({
      orderStatus: "Delivered",
    });

    // Count cancelled orders
    const cancelledOrders = await Order.countDocuments({
      orderStatus: "Cancelled",
    });

    // Payment statistics
    const pendingPayments = await Order.countDocuments({
      paymentStatus: "Pending",
    });

    const paidPayments = await Order.countDocuments({
      paymentStatus: "Paid",
    });

    const failedPayments = await Order.countDocuments({
      paymentStatus: "Failed",
    });

    const refundedPayments = await Order.countDocuments({
      paymentStatus: "Refunded",
    });

    // Contact messages
    const totalContactMessages =
      await ContactMessage.countDocuments();

    const newContactMessages =
      await ContactMessage.countDocuments({
        status: "New",
      });

    const readContactMessages =
      await ContactMessage.countDocuments({
        status: "Read",
      });

    const repliedContactMessages =
      await ContactMessage.countDocuments({
        status: "Replied",
      });

    // Total sales
    const salesResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          orderStatus: {
            $ne: "Cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "_id user items totalAmount paymentStatus orderStatus createdAt"
      );

    // Recent contact messages
    const recentContactMessages =
      await ContactMessage.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "_id name email subject message status createdAt"
        );

    res.status(200).json({
      success: true,

      stats: {
        users: {
          total: totalUsers,
        },

        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts,
        },

        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },

        payments: {
          pending: pendingPayments,
          paid: paidPayments,
          failed: failedPayments,
          refunded: refundedPayments,
        },

        contactMessages: {
          total: totalContactMessages,
          new: newContactMessages,
          read: readContactMessages,
          replied: repliedContactMessages,
        },

        sales: {
          total: totalSales,
        },
      },

      recentOrders,
      recentContactMessages,
    });
  } catch (error) {
    console.error(
      "Get Dashboard Stats Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics.",
    });
  }
};