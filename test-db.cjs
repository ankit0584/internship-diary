const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'MyNewPassword123!',
      database: 'internship_diary'
    });
    const [rows, fields] = await connection.execute('SHOW TABLES;');
    console.log("Tables:", rows);
    
    const [users] = await connection.execute('SELECT * FROM users;');
    console.log("Users:", users);
    
    await connection.end();
  } catch (err) {
    console.error(err);
  }
}
test();
