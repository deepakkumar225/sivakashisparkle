import Product from "../models/Product.js";

/*
=========================================================
ADMIN - GET ALL PRODUCTS
=========================================================
*/

export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Admin Products Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
};


/*
=========================================================
ADMIN - CREATE PRODUCT
=========================================================
*/

export const createAdminProduct = async (req, res) => {
  try {
    const {
      name,
      productCode,
      category,
      description,
      price,
      discountPrice,
      images,
      status,
    } = req.body;

    if (
      !name ||
      !productCode ||
      !category ||
      !description ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, product code, category, description and price are required.",
      });
    }

    const existingProduct = await Product.findOne({
      productCode: productCode.trim().toUpperCase(),
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this product code already exists.",
      });
    }

    const originalPrice = Number(price);
    const finalDiscountPrice =
      discountPrice === undefined || discountPrice === ""
        ? 0
        : Number(discountPrice);

    if (Number.isNaN(originalPrice) || originalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product price.",
      });
    }

    if (
      Number.isNaN(finalDiscountPrice) ||
      finalDiscountPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount price.",
      });
    }

    if (finalDiscountPrice > originalPrice) {
      return res.status(400).json({
        success: false,
        message:
          "Discount price cannot be greater than the original price.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      productCode: productCode.trim().toUpperCase(),
      category: category.trim(),
      description: description.trim(),
      price: originalPrice,
      discountPrice: finalDiscountPrice,
      images: Array.isArray(images) ? images : [],
      status: status === "inactive" ? "inactive" : "active",
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create Admin Product Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
};


/*
=========================================================
ADMIN - UPDATE PRODUCT
=========================================================
*/

export const updateAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const {
      name,
      productCode,
      category,
      description,
      price,
      discountPrice,
      images,
      status,
    } = req.body;

    const updatedPrice =
      price === undefined || price === ""
        ? product.price
        : Number(price);

    const updatedDiscountPrice =
      discountPrice === undefined || discountPrice === ""
        ? 0
        : Number(discountPrice);

    if (
      Number.isNaN(updatedPrice) ||
      updatedPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product price.",
      });
    }

    if (
      Number.isNaN(updatedDiscountPrice) ||
      updatedDiscountPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount price.",
      });
    }

    if (updatedDiscountPrice > updatedPrice) {
      return res.status(400).json({
        success: false,
        message:
          "Discount price cannot be greater than the original price.",
      });
    }

    if (productCode) {
      const normalizedCode =
        productCode.trim().toUpperCase();

      const duplicateProduct = await Product.findOne({
        productCode: normalizedCode,
        _id: {
          $ne: product._id,
        },
      });

      if (duplicateProduct) {
        return res.status(409).json({
          success: false,
          message:
            "Another product already uses this product code.",
        });
      }

      product.productCode = normalizedCode;
    }

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (category !== undefined) {
      product.category = category.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    product.price = updatedPrice;
    product.discountPrice = updatedDiscountPrice;

    if (Array.isArray(images)) {
      product.images = images;
    }

    if (status === "active" || status === "inactive") {
      product.status = status;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update Admin Product Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update product.",
    });
  }
};


/*
=========================================================
ADMIN - DELETE PRODUCT
=========================================================
*/

export const deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Admin Product Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
};


/*
=========================================================
ADMIN - UPDATE PRODUCT STATUS
=========================================================
*/

export const updateAdminProductStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Product status must be active or inactive.",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product status updated successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "Update Admin Product Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to update product status.",
    });
  }
};