import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pool from './index.js'

const PASSWORD_HASH = await bcrypt.hash('password123', 10)

// ── Seed data ──────────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    user: {
      name: 'Kamala Devi',
      email: 'kamala@momsmagic.in',
      phone: '9831001234',
    },
    kitchen: {
      kitchen_name: "Kamala's Kitchen",
      description: 'Authentic Bengali home cooking — freshly made every morning with love. Dal, fish curry, shukto, cholar dal, and rotating sabzi served with steamed rice.',
      location: 'Salt Lake, Sector V',
      city: 'Kolkata',
      phone: '9831001234',
      is_veg: true,
      is_nonveg: true,
      is_verified: true,
      price_from: 70,
      delivery_time: '1pm & 8pm',
      rating: 4.8,
      total_orders: 340,
    },
    menu: [
      { name: 'Bengali Thali (Veg)', description: 'Rice, dal, shukto, aloo posto, chutney, papad', price: 80, is_veg: true, category: 'Thali' },
      { name: 'Bengali Thali (Fish)', description: 'Rice, dal, fish curry (rohu/katla), sabzi, chutney', price: 100, is_veg: false, category: 'Thali' },
      { name: 'Luchi & Aloor Dom', description: '4 luchis with spiced potato curry — classic Bengali breakfast', price: 60, is_veg: true, category: 'Breakfast' },
      { name: 'Mutton Curry & Rice', description: 'Slow-cooked mutton in mustard oil with basmati rice', price: 130, is_veg: false, category: 'Dinner' },
      { name: 'Cholar Dal & Roti', description: 'Bengali-style chana dal with ghee and 3 rotis', price: 65, is_veg: true, category: 'Lunch' },
      { name: 'Prawn Malai Curry', description: 'King prawns in coconut milk gravy — Friday special', price: 150, is_veg: false, category: 'Special' },
    ],
  },
  {
    user: {
      name: 'Priya Sharma',
      email: 'priya@momsmagic.in',
      phone: '9820112233',
    },
    kitchen: {
      kitchen_name: "Priya's Pure Veg Tiffin",
      description: 'Pure vegetarian Maharashtrian-style tiffin. No onion, no garlic options available. Ideal for office-goers and students in Andheri.',
      location: 'Andheri West',
      city: 'Mumbai',
      phone: '9820112233',
      is_veg: true,
      is_nonveg: false,
      is_verified: true,
      price_from: 75,
      delivery_time: '12:30pm & 7:30pm',
      rating: 4.6,
      total_orders: 210,
    },
    menu: [
      { name: 'Maharashtrian Thali', description: 'Jowar roti, varan bhaat, sabzi, koshimbir, pickle, papad', price: 90, is_veg: true, category: 'Thali' },
      { name: 'Misal Pav', description: 'Spicy sprouted moth curry topped with farsan, served with 2 pavs', price: 70, is_veg: true, category: 'Breakfast' },
      { name: 'Vada Pav Combo', description: '2 vada pavs + green chutney + masala chai', price: 55, is_veg: true, category: 'Snack' },
      { name: 'Pithla Bhakri', description: 'Besan pithla with bajra bhakri and raw onion — rustic & filling', price: 65, is_veg: true, category: 'Lunch' },
      { name: 'Puran Poli Meal', description: 'Sweet chana dal stuffed roti with toop (ghee), aamti, rice', price: 85, is_veg: true, category: 'Special' },
      { name: 'Pohe + Chai', description: 'Classic kanda pohe with lemon and coriander, served with chai', price: 45, is_veg: true, category: 'Breakfast' },
    ],
  },
  {
    user: {
      name: 'Fatima Shaikh',
      email: 'fatima@momsmagic.in',
      phone: '9866223344',
    },
    kitchen: {
      kitchen_name: "Fatima's Hyderabadi Kitchen",
      description: 'Traditional Hyderabadi home food — rich, aromatic, and made the old-school way. Dum biryani cooked fresh every day. No shortcuts.',
      location: 'Tolichowki',
      city: 'Hyderabad',
      phone: '9866223344',
      is_veg: false,
      is_nonveg: true,
      is_verified: true,
      price_from: 90,
      delivery_time: '1pm & 8:30pm',
      rating: 4.9,
      total_orders: 520,
    },
    menu: [
      { name: 'Chicken Dum Biryani', description: 'Slow-cooked dum biryani with saffron, fried onions, raita and mirchi ka salan', price: 130, is_veg: false, category: 'Biryani' },
      { name: 'Mutton Biryani', description: 'Tender mutton on-the-bone biryani — weekend special', price: 160, is_veg: false, category: 'Biryani' },
      { name: 'Egg Biryani', description: 'Fluffy basmati with whole boiled eggs, masala and raita', price: 100, is_veg: false, category: 'Biryani' },
      { name: 'Chicken Curry & Roti', description: 'Hyderabadi-style chicken curry with 4 roomali rotis', price: 110, is_veg: false, category: 'Lunch' },
      { name: 'Haleem', description: 'Slow-cooked wheat and mutton stew — available Thursday to Sunday', price: 120, is_veg: false, category: 'Special' },
      { name: 'Double Ka Meetha', description: 'Hyderabadi bread pudding in saffron rabri — dessert add-on', price: 50, is_veg: false, category: 'Dessert' },
    ],
  },
  {
    user: {
      name: 'Sunita Agarwal',
      email: 'sunita@momsmagic.in',
      phone: '9810334455',
    },
    kitchen: {
      kitchen_name: 'Sunita Didi Ka Dabba',
      description: 'Ghar jaisa khana — roz nayi sabzi, dal, chawal, roti. Pure North Indian home cooking for students and office workers in South Delhi.',
      location: 'Lajpat Nagar',
      city: 'Delhi',
      phone: '9810334455',
      is_veg: true,
      is_nonveg: false,
      is_verified: true,
      price_from: 65,
      delivery_time: '1pm & 7:30pm',
      rating: 4.5,
      total_orders: 285,
    },
    menu: [
      { name: 'Full Veg Dabba', description: '4 rotis, dal, sabzi (2 types), rice, salad, achaar', price: 80, is_veg: true, category: 'Thali' },
      { name: 'Mini Dabba', description: '2 rotis, dal, one sabzi, rice — light meal option', price: 60, is_veg: true, category: 'Thali' },
      { name: 'Rajma Chawal', description: 'Slow-cooked kidney beans with basmati rice and papad', price: 70, is_veg: true, category: 'Lunch' },
      { name: 'Kadhi Pakora & Rice', description: 'Creamy yogurt-based kadhi with gram flour pakoras', price: 65, is_veg: true, category: 'Lunch' },
      { name: 'Aloo Paratha Combo', description: '2 stuffed parathas with butter, dahi, and pickle', price: 55, is_veg: true, category: 'Breakfast' },
      { name: 'Chole Bhature', description: 'Spicy Punjabi chole with 2 fluffy bhature', price: 70, is_veg: true, category: 'Breakfast' },
      { name: 'Palak Paneer Thali', description: 'Rich spinach-paneer curry, dal, 3 rotis, rice, salad', price: 90, is_veg: true, category: 'Special' },
    ],
  },
  {
    user: {
      name: 'Lakshmi Narayanan',
      email: 'lakshmi@momsmagic.in',
      phone: '9845445566',
    },
    kitchen: {
      kitchen_name: 'Lakshmi Amma South Indian Meals',
      description: 'Authentic Tamilian home meals prepared with traditional recipes passed down four generations. Served on banana leaf every Sunday.',
      location: 'Jayanagar',
      city: 'Bengaluru',
      phone: '9845445566',
      is_veg: true,
      is_nonveg: false,
      is_verified: false,
      price_from: 60,
      delivery_time: '12pm & 7pm',
      rating: 4.7,
      total_orders: 195,
    },
    menu: [
      { name: 'South Indian Meals', description: 'Rice, sambar, rasam, 2 dry sabzi, kootu, curd, papad, pickle', price: 75, is_veg: true, category: 'Thali' },
      { name: 'Idli Sambar (6 pcs)', description: 'Soft steamed rice cakes with sambar and 2 chutneys', price: 55, is_veg: true, category: 'Breakfast' },
      { name: 'Masala Dosa', description: 'Crispy dosa with spiced potato filling, sambar, coconut chutney', price: 65, is_veg: true, category: 'Breakfast' },
      { name: 'Ven Pongal', description: 'Creamy rice-lentil pongal with ghee, pepper, and coconut chutney', price: 60, is_veg: true, category: 'Breakfast' },
      { name: 'Curd Rice', description: 'Tempered curd rice with pomegranate — cooling summer special', price: 50, is_veg: true, category: 'Lunch' },
      { name: 'Bisibele Bath', description: 'Karnataka-style spiced rice-lentil-vegetable one-pot dish with chips', price: 70, is_veg: true, category: 'Special' },
    ],
  },
  {
    user: {
      name: 'Rekha Mishra',
      email: 'rekha@momsmagic.in',
      phone: '9839556677',
    },
    kitchen: {
      kitchen_name: "Rekha's Awadhi Rasoi",
      description: 'Awadhi home cooking from old Lucknow — slow-cooked gravies, fragrant biryanis, and rich kormas. Non-veg and veg both available.',
      location: 'Gomti Nagar',
      city: 'Lucknow',
      phone: '9839556677',
      is_veg: true,
      is_nonveg: true,
      is_verified: false,
      price_from: 80,
      delivery_time: '1:30pm & 8pm',
      rating: 4.4,
      total_orders: 155,
    },
    menu: [
      { name: 'Lucknowi Chicken Biryani', description: 'Fragrant dum biryani with Awadhi spices, saffron and rose water', price: 140, is_veg: false, category: 'Biryani' },
      { name: 'Mutton Nihari', description: 'Slow-cooked overnight nihari with sheermal roti — weekend special', price: 170, is_veg: false, category: 'Special' },
      { name: 'Galouti Kebab (6 pcs)', description: 'Melt-in-the-mouth minced mutton kebabs with ulta tawa paratha', price: 120, is_veg: false, category: 'Starter' },
      { name: 'Dal Makhani & Roti', description: 'Creamy overnight dal makhani with 4 tandoori rotis', price: 85, is_veg: true, category: 'Dinner' },
      { name: 'Veg Dum Biryani', description: 'Layered vegetable biryani with saffron and caramelised onions', price: 100, is_veg: true, category: 'Biryani' },
      { name: 'Shahi Paneer Meal', description: 'Rich paneer in cashew-cream gravy with naan and rice', price: 110, is_veg: true, category: 'Special' },
      { name: 'Dahi Bhalla Chaat', description: 'Soft urad dal dumplings in yogurt with tamarind and green chutney', price: 55, is_veg: true, category: 'Snack' },
    ],
  },
]

// ── Run seed ───────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Remove previous seed data (idempotent re-runs)
    const seedEmails = PROVIDERS.map(p => p.user.email)
    await client.query(
      `DELETE FROM users WHERE email = ANY($1)`,
      [seedEmails]
    )

    for (const { user, kitchen, menu } of PROVIDERS) {
      // 1. Create user
      const userRes = await client.query(
        `INSERT INTO users (name, email, password_hash, phone, role)
         VALUES ($1, $2, $3, $4, 'provider')
         RETURNING id`,
        [user.name, user.email, PASSWORD_HASH, user.phone]
      )
      const userId = userRes.rows[0].id

      // 2. Create provider/kitchen
      const provRes = await client.query(
        `INSERT INTO providers
           (user_id, kitchen_name, description, location, city, phone,
            is_veg, is_nonveg, is_verified, is_active,
            price_from, delivery_time, rating, total_orders)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11,$12,$13)
         RETURNING id`,
        [
          userId,
          kitchen.kitchen_name, kitchen.description,
          kitchen.location, kitchen.city, kitchen.phone,
          kitchen.is_veg, kitchen.is_nonveg, kitchen.is_verified,
          kitchen.price_from, kitchen.delivery_time,
          kitchen.rating, kitchen.total_orders,
        ]
      )
      const providerId = provRes.rows[0].id

      // 3. Create menu items
      for (const item of menu) {
        await client.query(
          `INSERT INTO menu_items (provider_id, name, description, price, is_veg, is_available, category)
           VALUES ($1,$2,$3,$4,$5,true,$6)`,
          [providerId, item.name, item.description, item.price, item.is_veg, item.category]
        )
      }

      console.log(`✅ ${kitchen.kitchen_name} — ${menu.length} menu items`)
    }

    await client.query('COMMIT')
    console.log('\n🍱 Seed complete! All providers and menu items inserted.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
