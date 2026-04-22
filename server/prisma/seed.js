/**
 * QuickBite DB Seed Script
 * Uses csv-parse to correctly handle multi-line/quoted Zomato CSV fields.
 *
 * Usage: node prisma/seed.js [path/to/zomato.csv]
 */

require("dotenv").config();
const fs = require("fs");
const { parse } = require("csv-parse");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const CSV_PATH =
  process.argv[2] ||
  "C:\\Users\\Ayush Vaish\\Downloads\\zomato.csv\\zomato.csv";
const MAX_RESTAURANTS = 100;

// Bangalore area approximate coordinates
const AREA_COORDS = {
  Banashankari: [12.9257, 77.5468],
  "Koramangala 5th Block": [12.9364, 77.6139],
  "Koramangala 7th Block": [12.9262, 77.6226],
  BTM: [12.9165, 77.6101],
  "HSR Layout": [12.9082, 77.6476],
  Indiranagar: [12.9784, 77.6408],
  Whitefield: [12.9698, 77.7499],
  Jayanagar: [12.9318, 77.5836],
  Marathahalli: [12.9591, 77.6974],
  "MG Road": [12.9752, 77.6186],
  "Brigade Road": [12.9721, 77.6079],
  "Old Airport Road": [12.9601, 77.6499],
  "Electronic City": [12.8451, 77.6601],
  Yelahanka: [13.1006, 77.5964],
  "JP Nagar": [12.9073, 77.5863],
  Malleshwaram: [13.0035, 77.5706],
  Basavanagudi: [12.9432, 77.5758],
  Shivajinagar: [12.9878, 77.5982],
};
const DEFAULT_COORDS = [12.9716, 77.5946];

const jitter = ([lat, lng]) => [
  lat + (Math.random() - 0.5) * 0.04,
  lng + (Math.random() - 0.5) * 0.04,
];

const parseRate = (s) => {
  if (!s || s === "NEW" || s === "-") return 3.5 + Math.random() * 0.8;
  const m = s.match(/(\d+\.?\d*)/);
  return m ? Math.min(5, Math.max(1, parseFloat(m[1]))) : 3.5;
};

const parseCost = (s) => {
  if (!s) return 300;
  const n = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) || n < 100 ? 300 : n;
};

const parseCuisines = (s) =>
  (s || "Multi-Cuisine")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 5);

const parseDishes = (s) =>
  (s || "")
    .split(",")
    .map((d) => d.trim())
    .filter((d) => d.length > 2 && d.length < 60)
    .slice(0, 10);

const isVegDish = (name) => {
  const nonVeg = ["chicken", "mutton", "fish", "prawn", "egg", "lamb", "beef", "pork", "crab", "keema"];
  return !nonVeg.some((k) => name.toLowerCase().includes(k));
};

const buildMenuItems = (dishes, costForTwo, restaurantId, restType) => {
  const basePrice = Math.max(5000, Math.round((costForTwo / 4) * 100));
  const categories = [restType || "Main Course", "Starters", "Desserts", "Beverages"];

  if (!dishes.length) {
    return [
      { name: "Special Thali", price: basePrice, category: "Main Course", isVeg: true },
      { name: "Veg Biryani", price: Math.round(basePrice * 0.9), category: "Main Course", isVeg: true },
      { name: "Chicken Biryani", price: Math.round(basePrice * 1.1), category: "Main Course", isVeg: false },
      { name: "Masala Chai", price: 3000, category: "Beverages", isVeg: true },
      { name: "Gulab Jamun", price: 7000, category: "Desserts", isVeg: true },
    ].map((item) => ({ ...item, restaurantId, isAvailable: true, description: null, imageUrl: null }));
  }

  return dishes.map((name, idx) => ({
    restaurantId,
    name,
    price: Math.max(5000, basePrice + Math.round((Math.random() - 0.5) * basePrice * 0.4)),
    category: categories[idx % categories.length],
    isVeg: isVegDish(name),
    isAvailable: true,
    description: null,
    imageUrl: null,
  }));
};

const isValidName = (name) =>
  name &&
  name.length > 1 &&
  name.length < 101 &&
  !/^rated/i.test(name) &&
  !/^\[/.test(name) &&
  !/^https?:\/\//.test(name);

async function streamCSV() {
  return new Promise((resolve, reject) => {
    const rows = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true,
      on_record: (record) => {
        if (rows.length >= MAX_RESTAURANTS) return null; // skip remaining
        const name = record["name"]?.trim();
        if (!isValidName(name)) return null;
        return {
          name,
          address: record["address"]?.trim() || "",
          location: record["location"]?.trim() || "Bangalore",
          cuisines: record["cuisines"]?.trim() || "",
          rate: record["rate"]?.trim() || "",
          votes: record["votes"]?.trim() || "0",
          cost: record["approx_cost(for two people)"]?.trim() || "300",
          dishLiked: record["dish_liked"]?.trim() || "",
          restType: record["rest_type"]?.trim() || "",
        };
      },
    });

    parser.on("readable", () => {
      let row;
      while ((row = parser.read()) !== null) {
        if (row && rows.length < MAX_RESTAURANTS) rows.push(row);
      }
    });
    parser.on("end", () => resolve(rows));
    parser.on("error", reject);

    fs.createReadStream(CSV_PATH).pipe(parser);
  });
}

async function main() {
  console.log("🌱 Starting QuickBite seed...");

  const password = await bcrypt.hash("Test1234!", 12);
  const [admin, owner] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@quickbite.com" },
      update: {},
      create: { name: "Admin User", email: "admin@quickbite.com", password, role: "ADMIN" },
    }),
    prisma.user.upsert({
      where: { email: "owner@quickbite.com" },
      update: {},
      create: { name: "Restaurant Owner", email: "owner@quickbite.com", password, role: "RESTAURANT_OWNER" },
    }),
    prisma.user.upsert({
      where: { email: "user@quickbite.com" },
      update: {},
      create: { name: "Test User", email: "user@quickbite.com", password, role: "USER" },
    }),
  ]);
  console.log("✅ Test users ready (password: Test1234!)");

  console.log("📂 Streaming Zomato CSV...");
  const rows = await streamCSV();
  console.log(`📊 ${rows.length} valid restaurants parsed`);

  let created = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const [lat, lng] = jitter(AREA_COORDS[row.location] || DEFAULT_COORDS);
    const costForTwo = parseCost(row.cost);

    try {
      const restaurant = await prisma.restaurant.create({
        data: {
          ownerId: i < 5 ? owner.id : admin.id,
          name: row.name.slice(0, 100),
          description: row.restType || null,
          cuisines: parseCuisines(row.cuisines),
          address: (row.address || row.location).slice(0, 255),
          city: row.location,
          lat,
          lng,
          avgRating: parseRate(row.rate),
          totalRatings: parseInt(row.votes) || 0,
          costForTwo,
          deliveryTime: 20 + Math.floor(Math.random() * 30),
          isOpen: true,
          isApproved: true,
        },
      });

      const items = buildMenuItems(parseDishes(row.dishLiked), costForTwo, restaurant.id, row.restType);
      await prisma.menuItem.createMany({ data: items });
      created++;
      if (created % 25 === 0) console.log(`   ${created}/${rows.length} seeded...`);
    } catch {
      // skip duplicate names or bad rows
    }
  }

  console.log(`\n✅ Seeded ${created} restaurants`);
  const menuCount = await prisma.menuItem.count();
  console.log(`✅ ${menuCount} menu items total`);
  console.log("\n🎉 Seed complete! Test credentials:");
  console.log("   👤 user@quickbite.com   / Test1234!");
  console.log("   🍽️  owner@quickbite.com  / Test1234!");
  console.log("   🔑 admin@quickbite.com  / Test1234!");
}

main()
  .catch((err) => { console.error("❌ Seed failed:", err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
