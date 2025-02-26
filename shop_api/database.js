// database.js
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",      // แก้ไขเป็น host ของคุณ
    user: "root",           // แก้ไขเป็น username ของคุณ
    password: "",   // แก้ไขเป็น password ของคุณ
    database: "db_computer_shop" // แก้ไขเป็นชื่อฐานข้อมูล
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Connected to the database.");
    }
});

module.exports = db;
