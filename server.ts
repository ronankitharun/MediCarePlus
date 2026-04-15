import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Razorpay instance
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
  });

  // API Route: Create Order
  app.post("/api/payment/order", async (req, res) => {
    try {
      const { amount, currency = "INR" } = req.body;
      
      const options = {
        amount: amount * 100, // amount in smallest currency unit (paise)
        currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // API Route: Verify Payment
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
      }
    } catch (error) {
      console.error("Payment Verification Error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
