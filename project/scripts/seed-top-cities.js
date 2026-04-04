/* Seed sample providers + menu items across the top-tier cities.

   Usage:
     DATABASE_URL=... node scripts/seed-top-cities.js

   Notes:
   - Creates provider-owner users with role='provider'
   - Creates 8 providers per city (idempotent by email)
   - Adds 10-12 menu items per provider (if none exist)
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

const PROVIDER_VARIANTS = [
  {
    suffix: "Veg Feast",
    description: "Pure vegetarian kitchen with rich Punjabi, South Indian and street food classics.",
    is_veg: true,
    is_nonveg: false,
  },
  {
    suffix: "Tandoori Grill",
    description: "Pure non-veg kitchen serving tandoori, biryani and spicy meat curries.",
    is_veg: false,
    is_nonveg: true,
  },
  {
    suffix: "Homestyle Meals",
    description: "Mixed kitchen with homestyle veg and non-veg meals for every craving.",
    is_veg: true,
    is_nonveg: true,
  },
  {
    suffix: "Express Diner",
    description: "Fast and flavorful favorites with both vegetarian and non-veg comfort food.",
    is_veg: true,
    is_nonveg: true,
  },
  {
    suffix: "Pure Veg Kitchen",
    description: "Strictly vegetarian menu with healthy bowls, thalis and snack plates.",
    is_veg: true,
    is_nonveg: false,
  },
  {
    suffix: "Non-Veg Bazaar",
    description: "Rich non-veg preparations from coastal fish fry to Hyderabadi biryani.",
    is_veg: false,
    is_nonveg: true,
  },
  {
    suffix: "Street Food Hub",
    description: "Mixed street food kitchen with chaats, rolls, kebabs and regional classics.",
    is_veg: true,
    is_nonveg: true,
  },
  {
    suffix: "Comfort Kitchen",
    description: "Mixed comfort meals with hearty curries, rice bowls and daily specials.",
    is_veg: true,
    is_nonveg: true,
  },
];

const DUMMY_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1528731708534-816fe59f90b2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1514516870926-5e35b25ab9ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
];

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getOrCreateUser(client, { name, email, phone, role }) {
  const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
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
  const existing = await client.query("SELECT id FROM providers WHERE user_id = $1", [provider.user_id]);
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
        cover_image_url = $12,
        updated_at = NOW()
       WHERE id = $13`,
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
        provider.cover_image_url || null,
        id,
      ],
    );
    return id;
  }

  const inserted = await client.query(
    `INSERT INTO providers
      (user_id, kitchen_name, description, location, city, phone,
       is_veg, is_nonveg, is_verified, is_active, price_from, delivery_time, rating, cover_image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE,$10,$11,$12,$13)
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
      provider.cover_image_url || null,
    ],
  );
  return inserted.rows[0].id;
}

async function seedMenuIfEmpty(client, provider) {
  const existing = await client.query(
    "SELECT id FROM menu_items WHERE provider_id = $1 LIMIT 1",
    [provider.providerId],
  );
  if (existing.rows.length) return;

  const vegItems = [
    {
      name: "Paneer Butter Masala",
      description: "Creamy cottage cheese cooked in rich tomato gravy.",
      price: 179,
      category: "Curry",
      is_veg: true,
    },
    {
      name: "Masala Dosa",
      description: "Crispy rice dosa served with potato masala and chutney.",
      price: 129,
      category: "South Indian",
      is_veg: true,
    },
    {
      name: "Chole Bhature",
      description: "Spicy chickpea curry with fluffy fried bread.",
      price: 149,
      category: "Street Food",
      is_veg: true,
    },
    {
      name: "Palak Paneer",
      description: "Spinach curry with soft paneer cubes.",
      price: 159,
      category: "Curry",
      is_veg: true,
    },
    {
      name: "Veg Biryani",
      description: "Aromatic basmati rice cooked with vegetables and spices.",
      price: 169,
      category: "Biryani",
      is_veg: true,
    },
    {
      name: "Aloo Paratha",
      description: "Stuffed potato flatbread served with curd and pickle.",
      price: 99,
      category: "Breakfast",
      is_veg: true,
    },
    {
      name: "Malai Kofta",
      description: "Cheese dumplings in a creamy, mildly spiced sauce.",
      price: 189,
      category: "Curry",
      is_veg: true,
    },
    {
      name: "Veg Korma",
      description: "Mixed vegetables simmered in a rich cashew-based gravy.",
      price: 169,
      category: "Curry",
      is_veg: true,
    },
    {
      name: "Dahi Puri",
      description: "Crispy puris topped with yogurt, chutney, and sev.",
      price: 119,
      category: "Street Food",
      is_veg: true,
    },
    {
      name: "Vegetable Manchurian",
      description: "Indo-Chinese vegetable balls tossed in tangy sauce.",
      price: 149,
      category: "Chinese",
      is_veg: true,
    },
    {
      name: "Gobi Manchurian",
      description: "Crispy cauliflower in a spicy soy-based sauce.",
      price: 149,
      category: "Chinese",
      is_veg: true,
    },
    {
      name: "Paneer Tikka",
      description: "Marinated paneer grilled with bell peppers.",
      price: 179,
      category: "Starters",
      is_veg: true,
    },
  ];

  const nonVegItems = [
    {
      name: "Butter Chicken",
      description: "Tender chicken in creamy tomato gravy.",
      price: 229,
      category: "Curry",
      is_veg: false,
    },
    {
      name: "Hyderabadi Biryani",
      description: "Fragrant layered rice with spiced chicken.",
      price: 249,
      category: "Biryani",
      is_veg: false,
    },
    {
      name: "Rogan Josh",
      description: "Slow-cooked lamb in aromatic spices.",
      price: 259,
      category: "Curry",
      is_veg: false,
    },
    {
      name: "Fish Fry",
      description: "Crispy spiced fish fillet with lemon and herbs.",
      price: 199,
      category: "Seafood",
      is_veg: false,
    },
    {
      name: "Chicken 65",
      description: "Spicy fried chicken with curry leaves.",
      price: 189,
      category: "Starters",
      is_veg: false,
    },
    {
      name: "Mutton Keema",
      description: "Minced lamb cooked with peas and Indian spices.",
      price: 219,
      category: "Curry",
      is_veg: false,
    },
    {
      name: "Prawn Masala",
      description: "Succulent prawns in a rich coconut and tomato sauce.",
      price: 239,
      category: "Seafood",
      is_veg: false,
    },
    {
      name: "Egg Curry",
      description: "Boiled eggs simmered in spicy onion tomato gravy.",
      price: 149,
      category: "Curry",
      is_veg: false,
    },
    {
      name: "Chicken Tikka",
      description: "Tandoori chicken pieces marinated in yogurt and spices.",
      price: 199,
      category: "Starters",
      is_veg: false,
    },
    {
      name: "Keema Pav",
      description: "Spiced minced meat served with buttered bread rolls.",
      price: 159,
      category: "Street Food",
      is_veg: false,
    },
    {
      name: "Mutton Biryani",
      description: "Slow-cooked mutton biryani with saffron and spices.",
      price: 269,
      category: "Biryani",
      is_veg: false,
    },
    {
      name: "Chicken Korma",
      description: "Creamy spiced chicken curry with nuts.",
      price: 219,
      category: "Curry",
      is_veg: false,
    },
  ];

  const items = provider.is_veg && provider.is_nonveg
    ? [...vegItems.slice(0, 6), ...nonVegItems.slice(0, 6)]
    : provider.is_veg
    ? vegItems.slice(0, 12)
    : nonVegItems.slice(0, 12);

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const imageUrl = DUMMY_IMAGE_URLS[index % DUMMY_IMAGE_URLS.length];

    await client.query(
      `INSERT INTO menu_items (provider_id, name, description, price, image_url, is_veg, category)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        provider.providerId,
        `${item.name} (${provider.city})`,
        item.description,
        item.price,
        imageUrl,
        item.is_veg,
        item.category,
      ],
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

      for (let i = 0; i < PROVIDER_VARIANTS.length; i += 1) {
        const variant = PROVIDER_VARIANTS[i];
        const index = i + 1;
        const email = `seed.provider.${citySlug}.${index}@moms-magic.local`;
        const userId = await getOrCreateUser(client, {
          name: `${city} Kitchen ${index}`,
          email,
          phone: `90000${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
          role: "provider",
        });

        const providerId = await getOrCreateProvider(client, {
          user_id: userId,
          kitchen_name: `${city} ${variant.suffix}`,
          description: variant.description,
          location: `${variant.suffix} Zone, ${city}`,
          city,
          phone: null,
          is_veg: variant.is_veg,
          is_nonveg: variant.is_nonveg,
          is_verified: true,
          price_from: 89 + index * 10,
          delivery_time: "30-45 mins",
          rating: 4 + Math.round(Math.random() * 10) / 10,
          cover_image_url: DUMMY_IMAGE_URLS[index % DUMMY_IMAGE_URLS.length],
        });

        await seedMenuIfEmpty(client, { providerId, city, ...variant });
        createdProviders += 1;
      }
    }

    await client.query("COMMIT");
    console.log(`Seed complete. Created or updated ${createdProviders} providers across ${TOP_TIER_CITIES.length} cities.`);
  } catch (error) {
    console.error("Seeding failed:", error);
    await client.query("ROLLBACK");
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
