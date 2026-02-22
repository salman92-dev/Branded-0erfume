import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("perfume.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    notes TEXT, -- JSON array of notes
    category TEXT, -- Floral, Woody, etc.
    image_url TEXT,
    stock INTEGER DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    total REAL,
    items TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insert = db.prepare("INSERT INTO products (name, brand, price, description, notes, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insert.run("Oud Noir", "Essence de Luxe", 185.00, "A deep, mysterious blend of agarwood and spices.", JSON.stringify(["Oud", "Saffron", "Patchouli"]), "Woody", "https://picsum.photos/seed/oud/600/800");
  insert.run("Rose Velour", "Essence de Luxe", 145.00, "Velvety damask rose with a hint of pink pepper.", JSON.stringify(["Rose", "Pink Pepper", "White Musk"]), "Floral", "https://picsum.photos/seed/rose/600/800");
  insert.run("Citrus Éclat", "Essence de Luxe", 120.00, "Sparkling bergamot and lemon zest for a bright day.", JSON.stringify(["Bergamot", "Lemon", "Neroli"]), "Citrus", "https://picsum.photos/seed/citrus/600/800");
  insert.run("Ambre Nuit", "Essence de Luxe", 210.00, "Warm amber and vanilla, perfect for evening elegance.", JSON.stringify(["Amber", "Vanilla", "Benzoin"]), "Oriental", "https://picsum.photos/seed/amber/600/800");
  insert.run("Vert de Gris", "Essence de Luxe", 135.00, "Fresh cut grass and crushed leaves.", JSON.stringify(["Galbanum", "Vetiver", "Green Tea"]), "Green", "https://picsum.photos/seed/green/600/800");
  insert.run("Santal Royal", "Essence de Luxe", 195.00, "Creamy sandalwood with a touch of cardamom.", JSON.stringify(["Sandalwood", "Cardamom", "Cedar"]), "Woody", "https://picsum.photos/seed/santal/600/800");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products.map((p: any) => ({ ...p, notes: JSON.parse(p.notes) })));
  });

  app.get("/api/products/:id", (req, res) => {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
    if (product) {
      res.json({ ...product, notes: JSON.parse(product.notes) });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.post("/api/orders", (req, res) => {
    const { customer_name, total, items } = req.body;
    const info = db.prepare("INSERT INTO orders (customer_name, total, items) VALUES (?, ?, ?)").run(customer_name, total, JSON.stringify(items));
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
