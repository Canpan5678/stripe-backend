// index.js
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

const app = express();

// Allow all origins (fixes CORS issues)
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Stripe backend is running ✅");
});

// Item catalog
const items = {
  SWEDISH: { name: "Swedish Massage", price: 80 },
  DEEP_TISSUE: { name: "Deep Tissue Massage", price: 95 },
  PRENATAL: { name: "Pre-Natal Massage", price: 90 },
  HOT_STONE: { name: "Hot Stone Massage", price: 110 },
  REFLEXOLOGY: { name: "Reflexology", price: 75 },
  REIKI: { name: "Reiki Session", price: 85 },
  BD_PERFORMANCE: { name: "Belly Dance Performance", price: 150 },
  BD_PRIVATE: { name: "Belly Dance Private Class", price: 45 },
  BD_GROUP: { name: "Belly Dance Group Class", price: 25 },
  ZITI: { name: "World Famous Ziti", price: 35 },
  QUICHE_SLICE: { name: "Quiche (Slice)", price: 8 },
  SAUSAGE_PEPPERS: { name: "Sausage & Peppers", price: 16 },
  POTATO_SALAD: { name: "Potato Salad", price: 12 },
  GREEN_BEAN_TRAY: { name: "World Famous Green Bean Casserole (Whole Tray)", price: 30 },
  STUFFED_CABBAGE: { name: "Stuffed Cabbage", price: 20 },
  BRISKET: { name: "Brisket", price: 25 },
  KUGEL_SLICE: { name: "Noodle Kugel (Slice)", price: 8 },
  KUGEL_TRAY: { name: "Noodle Kugel (Whole Tray)", price: 42 },
  MATZO_SOUP: { name: "Matzo Ball Soup (4 Balls)", price: 18 },
  MISO_SOUP: { name: "Miso Soup", price: 12 },
  PUMPKIN_SLICE: { name: "Pumpkin Cheesecake (Slice)", price: 10 },
  PUMPKIN_TRAY: { name: "Pumpkin Cheesecake (Whole Tray)", price: 45 },
  FRUIT_SLICE: { name: "Fruit Cheesecake (Slice)", price: 10 },
  FRUIT_TRAY: { name: "Fruit Cheesecake (Whole Tray)", price: 45 },
  PISTACHIO: { name: "Pistachio Pudding with Cherry Topping", price: 12 },
};

// POST endpoint to create checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { itemKeys } = req.body; // Expect an array of itemKeys

    if (!itemKeys || !Array.isArray(itemKeys) || itemKeys.length === 0) {
      return res.status(400).json({ error: "itemKeys must be a non-empty array" });
    }

    // Map itemKeys to Stripe line items
    const line_items = itemKeys.map(key => {
      const item = items[key];
      if (!item) {
        throw new Error(`Invalid itemKey: ${key}`);
      }
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe expects cents
        },
        quantity: 1,
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://google.com", // Replace with your actual success page
      cancel_url: "https://google.com",  // Replace with your actual cancel page
    });

    console.log("Stripe session created:", session.url);

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Stripe backend running on port ${PORT}`);
});
