const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

const app = express();

// Allow all origins (fixes CORS issues)
app.use(cors());
app.use(express.json());

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
  GREEN_BEAN_TRAY: { name: "Green Bean Casserole (Whole Tray)", price: 30 },

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
  PISTACHIO: { name: "Pistachio Pudding with Cherry Topping", price: 12 }
};

// Create Stripe Checkout Session (MULTI-ITEM)
app.post("/create-checkout-session", async (req, res) => {
  const { itemKeys } = req.body;

  if (!Array.isArray(itemKeys) || itemKeys.length === 0) {
    return res.status(400).json({ error: "itemKeys must be a non-empty array" });
  }

  try {
    const line_items = itemKeys.map((key) => {
      const item = items[key];
      if (!item) throw new Error(`Invalid itemKey: ${key}`);

      return {
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: item.price * 100
        },
        quantity: 1
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: "https://www.google.com",
      cancel_url: "https://www.google.com"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Stripe backend running on port ${PORT}`);
});
