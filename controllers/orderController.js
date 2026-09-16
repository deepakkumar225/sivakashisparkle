import Order from "../models/Order.js";
import Product from "../models/Product.js";
import {
  AVAILABLE_COUPONS,
  calculateCouponDiscount,
} from "../utils/coupons.js";

/*
=========================================================
CREATE ORDER
=========================================================
*/

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      couponCode = "",
      discount = 0,
      deliveryCharge = 0,
      totalAmount,
      paymentMethod = "Cash on Delivery",
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product.",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required.",
      });
    }

    /*
    -------------------------------------------------------
    Verify products from MongoDB
    -------------------------------------------------------
    */

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.status !== "active") {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable.`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity.",
        });
      }

      /*
        The selling price IS the actual product price.
        The original price (product.price) is only shown
        as a showcase on the product listing page.
      */

      const sellingPrice =
        product.discountPrice > 0 &&
        product.discountPrice < product.price
          ? product.discountPrice
          : product.price;

      const itemSubtotal = sellingPrice * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        productCode: product.productCode,
        quantity,
        price: sellingPrice,
        subtotal: itemSubtotal,
      });
    }

    /*
    -------------------------------------------------------
    Calculate totals & coupon discount
    -------------------------------------------------------
    subtotal = sum of actual selling prices
    discount = discount from applied coupon code
    totalAmount = subtotal - discount + delivery charge
    -------------------------------------------------------
    */

    const calculatedSubtotal = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    const calculatedDeliveryCharge =
      Number(deliveryCharge) || 0;

    let calculatedDiscount = 0;
    let appliedCoupon = "";

    if (couponCode) {
      const couponResult = calculateCouponDiscount(
        couponCode,
        calculatedSubtotal
      );
      if (couponResult.valid) {
        calculatedDiscount = couponResult.discount;
        appliedCoupon = couponResult.code;
      }
    } else if (Number(discount) > 0) {
      calculatedDiscount = Math.min(
        Number(discount),
        calculatedSubtotal
      );
    }

    const calculatedTotal = Math.max(
      0,
      calculatedSubtotal -
        calculatedDiscount +
        calculatedDeliveryCharge
    );

    if (calculatedTotal < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total.",
      });
    }

    /*
    -------------------------------------------------------
    Create order
    -------------------------------------------------------
    */

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal: calculatedSubtotal,
      couponCode: appliedCoupon,
      discount: calculatedDiscount,
      deliveryCharge: calculatedDeliveryCharge,
      totalAmount: calculatedTotal,
      paymentStatus: "Pending",
      orderStatus: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create order.",
    });
  }
};


/*
=========================================================
GET MY ORDERS
=========================================================
*/

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch your orders.",
    });
  }
};


/*
=========================================================
GET SINGLE USER ORDER
=========================================================
*/

export const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get My Order Error:", error);

    res.status(400).json({
      success: false,
      message: "Invalid order ID.",
    });
  }
};


/*
=========================================================
ADMIN - GET ALL ORDERS
=========================================================
*/

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch orders.",
    });
  }
};


/*
=========================================================
ADMIN - GET SINGLE ORDER
=========================================================
*/

export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Admin Order Error:", error);

    res.status(400).json({
      success: false,
      message: "Invalid order ID.",
    });
  }
};


/*
=========================================================
ADMIN - UPDATE ORDER STATUS
=========================================================
*/

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to update order status.",
    });
  }
};


/*
=========================================================
ADMIN - UPDATE PAYMENT STATUS
=========================================================
*/

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Paid",
      "Failed",
      "Refunded",
    ];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to update payment status.",
    });
  }
};


/*
=========================================================
GET AVAILABLE COUPONS
=========================================================
*/

export const getAvailableCoupons = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      coupons: AVAILABLE_COUPONS,
    });
  } catch (error) {
    console.error("Get Available Coupons Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch available coupons.",
    });
  }
};


/*
=========================================================
VALIDATE COUPON
=========================================================
*/

export const validateCoupon = async (req, res) => {
  try {
    const { couponCode, subtotal } = req.body;

    const result = calculateCouponDiscount(couponCode, subtotal);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to validate coupon.",
    });
  }
};