// Mock Database for development - replaces PostgreSQL
import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const PASSWORD_HASH = await bcrypt.hash("password123", 10);

// In-memory data storage
const db = {
  users: [],
  providers: [],
  menu: [],
  orders: [],
};

// Initialize with seed data
const PROVIDERS_DATA = [
  {
    user: {
      name: "Kamala Devi",
      email: "kamala@momsmagic.in",
      phone: "9831001234",
    },
    kitchen: {
      kitchen_name: "Kamala's Kitchen",
      description:
        "Authentic Bengali home cooking — freshly made every morning with love.",
      location: "Salt Lake, Sector V",
      city: "Kolkata",
      phone: "9831001234",
      is_veg: true,
      is_nonveg: true,
      is_verified: true,
      price_from: 70,
      delivery_time: "1pm & 8pm",
      rating: 4.8,
      total_orders: 340,
    },
  },
  {
    user: {
      name: "Ravi Kumar",
      email: "ravi@momsmagic.in",
      phone: "9831005678",
    },
    kitchen: {
      kitchen_name: "Ravi's North Indian Kitchen",
      description:
        "Desi North Indian food - Roti, curry, and pure ghee from an old-school cook.",
      location: "Ballygunge",
      city: "Kolkata",
      phone: "9831005678",
      is_veg: true,
      is_nonveg: true,
      is_verified: true,
      price_from: 75,
      delivery_time: "12:30pm & 7:30pm",
      rating: 4.5,
      total_orders: 210,
    },
  },
  {
    user: {
      name: "Priya Singh",
      email: "priya@momsmagic.in",
      phone: "9831009999",
    },
    kitchen: {
      kitchen_name: "Priya's Veggie Haven",
      description: "Pure vegetarian meals - healthy, tasty, and affordable.",
      location: "Kolkata Central",
      city: "Kolkata",
      phone: "9831009999",
      is_veg: true,
      is_nonveg: false,
      is_verified: true,
      price_from: 60,
      delivery_time: "1pm & 8pm",
      rating: 4.7,
      total_orders: 520,
    },
  },
];

// Initialize seed data
function initializeDb() {
  PROVIDERS_DATA.forEach((provider) => {
    const userId = randomUUID();
    const providerId = randomUUID();

    db.users.push({
      id: userId,
      name: provider.user.name,
      email: provider.user.email,
      password_hash: PASSWORD_HASH,
      phone: provider.user.phone,
      role: "provider",
      avatar_url: null,
      created_at: new Date(),
    });

    db.providers.push({
      id: providerId,
      user_id: userId,
      ...provider.kitchen,
      is_active: true,
      cover_image_url: null,
      cover_image_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    });
  });
}

initializeDb();

// Mock pool query function
export const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      let rows = [];

      // Handle providers list query
      if (text.includes("FROM providers")) {
        // Always map providers with user data
        rows = db.providers.map((provider) => {
          const user = db.users.find((u) => u.id === provider.user_id);
          return {
            ...provider,
            owner_name: user?.name || "Unknown",
            owner_email: user?.email || "",
          };
        });

        console.log(`[DB] Returning ${rows.length} providers`);

        // Sort by rating and total_orders
        rows.sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.total_orders - a.total_orders;
        });
      } else if (text.includes("FROM users")) {
        rows = db.users;
      } else if (text.includes("FROM menu_items")) {
        rows = db.menu;
      } else if (text.includes("FROM orders")) {
        rows = db.orders;
      }
      // Handle INSERT queries
      else if (text.includes("INSERT")) {
        rows = [{ id: randomUUID() }];
      }
      // Handle UPDATE queries
      else if (text.includes("UPDATE")) {
        rows = [{ id: params[0] }];
      }

      resolve({ rows, rowCount: rows.length });
    } catch (err) {
      console.error("Mock DB Error:", err, "SQL:", text);
      reject(err);
    }
  });
};

export default {
  query,
  on: () => {},
};
