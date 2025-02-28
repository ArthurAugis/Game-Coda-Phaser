require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
// const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY; 

app.use(express.json());
// app.use(cors({ origin: 'http://localhost:8080' })); 

const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

app.get('/topscores', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM score ORDER BY score DESC LIMIT 10');
    res.json(rows);
});

app.post('/scores', async (req, res) => {
    const { name, points, secret } = req.body;

    if (secret !== SECRET_KEY) {
        return res.status(403).json({ error: 'Accès interdit' });
    }

    await db.query('INSERT INTO score (nom, score) VALUES (?, ?)', [name, points]);
    res.json({ success: true });
});

app.get('/', async (req, res) => {
    res.redirect('https://arthuraugis.itch.io/coda-space-invader');
});

function add_random_score(nombreInput) {
    let nombre = nombreInput;
    let nom = "Joueur";
    let points = Math.floor(Math.random() * 1000);
    db.query('INSERT INTO score (nom, score) VALUES (?, ?)', [nom, points]);
    nombre--;
    if (nombre > 0) {
        add_random_score(nombre);
    }
}

// add_random_score(10);

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
