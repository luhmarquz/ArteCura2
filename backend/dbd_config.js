const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'luisam10',
    database: 'artecura',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log('Mysql conectado');
    }
});

module.exports = connection;