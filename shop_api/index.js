const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require('./database'); // เชื่อมต่อ MySQL
const multer = require("multer");
const path = require("path");

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = "12345678";
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization"
}));

// Register: เพิ่มผู้ใช้ใหม่
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    // เข้ารหัสรหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO tb_users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "User registered successfully", userID: result.insertId });
        }
    );
});

// Login: ตรวจสอบข้อมูลผู้ใช้
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM tb_users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = result[0];
        const hashedPassword = user.password;

        if (!hashedPassword || !bcrypt.compareSync(password, hashedPassword)) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.users_id, email: user.email },
            JWT_SECRET,
            { expiresIn: "2h" },
        );
        res.json({ message: "Login successful!", token, id: user.users_id,name:user.name,email:user.email,role:user.role});
    });
});

// GET: ดึงรายการสินค้าทั้งหมด
app.get("/products/all", (req, res) => {
    db.query("SELECT * FROM tb_products", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get("/products", (req, res) => {
    const { id } = req.query; // Get 'id' from query parameters (e.g., ?id=electronics)

    let query = "SELECT * FROM tb_products";
    let queryParams = [];

    if (id) {
        // If 'id' is provided, add a WHERE condition to filter products
        query += " WHERE products_id = ?";
        queryParams.push(id); // Add the category value to the query parameters
    }

    // Execute the query with or without the category filter
    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST: เพิ่มสินค้าใหม่
app.post("/products", (req, res) => {
    const { name, description, price, stock, image_url } = req.body;
    db.query(
        "INSERT INTO tb_products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)",
        [name, description, price, stock, image_url],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Product added successfully", productID: result.insertId });
        }
    );
});

// PUT: แก้ไขสินค้า
app.put("/products/:id", (req, res) => {
    const { name, description, price, stock, image_url } = req.body;
    const { id } = req.params;
    db.query(
        "UPDATE tb_products SET name = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE products_id = ?",
        [name, description, price, stock, image_url, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Product updated successfully" });
        }
    );
});

// DELETE: ลบสินค้า
app.delete("/products/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM tb_products WHERE products_id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product deleted successfully" });
    });
});


// GET: ดูตะกร้าสินค้าของผู้ใช้
app.get("/cart", (req, res) => {
    const { id } = req.query;  // Get the 'id' from the query parameters
    console.log("ID received:", id); // Debug log to check if it's triggered
    db.query("SELECT * FROM tb_cart WHERE users_id = ? AND order_id = ?", [id,0], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);  // Return the results
    });
});
// GET: ดูตะกร้าสินค้าของผู้ใช้
app.get("/cart/orderId", (req, res) => {
    const { order_id } = req.query;  // Get the 'id' from the query parameters
    console.log("ID received:", order_id); // Debug log to check if it's triggered
    db.query("SELECT * FROM tb_cart WHERE order_id = ?", [order_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);  // Return the results
    });
});
// POST: เพิ่มสินค้าในตะกร้า
app.post("/cart", (req, res) => {
    const { users_id, products_id, quantity } = req.body;
    db.query(
        "INSERT INTO tb_cart (users_id, products_id, quantity) VALUES (?, ?, ?)",
        [users_id, products_id, quantity],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Item added to cart", cartID: result.insertId });
        }
    );
});

app.delete("/cart", (req, res) => {
    const { cart_id } = req.query;  // Get 'cart_id' from query parameters (e.g., ?cart_id=1)

    if (!cart_id) {
        return res.status(400).json({ error: "Missing cart_id in query parameters" });
    }

    db.query("DELETE FROM tb_cart WHERE cart_id = ?", [cart_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item removed from cart" });
    });
});

app.put("/cart", (req, res) => {
    const { order_id , cartId , old_price } = req.query;  // Get 'cart_id' from query parameters (e.g., ?cart_id=1)

    if (!cartId) {
        return res.status(400).json({ error: "Missing cartId in query parameters" });
    }

    db.query("UPDATE tb_cart SET order_id = ? ,oldPrice = ? WHERE cart_id = ?", [order_id , old_price , cartId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item updated from cart" });
    });
});

// get: คำสั่งซื้อ
app.get("/orders", (req, res) => {
    const { user_id } = req.query;

    db.query(
        `SELECT * FROM tb_orders WHERE users_id = ?`,
        [user_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "founded successfully", orderID: result });
        }
    );
});

// get: ติดตามสิ้นค้า
app.get("/orders/tracking", (req, res) => {
    const { user_id } = req.query;
    const array = ["Pending","Processing", "Shipped", "Delivered"]; // Fixed array

    // Use SQL's IN clause to check if the status is one of the values in the array
    db.query(
        `SELECT * FROM tb_orders WHERE users_id = ? AND status IN (?)`,
        [user_id, array], // Pass the array directly for the IN clause
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        }
    );
});

// get: ประวัจิสิน้ค้า
app.get("/orders/history", (req, res) => {
    const { user_id } = req.query;
    const array = ["Finished"]; // Fixed array

    // Use SQL's IN clause to check if the status is one of the values in the array
    db.query(
        `SELECT * FROM tb_orders WHERE users_id = ? AND status IN (?)`,
        [user_id, array], // Pass the array directly for the IN clause
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        }
    );
});

// POST: สร้างคำสั่งซื้อ
app.post("/orders", (req, res) => {
    const { users_id, total_amount, status } = req.body;
    db.query(
        "INSERT INTO tb_orders (users_id, total_amount, status) VALUES (?, ?, ?)",
        [users_id, total_amount, status],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Order created successfully", orderID: result.insertId });
        }
    );
});

// PUT: แก้ไขสถานะคำสั่งซื้อ
app.put("/orders/status", (req, res) => {
    const { orders_id, status } = req.query;
    db.query(
        "UPDATE tb_orders SET status = ? WHERE orders_id = ?",
        [status, orders_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Order status updated successfully" });
        }
    );
});

// GET: ดึงข้อมูลการชำระเงินทั้งหมด
app.get("/payments", (req, res) => {
    db.query("SELECT * FROM tb_payments", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST: สร้างข้อมูลการชำระเงิน
app.post("/payments", (req, res) => {
    const { orders_id, payment_method, payment_date, status } = req.body;
    db.query(
        "INSERT INTO tb_payments (orders_id, payment_method, payment_date, status) VALUES (?, ?, ?, ?)",
        [orders_id, payment_method, payment_date, status],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Payment added successfully", paymentID: result.insertId });
        }
    );
});

// // ตั้งค่า Static Path
// app.use("/images", express.static(path.join(__dirname, "images")));

// // ตั้งค่า multer สำหรับอัปโหลดไฟล์
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "images/");
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });

// const upload = multer({ storage: storage });

// // API สำหรับอัปโหลดรูปภาพ
// app.post("/upload", upload.single("productImage"), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//     }
//     const imageUrl = `http://localhost:5000/images/${req.file.filename}`;
//     res.json({ message: "File uploaded successfully", imageUrl });
// });

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
