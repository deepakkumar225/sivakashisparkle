import Product from "../models/Product.js";

/*
=========================================================
GET ALL PRODUCTS
=========================================================
*/

export const getProducts = async (req, res) => {
  try {
    const { category, status } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
};


/*
=========================================================
GET SINGLE PRODUCT
=========================================================
*/

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }
};


/*
=========================================================
CREATE PRODUCT
=========================================================
*/

export const createProduct = async (req, res) => {
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

    // Required fields
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

    // Check duplicate product code
    const existingProduct = await Product.findOne({
      productCode: productCode.toUpperCase().trim(),
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this product code already exists.",
      });
    }

    // Validate discount price
    if (
      discountPrice !== undefined &&
      discountPrice !== null &&
      Number(discountPrice) > Number(price)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount price cannot be greater than the original price.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      productCode: productCode.toUpperCase().trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      discountPrice:
        discountPrice === undefined || discountPrice === null
          ? 0
          : Number(discountPrice),
      images: Array.isArray(images) ? images : [],
      status: status === "inactive" ? "inactive" : "active",
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
};


/*
=========================================================
UPDATE PRODUCT
=========================================================
*/

export const updateProduct = async (req, res) => {
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

    // Check duplicate product code
    if (productCode) {
      const formattedCode = productCode.toUpperCase().trim();

      const duplicateProduct = await Product.findOne({
        productCode: formattedCode,
        _id: { $ne: product._id },
      });

      if (duplicateProduct) {
        return res.status(409).json({
          success: false,
          message: "Another product already uses this product code.",
        });
      }

      product.productCode = formattedCode;
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

    if (price !== undefined) {
      product.price = Number(price);
    }

    if (discountPrice !== undefined) {
      product.discountPrice = Number(discountPrice);
    }

    if (images !== undefined) {
      product.images = Array.isArray(images) ? images : [];
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product status.",
        });
      }

      product.status = status;
    }

    // Validate discount after updates
    if (product.discountPrice > product.price) {
      return res.status(400).json({
        success: false,
        message: "Discount price cannot be greater than the original price.",
      });
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to update product.",
    });
  }
};


/*
=========================================================
DELETE PRODUCT
=========================================================
*/

export const deleteProduct = async (req, res) => {
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
    console.error("Delete Product Error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
};


/*
=========================================================
UPDATE PRODUCT STATUS
=========================================================
*/

export const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive.",
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
      message: `Product ${status} successfully.`,
      product,
    });
  } catch (error) {
    console.error("Update Product Status Error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to update product status.",
    });
  }
};