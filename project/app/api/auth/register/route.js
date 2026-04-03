import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signToken, safeUser, err } from "@/lib/auth";

export async function POST(request) {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = "customer",
    } = await request.json();

    if (!name || !email || !password)
      return err("name, email and password are required", 400);
    if (!["customer", "provider", "delivery_partner"].includes(role))
      return err("role must be customer, provider, or delivery_partner", 400);

    const existing = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length) return err("Email already registered", 409);

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, email, password_hash, phone || null, role],
    );

    const user = result.rows[0];
    return NextResponse.json(
      { token: signToken(user), user: safeUser(user) },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return err(e.message);
  }
}
