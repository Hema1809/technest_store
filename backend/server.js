
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 1,
    name: "AirBeat Pro Headphones",
    category: "Audio",
    price: 2499,
    rating: 4.8,
    reviews: 124,
    emoji: "🎧",
    badge: "Best seller"
  },
  {
    id: 2,
    name: "Pulse Smart Watch",
    category: "Wearables",
    price: 3299,
    rating: 4.6,
    reviews: 89,
    emoji: "⌚",
    badge: "New"
  },
  {
    id: 3,
    name: "KeyPro Wireless Keyboard",
    category: "Accessories",
    price: 1899,
    rating: 4.7,
    reviews: 76,
    emoji: "⌨️",
    badge: "Popular"
  },
  {
    id: 4,
    name: "SoundPod Mini Speaker",
    category: "Audio",
    price: 1499,
    rating: 4.5,
    reviews: 63,
    emoji: "🔊",
    badge: ""
  },
  {
    id: 5,
    name: "FitTrack Smart Band",
    category: "Wearables",
    price: 2199,
    rating: 4.4,
    reviews: 51,
    emoji: "⌚",
    badge: ""
  },
  {
    id: 6,
    name: "GlowDesk LED Lamp",
    category: "Accessories",
    price: 999,
    rating: 4.6,
    reviews: 42,
    emoji: "💡",
    badge: "Deal"
  },
  {
    id: 7,
    name: "ClickPro Wireless Mouse",
    category: "Accessories",
    price: 799,
    rating: 4.5,
    reviews: 38,
    emoji: "🖱️",
    badge: ""
  },
  {
    id: 8,
    name: "BassFlow Earbuds",
    category: "Audio",
    price: 1799,
    rating: 4.7,
    reviews: 94,
    emoji: "🎵",
    badge: "Trending"
  }
];

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to TechNest API 🚀",
    status: "Backend is running successfully"
  });
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find(
    item => item.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  res.json(product);
});

app.listen(PORT, () => {
  console.log(`TechNest backend running at http://localhost:${PORT}`);
});