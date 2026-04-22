require('dotenv').config()
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { sequelize, Product } = require('../models/index')

const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// Download with redirect following
const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const dest = path.join(uploadDir, filename)
    const proto = url.startsWith('https') ? https : http

    const request = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        return downloadImage(res.headers.location, filename).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`))
      }

      const file = fs.createWriteStream(dest)
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        // Verify file is a real image (> 5KB)
        const size = fs.statSync(dest).size
        if (size < 5000) {
          fs.unlinkSync(dest)
          return reject(new Error(`File too small (${size} bytes) — likely an error page`))
        }
        resolve(filename)
      })
      file.on('error', (err) => { fs.unlink(dest, () => {}); reject(err) })
    })
    request.on('error', reject)
    request.setTimeout(15000, () => { request.destroy(); reject(new Error('Timeout')) })
  })
}

// Using Foodish API (free, no key, returns real food images)
// Format: https://foodish-api.com/images/{category}/{file}
// Fallback: picsum.photos with food-specific seeds

const MENU_ITEMS = [
  // ── Fast Food ──────────────────────────────────────────────────────
  { name: 'Classic Beef Burger',  category: 'fast food', price: 250, prepTime: 12, description: 'Juicy beef patty with lettuce, tomato and special sauce',   url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', filename: 'seed-beef-burger.jpg' },
  { name: 'Chicken Burger',       category: 'fast food', price: 220, prepTime: 10, description: 'Crispy fried chicken with coleslaw and mayo',                url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80', filename: 'seed-chicken-burger.jpg' },
  { name: 'Double Smash Burger',  category: 'fast food', price: 320, prepTime: 15, description: 'Two smashed patties with cheese and caramelized onions',     url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', filename: 'seed-smash-burger.jpg' },
  { name: 'Veggie Burger',        category: 'fast food', price: 180, prepTime: 10, description: 'Plant-based patty with fresh veggies',                       url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80', filename: 'seed-veggie-burger.jpg' },
  { name: 'Crispy Chicken Wings', category: 'fast food', price: 280, prepTime: 18, description: '6 pcs crispy wings with dipping sauce',                     url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', filename: 'seed-chicken-wings.jpg' },
  { name: 'French Fries',         category: 'fast food', price: 120, prepTime: 8,  description: 'Golden crispy fries with ketchup',                          url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', filename: 'seed-french-fries.jpg' },
  { name: 'Loaded Nachos',        category: 'fast food', price: 200, prepTime: 10, description: 'Tortilla chips with cheese, jalapeños and salsa',            url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80', filename: 'seed-nachos.jpg' },
  { name: 'Hot Dog',              category: 'fast food', price: 150, prepTime: 8,  description: 'Classic hot dog with mustard and ketchup',                   url: 'https://images.unsplash.com/photo-1612392062631-94b7f959c2e4?w=400&q=80', filename: 'seed-hot-dog.jpg' },

  // ── Main Dish ──────────────────────────────────────────────────────
  { name: 'Chicken Pizza',        category: 'main dish', price: 450, prepTime: 20, description: 'Wood-fired pizza with grilled chicken and mozzarella',       url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', filename: 'seed-chicken-pizza.jpg' },
  { name: 'Margherita Pizza',     category: 'main dish', price: 380, prepTime: 18, description: 'Classic tomato sauce, fresh mozzarella and basil',           url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', filename: 'seed-margherita.jpg' },
  { name: 'Grilled Salmon',       category: 'main dish', price: 650, prepTime: 25, description: 'Atlantic salmon with lemon butter and steamed veggies',      url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', filename: 'seed-salmon.jpg' },
  { name: 'Butter Chicken',       category: 'main dish', price: 380, prepTime: 20, description: 'Tender chicken in rich tomato-butter gravy with naan',       url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', filename: 'seed-butter-chicken.jpg' },
  { name: 'Beef Steak',           category: 'main dish', price: 750, prepTime: 25, description: 'Grilled ribeye steak with mashed potato and mushroom sauce', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80', filename: 'seed-beef-steak.jpg' },
  { name: 'Pasta Carbonara',      category: 'main dish', price: 320, prepTime: 15, description: 'Creamy pasta with bacon, egg and parmesan',                  url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80', filename: 'seed-carbonara.jpg' },
  { name: 'Chicken Fried Rice',   category: 'main dish', price: 280, prepTime: 15, description: 'Wok-tossed rice with chicken, egg and vegetables',           url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', filename: 'seed-fried-rice.jpg' },
  { name: 'Lamb Chops',           category: 'main dish', price: 820, prepTime: 30, description: 'Herb-marinated lamb chops with roasted potatoes',            url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', filename: 'seed-lamb-chops.jpg' },

  // ── Drinks ────────────────────────────────────────────────────────
  { name: 'Mango Lassi',          category: 'drinks',    price: 120, prepTime: 5,  description: 'Chilled mango yogurt drink',                                url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80', filename: 'seed-mango-lassi.jpg' },
  { name: 'Iced Latte',           category: 'drinks',    price: 150, prepTime: 5,  description: 'Cold espresso with milk over ice',                          url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', filename: 'seed-iced-latte.jpg' },
  { name: 'Fresh Lemonade',       category: 'drinks',    price: 100, prepTime: 5,  description: 'Freshly squeezed lemon with mint and soda',                 url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80', filename: 'seed-lemonade.jpg' },
  { name: 'Strawberry Smoothie',  category: 'drinks',    price: 160, prepTime: 5,  description: 'Blended strawberries with yogurt and honey',                url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80', filename: 'seed-strawberry-smoothie.jpg' },
  { name: 'Matcha Latte',         category: 'drinks',    price: 180, prepTime: 5,  description: 'Japanese matcha with steamed oat milk',                     url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80', filename: 'seed-matcha-latte.jpg' },
  { name: 'Cold Brew Coffee',     category: 'drinks',    price: 160, prepTime: 3,  description: '12-hour cold brewed coffee, smooth and bold',               url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80', filename: 'seed-cold-brew.jpg' },
  { name: 'Watermelon Juice',     category: 'drinks',    price: 110, prepTime: 5,  description: 'Fresh watermelon blended with a hint of lime',              url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80', filename: 'seed-watermelon-juice.jpg' },
  { name: 'Chocolate Milkshake',  category: 'drinks',    price: 180, prepTime: 7,  description: 'Thick chocolate shake with whipped cream',                  url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', filename: 'seed-choco-milkshake.jpg' },

  // ── Desserts ──────────────────────────────────────────────────────
  { name: 'Chocolate Lava Cake',  category: 'desserts',  price: 220, prepTime: 15, description: 'Warm chocolate cake with molten center and vanilla ice cream', url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', filename: 'seed-lava-cake.jpg' },
  { name: 'Cheesecake',           category: 'desserts',  price: 200, prepTime: 5,  description: 'New York style cheesecake with berry compote',               url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80', filename: 'seed-cheesecake.jpg' },
  { name: 'Tiramisu',             category: 'desserts',  price: 230, prepTime: 5,  description: 'Classic Italian dessert with espresso and mascarpone',       url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', filename: 'seed-tiramisu.jpg' },
  { name: 'Mango Sorbet',         category: 'desserts',  price: 150, prepTime: 5,  description: 'Refreshing mango sorbet, dairy-free',                        url: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&q=80', filename: 'seed-mango-sorbet.jpg' },
  { name: 'Waffles & Ice Cream',  category: 'desserts',  price: 250, prepTime: 12, description: 'Crispy Belgian waffles with vanilla ice cream and syrup',    url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&q=80', filename: 'seed-waffles.jpg' },
  { name: 'Creme Brulee',         category: 'desserts',  price: 210, prepTime: 5,  description: 'Classic French custard with caramelized sugar top',          url: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=80', filename: 'seed-creme-brulee.jpg' },
  { name: 'Gulab Jamun',          category: 'desserts',  price: 120, prepTime: 5,  description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',    url: 'https://images.unsplash.com/photo-1601303516534-bf4b7d12e2b4?w=400&q=80', filename: 'seed-gulab-jamun.jpg' },
  { name: 'Oreo Brownie',         category: 'desserts',  price: 180, prepTime: 10, description: 'Fudgy brownie loaded with Oreo cookies',                    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80', filename: 'seed-oreo-brownie.jpg' },
]

async function seed() {
  await sequelize.sync({ force: false })
  console.log('Connected\n')

  let added = 0, skipped = 0, failed = 0

  for (const item of MENU_ITEMS) {
    try {
      const exists = await Product.findOne({ where: { name: item.name } })
      if (exists) {
        // Update image if it exists but is broken
        const imgPath = path.join(uploadDir, exists.image)
        const broken = !fs.existsSync(imgPath) || fs.statSync(imgPath).size < 5000
        if (!broken) { process.stdout.write(`⏭  ${item.name}\n`); skipped++; continue }
        // Re-download and update
        await downloadImage(item.url, item.filename)
        await exists.update({ image: item.filename })
        console.log(`🔄 Fixed image: ${item.name}`)
        added++
        continue
      }

      process.stdout.write(`⬇  ${item.name} ... `)
      await downloadImage(item.url, item.filename)
      console.log('✓')

      await Product.create({
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.filename,
        description: item.description,
        prepTime: item.prepTime,
      })
      console.log(`   ✅ Saved`)
      added++
      await new Promise((r) => setTimeout(r, 200))
    } catch (err) {
      console.log(`\n   ❌ ${item.name}: ${err.message}`)
      failed++
    }
  }

  console.log(`\n──────────────────────────`)
  console.log(`✅ Added/Fixed: ${added}`)
  console.log(`⏭  Skipped:    ${skipped}`)
  console.log(`❌ Failed:     ${failed}`)
  process.exit(0)
}

seed().catch((e) => { console.error(e); process.exit(1) })
