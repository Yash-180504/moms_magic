import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, amount, provider_id, coupon_code, coupon_discount } = await req.json();

    if (!type || !["basic", "premium", "pro"].includes(type)) {
      return Response.json({ error: "Invalid subscription type" }, { status: 400 });
    }

    const subscriptionId = `sub_${Date.now()}`;
    const result = await query(
      `INSERT INTO subscriptions (id, user_id, provider_id, type, amount, coupon_code, coupon_discount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
       RETURNING *`,
      [subscriptionId, session.user.id, provider_id || null, type, amount, coupon_code || null, coupon_discount || 0]
    );

    return Response.json(
      { subscription: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscription creation error:", error);
    return Response.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC`,
      [session.user.id]
    );

    return Response.json(
      { subscriptions: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
