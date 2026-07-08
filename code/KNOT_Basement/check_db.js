const mysql = require('mysql2/promise');
async function check() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', database: 'knot_db' });
  const [rows] = await pool.query('DESCRIBE bookings');
  console.log(rows);
  process.exit(0);
}
check();
