// Mock coupon list — in production this would come from your database
const AVAILABLE_COUPONS = [
  {
    code: "WELCOME10",
    discount: 10,
    type: "percentage",
    minAmount: 200,
    description: "10% off on orders above ₹200",
  },
  {
    code: "FIRST50",
    discount: 50,
    type: "fixed",
    minAmount: 300,
    description: "₹50 off on your first order",
  },
  {
    code: "STUDENT15",
    discount: 15,
    type: "percentage",
    minAmount: 150,
    description: "15% student discount",
  },
  {
    code: "LUNCH20",
    discount: 20,
    type: "fixed",
    minAmount: 400,
    description: "₹20 off on lunch orders",
  },
  {
    code: "MEMDAY25",
    discount: 25,
    type: "fixed",
    minAmount: 500,
    description: "₹25 off on orders above ₹500",
  },
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return Response.json(
        { coupons: AVAILABLE_COUPONS },
        { status: 200 }
      );
    }

    const coupon = AVAILABLE_COUPONS.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );

    if (!coupon) {
      return Response.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    return Response.json({ coupon }, { status: 200 });
  } catch (error) {
    console.error("Coupon fetch error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { code, amount } = await req.json();

    if (!code || !amount) {
      return Response.json(
        { error: "Code and amount required" },
        { status: 400 }
      );
    }

    const coupon = AVAILABLE_COUPONS.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );

    if (!coupon) {
      return Response.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    if (amount < coupon.minAmount) {
      return Response.json(
        {
          error: `Minimum order amount of ₹${coupon.minAmount} required for this coupon`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (amount * coupon.discount) / 100;
    } else if (coupon.type === "fixed") {
      discount = coupon.discount;
    }

    const finalAmount = Math.max(0, amount - discount);

    return Response.json(
      { coupon, discount, finalAmount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Coupon validation error:", error);
    return Response.json(
      { error: error.message || "Coupon validation failed" },
      { status: 500 }
    );
  }
}
