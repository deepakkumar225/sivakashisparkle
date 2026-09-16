import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const sampleProducts = [
  {
    name: "10cm Electric Sparklers (Pack of 10)",
    productCode: "SS-SPK-001",
    category: "Sparklers",
    description:
      "Dazzling golden and silver sparklers, safe and perfect for family celebration and Diwali night sparkle.",
    price: 150,
    discountPrice: 99,
    images: ["/images/products/sparklers.jpg"],
    status: "active",
  },
  {
    name: "Deluxe Colour Flower Pots (10 Pcs)",
    productCode: "SS-FLP-001",
    category: "Flower Pots",
    description:
      "High-rising fountain cracker producing showers of golden sparks and vibrant festive colors.",
    price: 300,
    discountPrice: 199,
    images: ["/images/products/flower_pot.jpg"],
    status: "active",
  },
  {
    name: "Special Ground Chakkar Deluxe",
    productCode: "SS-GCH-001",
    category: "Ground Chakkars",
    description:
      "Fast-spinning ground chakkar delivering a wide radiant circular spray of fiery sparks.",
    price: 200,
    discountPrice: 149,
    images: ["/images/products/chakkar.jpg"],
    status: "active",
  },
  {
    name: "Sivakashi Rocket Crackers (10 Pcs Pack)",
    productCode: "SS-ROC-001",
    category: "Rockets",
    description:
      "High-altitude whistling rocket cracker that bursts with bright multi-color stars in the night sky.",
    price: 350,
    discountPrice: 249,
    images: ["/images/products/rocket.jpg"],
    status: "active",
  },
  {
    name: "Traditional Bijili Crackers (100 Pcs)",
    productCode: "SS-SND-001",
    category: "Sound Crackers",
    description:
      "Crisp, snappy sound crackers bundled in red paper for traditional Diwali celebrations.",
    price: 120,
    discountPrice: 79,
    images: ["/images/products/bijili.jpg"],
    status: "active",
  },
  {
    name: "12 Color Sky Shot Aerial Fireworks",
    productCode: "SS-FCY-001",
    category: "Fancy Crackers",
    description:
      "Spectacular multi-shot aerial repeater firing bursts of colorful peony bouquets high into the sky.",
    price: 650,
    discountPrice: 499,
    images: ["/images/products/sky_shot.jpg"],
    status: "active",
  },
  {
    name: "Classic Laxmi Bomb Green Sound Cracker",
    productCode: "SS-SND-002",
    category: "Sound Crackers",
    description:
      "Deep bass sonic boom cracker wrapped in authentic green and red Sivakashi packaging.",
    price: 250,
    discountPrice: 179,
    images: ["/images/products/laxmi_bomb.jpg"],
    status: "active",
  },
  {
    name: "1000 Wala Red Ladi Firecracker Roll",
    productCode: "SS-GFT-001",
    category: "Gift Boxes",
    description:
      "Grand uninterrupted garland chain of 1000 festive red crackers for joyous celebration.",
    price: 1200,
    discountPrice: 899,
    images: ["/images/products/garland_1000_wala.jpg"],
    status: "active",
  },
];

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in environment.");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    console.log("Clearing older products...");
    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing products.`);

    console.log("Inserting new test products with images...");
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} new products!`);

    for (const p of createdProducts) {
      console.log(` - [${p.productCode}] ${p.name} (₹${p.discountPrice} / ₹${p.price})`);
    }

    await mongoose.disconnect();
    console.log("MongoDB disconnected. Done.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedProducts();
