/**
 * parse-zomato.js
 * Streams the Zomato CSV, deduplicates by name, and writes
 * a JSON file (zomato-parsed.json) used by seed.js.
 *
 * Usage: node prisma/parse-zomato.js
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const CSV_PATH = "C:\\Users\\Ayush Vaish\\Downloads\\zomato.csv\\zomato.csv";
const OUT_PATH = path.join(__dirname, "zomato-parsed.json");

// Approximate lat/lng for Bangalore neighbourhoods
const LOCATION_COORDS = {
  "Banashankari": { lat: 12.9253, lng: 77.5468 },
  "Basavanagudi": { lat: 12.9421, lng: 77.5752 },
  "Bellandur": { lat: 12.9257, lng: 77.6759 },
  "Banaswadi": { lat: 13.0174, lng: 77.6463 },
  "BTM": { lat: 12.9165, lng: 77.6101 },
  "Electronic City": { lat: 12.8399, lng: 77.6770 },
  "Frazer Town": { lat: 12.9836, lng: 77.6187 },
  "HSR": { lat: 12.9116, lng: 77.6474 },
  "Indiranagar": { lat: 12.9719, lng: 77.6412 },
  "Jayanagar": { lat: 12.9250, lng: 77.5938 },
  "JP Nagar": { lat: 12.9077, lng: 77.5833 },
  "Kalyan Nagar": { lat: 13.0232, lng: 77.6461 },
  "Kammanahalli": { lat: 13.0168, lng: 77.6477 },
  "Koramangala 5th Block": { lat: 12.9279, lng: 77.6271 },
  "Koramangala 7th Block": { lat: 12.9352, lng: 77.6245 },
  "Koramangala": { lat: 12.9279, lng: 77.6271 },
  "Lavelle Road": { lat: 12.9728, lng: 77.5979 },
  "Malleshwaram": { lat: 13.0031, lng: 77.5644 },
  "Marathahalli": { lat: 12.9591, lng: 77.6970 },
  "MG Road": { lat: 12.9757, lng: 77.6060 },
  "New BEL Road": { lat: 13.0353, lng: 77.5697 },
  "Rajajinagar": { lat: 12.9918, lng: 77.5536 },
  "Sarjapur Road": { lat: 12.9102, lng: 77.6784 },
  "Shivajinagar": { lat: 12.9848, lng: 77.6032 },
  "Whitefield": { lat: 12.9698, lng: 77.7499 },
  "Wilson Garden": { lat: 12.9487, lng: 77.6077 },
  "Yelahanka": { lat: 13.1007, lng: 77.5963 },
};

const DEFAULT_BANGALORE = { lat: 12.9716, lng: 77.5946 };

function getCoords(location) {
  if (!location) return DEFAULT_BANGALORE;
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (location.toLowerCase().includes(key.toLowerCase())) return coords;
  }
  return DEFAULT_BANGALORE;
}

function parseRate(rate) {
  if (!rate || rate === "NEW" || rate === "-") return null;
  const match = rate.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

function parseCost(cost) {
  if (!cost) return null;
  const n = parseInt(cost.replace(/,/g, ""), 10);
  return isNaN(n) ? null : n * 100; // convert to paise
}

function parseCuisines(cuisineStr) {
  if (!cuisineStr) return [];
  return cuisineStr.split(",").map((c) => c.trim()).filter(Boolean).slice(0, 5);
}

function parseDishLiked(dishStr) {
  if (!dishStr) return [];
  return dishStr.split(",").map((d) => d.trim()).filter(Boolean).slice(0, 12);
}

async function main() {
  console.log("Streaming CSV…");

  const seen = new Set();
  const restaurants = [];
  let rowCount = 0;

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH, { encoding: "utf8" })
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          relax_column_count: true,
          relax_quotes: true,
          trim: true,
        })
      )
      .on("data", (row) => {
        rowCount++;
        const name = (row["name"] || "").trim();
        if (!name || seen.has(name)) return;
        seen.add(name);

        const location = (row["location"] || "").trim();
        const coords = getCoords(location);
        const rate = parseRate(row["rate"]);
        const cuisines = parseCuisines(row["cuisines"]);
        const dishes = parseDishLiked(row["dish_liked"]);
        const cost = parseCost(row["approx_cost(for two people)"]);
        const address = (row["address"] || "").trim() || `${location}, Bangalore`;
        const phone = (row["phone"] || "").trim().split("\n")[0].trim();

        restaurants.push({
          name,
          address: address.slice(0, 200),
          city: "Bangalore",
          location,
          cuisines: cuisines.length ? cuisines : ["Multi-Cuisine"],
          avgRating: rate,
          costForTwo: cost,
          phone: phone.slice(0, 20) || null,
          lat: coords.lat + (Math.random() - 0.5) * 0.01, // slight jitter so they're not all identical
          lng: coords.lng + (Math.random() - 0.5) * 0.01,
          dishLiked: dishes,
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Processed ${rowCount} rows → ${restaurants.length} unique restaurants`);

  // Keep top 100 by vote proxy (they appear first in the CSV which is sorted by popularity)
  const top = restaurants.slice(0, 100);

  fs.writeFileSync(OUT_PATH, JSON.stringify(top, null, 2));
  console.log(`Written to ${OUT_PATH}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
