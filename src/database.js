const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'SoJo09123004!',
    database: 'padel_scraper',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function saveToDatabase(results) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (const result of results) {
            const { provider, date, slots } = result;

            await connection.execute(
                'UPDATE slots SET is_available = 0 WHERE provider = ? AND date = ?',
                [provider, date]
            );

            for (const slot of slots) {
                const { start_time, end_time } = slot;
                await connection.execute(
                    'INSERT INTO slots (provider, date, start_time, end_time, is_available) VALUES (?, ?, ?, ?, 1) ' +
                    'ON DUPLICATE KEY UPDATE is_available = VALUES(is_available), provider = VALUES(provider), updated_at = CURRENT_TIMESTAMP',
                    [provider, date, start_time, end_time]
                );
            }
        }

        await connection.commit();
        console.log('Data saved to database successfully');
    } catch (error) {
        await connection.rollback();
        console.error('Error saving to database:', error);
    } finally {
        connection.release();
    }
}

module.exports = saveToDatabase;