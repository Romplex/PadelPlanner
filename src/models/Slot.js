const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

class Slot {
  static async getAvailableSlots(userName) {
    const [rows] = await pool.execute(`
      SELECT
        s.id,
        s.provider,
        DATE_FORMAT(s.date, '%Y-%m-%d') AS date,
        TIME_FORMAT(s.start_time, '%H:%i') AS start_time_formatted,
        TIME_FORMAT(s.end_time, '%H:%i') AS end_time_formatted,
        COUNT(b.id) AS booking_count,
        MAX(CASE WHEN b.user_name = ? THEN 1 ELSE 0 END) AS user_booked,
        GROUP_CONCAT(DISTINCT b.user_name ORDER BY b.created_at SEPARATOR ', ') AS booked_users
      FROM slots s
      LEFT JOIN bookings b ON s.id = b.slot_id
      WHERE s.is_available = 1
      GROUP BY s.id
      ORDER BY s.date ASC, s.start_time ASC
    `, [userName]);

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