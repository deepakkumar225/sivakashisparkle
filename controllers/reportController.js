import Order from "../models/Order.js";

/*
=========================================================
ADMIN - SALES REPORT
=========================================================
*/

export const getSalesReport = async (req, res) => {
  try {
    /*
    -----------------------------------------------------
    TOTAL SALES
    -----------------------------------------------------
    Only Paid orders are counted.
    Cancelled orders are excluded.
    -----------------------------------------------------
    */

    const totalSalesResult = await Order.aggregate([
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
          totalOrders: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalSales =
      totalSalesResult.length > 0
        ? totalSalesResult[0].totalSales
        : 0;

    const totalPaidOrders =
      totalSalesResult.length > 0
        ? totalSalesResult[0].totalOrders
        : 0;


    /*
    -----------------------------------------------------
    ORDER STATUS SUMMARY
    -----------------------------------------------------
    */

    const orderStatusReport = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);


    /*
    -----------------------------------------------------
    PAYMENT STATUS SUMMARY
    -----------------------------------------------------
    */

    const paymentStatusReport = await Order.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: {
            $sum: 1,
          },
          amount: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);


    /*
    -----------------------------------------------------
    MONTHLY SALES
    -----------------------------------------------------
    */

    const monthlySales = await Order.aggregate([
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
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },

          sales: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);


    /*
    -----------------------------------------------------
    RECENT PAID ORDERS
    -----------------------------------------------------
    */

    const recentPaidOrders = await Order.find({
      paymentStatus: "Paid",
      orderStatus: {
        $ne: "Cancelled",
      },
    })
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .select(
        "_id user items totalAmount paymentStatus orderStatus createdAt"
      );


    /*
    -----------------------------------------------------
    RESPONSE
    -----------------------------------------------------
    */

    res.status(200).json({
      success: true,

      summary: {
        totalSales,
        totalPaidOrders,
      },

      orderStatusReport,

      paymentStatusReport,

      monthlySales,

      recentPaidOrders,
    });
  } catch (error) {
    console.error(
      "Get Sales Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to generate sales report.",
    });
  }
};