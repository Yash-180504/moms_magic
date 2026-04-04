import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const { amount, currency = "INR", receipt, description } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      description: description || "Order Payment",
    };

    const order = await razorpay.orders.create(options);
    return Response.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return Response.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
