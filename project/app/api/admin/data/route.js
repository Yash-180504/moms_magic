import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuth, checkRole, err } from '@/lib/auth'

export async function GET(request) {
  const { payload, unauth } = getAuth(request)
  if (unauth) return unauth

  const roleErr = checkRole(payload, 'admin')
  if (roleErr) return roleErr

  try {
    const usersRes = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 200')
    const providersRes = await query(
      `SELECT p.*, u.name AS owner_name, u.email AS owner_email
       FROM providers p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC LIMIT 200`
    )
    const ordersRes = await query(
      `SELECT o.*, p.kitchen_name, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN providers p ON p.id = o.provider_id
       JOIN users u ON u.id = o.customer_id
       ORDER BY o.created_at DESC LIMIT 200`
    )
    const salesRes = await query('SELECT COALESCE(SUM(total_amount),0) AS total_sales, COUNT(*) AS total_orders FROM orders')
    const activeProvidersRes = await query('SELECT COUNT(*) AS active_providers FROM providers WHERE is_active = TRUE')
    const customerRes = await query("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'")

    return NextResponse.json({
      users: usersRes.rows,
      providers: providersRes.rows,
      orders: ordersRes.rows,
      summary: {
        total_sales: Number(salesRes.rows[0].total_sales || 0),
        total_orders: Number(salesRes.rows[0].total_orders || 0),
        active_providers: Number(activeProvidersRes.rows[0].active_providers || 0),
        total_customers: Number(customerRes.rows[0].total_customers || 0),
        total_users: usersRes.rows.length,
      },
    })
  } catch (error) {
    console.error('GET /api/admin/data failed:', error)
    return err(error.message || 'Failed to load admin data', 500)
  }
}
