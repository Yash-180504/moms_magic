import crypto from "crypto";
import { query } from "@/lib/db";

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      subscriptionId,
    } = await req.json();

    // Verify signature
    const hmac = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    );
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return Response.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Update order or subscription in database based on what was paid for
    if (orderId) {
      await query(
        `UPDATE orders SET status = 'confirmed', payment_id = $1, paid_at = NOW() WHERE id = $2`,
        [razorpay_payment_id, orderId]
      );
    } else if (subscriptionId) {
      await query(
        `UPDATE subscriptions SET status = 'active', payment_id = $1, paid_at = NOW() WHERE id = $2`,
        [razorpay_payment_id, subscriptionId]
      );
    }

    return Response.json(
      { success: true, message: "Payment verified" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return Response.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
