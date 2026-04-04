import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let whereClause = "1=1";
    const params = [];

    if (status) {
      whereClause += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (type) {
      whereClause += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    const offset = (page - 1) * limit;

    // Fetch subscriptions with user and kitchen details
    const result = await query(
      `SELECT 
        s.id,
        s.user_id,
        s.provider_id,
        s.type,
        s.amount,
        s.status,
        s.payment_id,
        s.created_at,
        s.paid_at,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        p.kitchen_name,
        p.location as kitchen_location
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN providers p ON s.provider_id = p.id
      WHERE ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM subscriptions WHERE ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0]?.total || 0);

    return Response.json(
      {
        subscriptions: result.rows,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription admin fetch error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId, status } = await req.json();

    if (!subscriptionId || !["active", "paused", "cancelled"].includes(status)) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await query(
      `UPDATE subscriptions SET status = $1 WHERE id = $2 RETURNING *`,
      [status, subscriptionId]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "Subscription not found" }, { status: 404 });
    }

    return Response.json(
      { subscription: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription update error:", error);
    return Response.json(
      { error: error.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}
