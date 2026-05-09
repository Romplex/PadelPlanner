const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

class Slot {
  static async getAvailableSlots() {
    const [rows] = await pool.execute(`
      SELECT s.*, COUNT(b.id) as booking_count
      FROM slots s
      LEFT JOIN bookings b ON s.id = b.slot_id
      WHERE s.is_available = 1
      GROUP BY s.id
    `);
    return rows;
  }

  static async bookSlot(slotId, userName) {
    try {
      await pool.execute('INSERT INTO bookings (slot_id, user_name) VALUES (?, ?)', [slotId, userName]);
      return true;
    } catch (err) {
      return false; // Z.B. wenn schon gebucht
    }
  }
}

module.exports = Slot;