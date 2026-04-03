/* Seed sample providers + menu items across the top-tier cities.

   Usage:
     DATABASE_URL=... node scripts/seed-top-cities.js

   Notes:
   - Creates provider-owner users with role='provider'
   - Creates 2 providers per city (idempotent by email)
   - Adds a few menu items per provider (if none exist)
*/

const pg = require("pg");
const bcrypt = require("bcryptjs");

const TOP_TIER_CITIES = [
  "Bhubaneswar",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
];

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getOrCreateUser(client, { name, email, phone, role }) {
  const existing = await client.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length) return existing.rows[0].id;

  const passwordHash = await bcrypt.hash("password123", 12);
  const inserted = await client.query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id`,
    [name, email, passwordHash, phone || null, role],
  );
  return inserted.rows[0].id;
}

async function getOrCreateProvider(client, provider) {
  const existing = await client.query(
    "SELECT id FROM providers WHERE user_id = $1",
    [provider.user_id],
  );
  if (existing.rows.length) {
    const id = existing.rows[0].id;
    await client.query(
      `UPDATE providers SET
        kitchen_name = $1,
        description = $2,
        location = $3,
        city = $4,
        phone = $5,
        is_veg = $6,
        is_nonveg = $7,
        is_verified = $8,
        is_active = TRUE,
        price_from = $9,
        delivery_time = $10,
        rating = $11,
        updated_at = NOW()
       WHERE id = $12`,
      [
        provider.kitchen_name,
        provider.description,
        provider.location,
        provider.city,
        provider.phone || null,
        provider.is_veg,
        provider.is_nonveg,
        provider.is_verified,
        provider.price_from,
        provider.delivery_time || null,
        provider.rating,
        id,
      ],
    );
    return id;
  }

  const inserted = await client.query(
    `INSERT INTO providers
      (user_id, kitchen_name, description, location, city, phone,
       is_veg, is_nonveg, is_verified, is_active, price_from, delivery_time, rating)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE,$10,$11,$12)
     RETURNING id`,
    [
      provider.user_id,
      provider.kitchen_name,
      provider.description || null,
      provider.location,
      provider.city,
      provider.phone || null,
      provider.is_veg,
      provider.is_nonveg,
      provider.is_verified,
      provider.price_from,
      provider.delivery_time || null,
      provider.rating,
    ],
  );
  return inserted.rows[0].id;
}

async function seedMenuIfEmpty(client, providerId, city) {
  const existing = await client.query(
    "SELECT id FROM menu_items WHERE provider_id = $1 LIMIT 1",
    [providerId],
  );
  if (existing.rows.length) return;

  const items = [
    {
      name: `Veg Thali (${city})`,
      description: "Seasonal sabzi, dal, rice, roti, salad",
      price: 99,
      is_veg: true,
      category: "Thali",
    },
    {
      name: `Chicken Curry Meal (${city})`,
      description: "Chicken curry + rice + roti",
      price: 159,
      is_veg: false,
      category: "Non-Veg",
    },
    {
      name: `Paneer Butter Masala (${city})`,
      description: "Creamy paneer gravy + roti",
      price: 149,
      is_veg: true,
      category: "Veg",
    },
    {
      name: `Curd Rice (${city})`,
      description: "Comfort bowl with tempering",
      price: 79,
      is_veg: true,
      category: "Comfort",
    },
  ];

  for (const it of items) {
    await client.query(
      `INSERT INTO menu_items (provider_id, name, description, price, is_veg, category)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [providerId, it.name, it.description, it.price, it.is_veg, it.category],
    );
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query("BEGIN");

    let createdProviders = 0;
    for (const city of TOP_TIER_CITIES) {
      const citySlug = slugify(city);

      for (let i = 1; i <= 2; i++) {
        const email = `seed.provider.${citySlug}.${i}@moms-magic.local`;
        const userId = await getOrCreateUser(client, {
          name: `Seed Cook ${city} ${i}`,
          email,
          phone: `90000${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
          role: "provider",
        });

        const providerId = await getOrCreateProvider(client, {
          user_id: userId,
          kitchen_name: `${city} Homestyle Kitchen ${i}`,
          description: `Fresh homestyle meals in ${city}.`,
          location: `Central ${city}`,
          city,
          phone: null,
          is_veg: i % 2 === 1,
          is_nonveg: true,
          is_verified: true,
          price_from: 79 + i * 10,
          delivery_time: "30-45 mins",
          rating: 4.5,
        });

        await seedMenuIfEmpty(client, providerId, city);
        createdProviders += 1;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Seed complete. Ensured providers across cities. Providers processed: ${createdProviders}`,
    );
    console.log(
      "Login for seeded provider accounts (all share password: password123)",
    );
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
