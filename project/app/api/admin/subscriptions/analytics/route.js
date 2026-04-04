import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Total revenue
    const revenueResult = await query(
      `SELECT SUM(amount) as total_revenue FROM subscriptions WHERE status IN ('active', 'completed')`
    );
    const totalRevenue = revenueResult.rows[0]?.total_revenue || 0;

    // Subscriptions by type
    const typeResult = await query(
      `SELECT type, COUNT(*) as count, SUM(amount) as revenue FROM subscriptions GROUP BY type`
    );

    // Subscriptions by status
    const statusResult = await query(
      `SELECT status, COUNT(*) as count FROM subscriptions GROUP BY status`
    );

    // Active subscriptions
    const activeResult = await query(
      `SELECT COUNT(*) as total FROM subscriptions WHERE status = 'active'`
    );
    const activeCount = activeResult.rows[0]?.total || 0;

    // Monthly revenue
    const monthlyResult = await query(
      `SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as revenue,
        COUNT(*) as subscriptions
      FROM subscriptions
      WHERE status IN ('active', 'completed')
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12`
    );

    return Response.json(
      {
        totalRevenue,
        activeSubscriptions: activeCount,
        byType: typeResult.rows,
        byStatus: statusResult.rows,
        monthlyRevenue: monthlyResult.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription analytics error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
