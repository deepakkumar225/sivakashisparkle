export const AVAILABLE_COUPONS = [
  {
    code: "SPARKLE10",
    title: "10% OFF",
    description: "Get 10% off on all Diwali crackers (up to ₹300)",
    type: "percentage",
    value: 10,
    minOrder: 0,
    maxDiscount: 300,
    badge: "Popular",
  },
  {
    code: "DIWALI20",
    title: "20% OFF",
    description: "Get 20% off on festive orders above ₹999 (up to ₹500)",
    type: "percentage",
    value: 20,
    minOrder: 999,
    maxDiscount: 500,
    badge: "Festive Special",
  },
  {
    code: "FESTIVE50",
    title: "FLAT ₹50 OFF",
    description: "Flat ₹50 instant discount on orders above ₹499",
    type: "fixed",
    value: 50,
    minOrder: 499,
    maxDiscount: 50,
    badge: "Quick Saver",
  },
  {
    code: "MEGA100",
    title: "FLAT ₹100 OFF",
    description: "Flat ₹100 discount on family celebration orders above ₹1499",
    type: "fixed",
    value: 100,
    minOrder: 1499,
    maxDiscount: 100,
    badge: "Family Saver",
  },
  {
    code: "CRACKER200",
    title: "FLAT ₹200 OFF",
    description: "Flat ₹200 mega discount on grand orders above ₹2000",
    type: "fixed",
    value: 200,
    minOrder: 2000,
    maxDiscount: 200,
    badge: "Mega Saver",
  },
];

export const calculateCouponDiscount = (couponCode, subtotal) => {
  if (!couponCode) {
    return {
      valid: false,
      discount: 0,
      message: "Please enter a coupon code.",
    };
  }

  const cleanCode = String(couponCode).trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);

  if (!coupon) {
    return {
      valid: false,
      discount: 0,
      message: `Coupon code "${cleanCode}" is invalid.`,
    };
  }

  const orderSubtotal = Number(subtotal) || 0;

  if (orderSubtotal < coupon.minOrder) {
    return {
      valid: false,
      discount: 0,
      message: `Coupon ${coupon.code} requires a minimum order of ₹${coupon.minOrder}. Add ₹${(coupon.minOrder - orderSubtotal).toFixed(2)} more.`,
    };
  }

  let discount = 0;

  if (coupon.type === "percentage") {
    discount = Math.round((orderSubtotal * coupon.value) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === "fixed") {
    discount = Math.min(coupon.value, orderSubtotal);
  }

  return {
    valid: true,
    code: coupon.code,
    title: coupon.title,
    discount,
    description: coupon.description,
    message: `🎉 Coupon "${coupon.code}" applied! You saved ₹${discount.toFixed(2)}.`,
  };
};
