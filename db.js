const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'estante_viva',
});

db.connect((err) => {
    if (err) {
        console.log('Deu ruim aqui', err);
        return;
    }    

    console.log('Deu certo boy!');
})

module.exports = db;