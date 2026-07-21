const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'new_password'
};

async function resetDatabase() {
  let connection;
  try {
    console.log("Connecting to MySQL...");
    connection = await mysql.createConnection(dbConfig);
    
    console.log("Dropping database knot_db...");
    await connection.query(`DROP DATABASE IF EXISTS knot_db;`);
    
    console.log("Database knot_db dropped successfully!");
  } catch (error) {
    console.error("Database drop failed: ", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();
