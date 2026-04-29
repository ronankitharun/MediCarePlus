import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

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
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

  // API Route: Create Order
  app.post("/api/payment/order", async (req, res) => {
    try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Razorpay Error: API keys missing in environment variables.");
        return res.status(500).json({ 
          error: "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables." 
        });
      }

      const { amount, currency = "INR" } = req.body;
      
      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
        currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json({ 
        ...order, 
        razorpay_key: process.env.RAZORPAY_KEY_ID 
      });
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
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!keySecret) {
        console.error("Razorpay Verify Error: RAZORPAY_KEY_SECRET missing");
        return res.status(500).json({ error: "Server configuration missing" });
      }

      const expectedSign = crypto
        .createHmac("sha256", keySecret)
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

  // API Route: Send Appointment Notification Email
  app.post("/api/appointments/notify", async (req, res) => {
    try {
      const { 
        patientName, 
        patientPhone, 
        doctorName, 
        date, 
        time, 
        type 
      } = req.body;

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
        // Log skip but don't fail the booking flow
        console.warn("Email credentials missing:", {
          hasUser: !!process.env.EMAIL_USER,
          hasPass: !!process.env.EMAIL_PASS,
          hasAdmin: !!process.env.ADMIN_EMAIL
        });
        return res.json({ success: true, message: "Email not configured, skipping." });
      }

      // Defensively strip spaces from the password in case the user pasted it with spaces
      const cleanedPass = process.env.EMAIL_PASS.replace(/\s/g, "");

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_PORT === "465",
        auth: {
          user: process.env.EMAIL_USER,
          pass: cleanedPass,
        },
      });

      const mailOptions = {
        from: `"ArogyaLink Notification" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "New Appointment Booked! 🏥",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h2 style="color: #059669; margin-top: 0;">New Appointment Notification</h2>
            <p>A patient has booked a new appointment. Here are the details:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px;">Patient Name:</td>
                <td style="padding: 8px 0;">${patientName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Phone Number:</td>
                <td style="padding: 8px 0;">${patientPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Doctor:</td>
                <td style="padding: 8px 0;">${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Type:</td>
                <td style="padding: 8px 0; text-transform: capitalize;">${type}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
              <small style="color: #64748b;">Please log in to the admin panel to manage this appointment.</small>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Notification email sent." });
    } catch (error) {
      console.error("Email Sending Error:", error);
      // We don't want to fail the whole booking process if email fails
      res.status(500).json({ success: false, error: "Failed to send notification email" });
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
