import { NextResponse } from "next/server";
import pool, { query } from "@/lib/db";
import { getAuth, checkRole, err } from "@/lib/auth";
import { computeFees } from "@/lib/fees";

// POST /api/orders
export async function POST(request) {
  const { payload, unauth } = getAuth(request);
  if (unauth) return unauth;
  const roleErr = checkRole(payload, "customer", "admin");
  if (roleErr) return roleErr;

  try {
    const { provider_id, delivery_address, notes, items } =
      await request.json();

    if (!provider_id || !delivery_address || !items?.length)
      return err("provider_id, delivery_address and items are required", 400);

    const pRes = await query(
      "SELECT id FROM providers WHERE id = $1 AND is_active = TRUE",
      [provider_id],
    );
    if (!pRes.rows.length) return err("Provider not found or inactive", 404);

    const itemIds = items.map((i) => i.menu_item_id);
    const menuRes = await query(
      `SELECT id, name, price FROM menu_items WHERE id = ANY($1) AND is_available = TRUE`,
      [itemIds],
    );
    const menuMap = Object.fromEntries(menuRes.rows.map((r) => [r.id, r]));

    let subtotal = 0;
    const validatedItems = [];
    for (const item of items) {
      const menu = menuMap[item.menu_item_id];
      if (!menu)
        return err(
          `Menu item ${item.menu_item_id} not found or unavailable`,
          400,
        );
      const qty = parseInt(item.quantity) || 1;
      subtotal += menu.price * qty;
      validatedItems.push({
        menu_item_id: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: qty,
      });
    }

    const { grandTotal } = computeFees(subtotal);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderRes = await client.query(
        `INSERT INTO orders (customer_id, provider_id, total_amount, delivery_address, notes)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [payload.sub, provider_id, grandTotal, delivery_address, notes || null],
      );
      const order = orderRes.rows[0];

      for (const it of validatedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, name, quantity, price)
           VALUES ($1,$2,$3,$4,$5)`,
          [order.id, it.menu_item_id, it.name, it.quantity, it.price],
        );
      }

      await client.query(
        "UPDATE providers SET total_orders = total_orders + 1, updated_at = NOW() WHERE id = $1",
        [provider_id],
      );

      await client.query("COMMIT");
      order.items = validatedItems;
      return NextResponse.json({ order }, { status: 201 });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return err(e.message);
  }
}

// GET /api/orders
export async function GET(request) {
  const { payload, unauth } = getAuth(request);
  if (unauth) return unauth;

  const roleErr = checkRole(
    payload,
    "customer",
    "provider",
    "admin",
    "delivery_partner",
  );
  if (roleErr) return roleErr;

  try {
    let result;
    if (payload.role === "customer") {
      result = await query(
        `SELECT o.*, p.kitchen_name, p.cover_image_url,
                json_agg(json_build_object('id',oi.id,'name',oi.name,'quantity',oi.quantity,'price',oi.price)) AS items
         FROM orders o
         JOIN providers p ON p.id = o.provider_id
         JOIN order_items oi ON oi.order_id = o.id
         WHERE o.customer_id = $1
         GROUP BY o.id, p.kitchen_name, p.cover_image_url
         ORDER BY o.created_at DESC`,
        [payload.sub],
      );
    } else if (payload.role === "provider") {
      const pRes = await query("SELECT id FROM providers WHERE user_id = $1", [
        payload.sub,
      ]);
      if (!pRes.rows.length) return NextResponse.json({ orders: [] });
      result = await query(
        `SELECT o.*, u.name AS customer_name, u.phone AS customer_phone,
                json_agg(json_build_object('id',oi.id,'name',oi.name,'quantity',oi.quantity,'price',oi.price)) AS items
         FROM orders o
         JOIN users u ON u.id = o.customer_id
         JOIN order_items oi ON oi.order_id = o.id
         WHERE o.provider_id = $1
         GROUP BY o.id, u.name, u.phone
         ORDER BY o.created_at DESC`,
        [pRes.rows[0].id],
      );
    } else if (payload.role === "delivery_partner") {
      result = await query(
        `SELECT o.*, p.kitchen_name, u.name AS customer_name,
                json_agg(json_build_object('id',oi.id,'name',oi.name,'quantity',oi.quantity,'price',oi.price)) AS items
         FROM orders o
         JOIN providers p ON p.id = o.provider_id
         JOIN users u ON u.id = o.customer_id
         JOIN order_items oi ON oi.order_id = o.id
         WHERE o.status = ANY($1)
         GROUP BY o.id, p.kitchen_name, u.name
         ORDER BY o.created_at DESC`,
        [["pending", "confirmed", "preparing", "out_for_delivery"]],
      );
    } else {
      result = await query(
        `SELECT o.*, p.kitchen_name, u.name AS customer_name,
                json_agg(json_build_object('id',oi.id,'name',oi.name,'quantity',oi.quantity,'price',oi.price)) AS items
         FROM orders o
         JOIN providers p ON p.id = o.provider_id
         JOIN users u ON u.id = o.customer_id
         JOIN order_items oi ON oi.order_id = o.id
         GROUP BY o.id, p.kitchen_name, u.name
         ORDER BY o.created_at DESC`,
      );
    }
    return NextResponse.json({ orders: result.rows });
  } catch (e) {
    return err(e.message);
  }
}
