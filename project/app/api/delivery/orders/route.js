import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuth, checkRole, err } from "@/lib/auth";

const AVAILABLE_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
];

// GET /api/delivery/orders
// Delivery partners can see orders that are active and "available" for delivery.
export async function GET(request) {
  const { payload, unauth } = getAuth(request);
  if (unauth) return unauth;

  const roleErr = checkRole(payload, "delivery_partner");
  if (roleErr) return roleErr;

  try {
    const result = await query(
      `SELECT o.*, p.kitchen_name, p.location AS provider_location,
              u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              json_agg(json_build_object('id',oi.id,'name',oi.name,'quantity',oi.quantity,'price',oi.price)) AS items
       FROM orders o
       JOIN providers p ON p.id = o.provider_id
       JOIN users u ON u.id = o.customer_id
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.status = ANY($1)
       GROUP BY o.id, p.kitchen_name, p.location, u.name, u.email, u.phone
       ORDER BY o.created_at DESC
       LIMIT 200`,
      [AVAILABLE_STATUSES],
    );

    return NextResponse.json({ orders: result.rows });
  } catch (e) {
    console.error("GET /api/delivery/orders failed:", e);
    return err(e.message);
  }
}
