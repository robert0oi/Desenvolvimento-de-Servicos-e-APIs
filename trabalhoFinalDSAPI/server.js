require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const { nanoid } = require('nanoid');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
app.use(express.json());

// Conexão com MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Autenticação Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (_, __, profile, done) => {
  const email = profile.emails[0].value;
  const nome = profile.displayName;

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

  if (rows.length > 0) return done(null, rows[0]);

  const novoUsuario = {
    id: nanoid(),
    nome,
    email,
    cargo: 'estagiario'
  };

  await pool.query('INSERT INTO users SET ?', novoUsuario);
  done(null, novoUsuario);
}));

//se der cagada, vem pra ca
const autenticar = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  next();
};

//OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = nanoid();
    res.json({ token, user: req.user });
  }
);

// POST check-in
app.post('/checkin', autenticar, async (req, res) => {
  const { user_id } = req.body;
  const hoje = new Date().toISOString().split('T')[0];
  const hora = new Date().toTimeString().split(' ')[0];

  const [rows] = await pool.query(
    'SELECT * FROM registros WHERE user_id = ? AND data_ponto = ?', [user_id, hoje]
  );

  if (rows.length > 0) return res.status(400).json({ error: 'Já registrado hoje' });

  const registro = { id: nanoid(), user_id, data_ponto: hoje, checkin: hora };
  await pool.query('INSERT INTO registros SET ?', registro);
  res.status(201).json(registro);
});

// POST checkout
app.post('/checkout', autenticar, async (req, res) => {
  const { user_id } = req.body;
  const hoje = new Date().toISOString().split('T')[0];
  const hora = new Date().toTimeString().split(' ')[0];

  const [rows] = await pool.query(
    'SELECT * FROM registros WHERE user_id = ? AND data_ponto = ?', [user_id, hoje]
  );

  if (rows.length === 0) return res.status(400).json({ error: 'Faça o check-in primeiro' });

  await pool.query('UPDATE registros SET checkout = ? WHERE id = ?', [hora, rows[0].id]);
  res.json({ message: 'Check-out registrado' });
});

// GET /registros
app.get('/registros', autenticar, async (req, res) => {
  const user_id = req.query.user_id;
  const [registros] = await pool.query('SELECT * FROM registros WHERE user_id = ?', [user_id]);
  res.json(registros);
});

// GET /registros/76234jbn878byo // Exemplo de ID
app.get('/registros/:id', autenticar, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM registros WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
  res.json(rows[0]);
});

// PUT /registros/76234jbn878byo // Exemplo de ID
app.put('/registros/:id', autenticar, async (req, res) => {
  const { checkin, checkout } = req.body;
  await pool.query('UPDATE registros SET checkin = ?, checkout = ? WHERE id = ?', [checkin, checkout, req.params.id]);
  res.json({ message: 'Registro atualizado' });
});

// DELETE /registros/76234jbn878byo // Exemplo de ID
app.delete('/registros/:id', autenticar, async (req, res) => {
  await pool.query('DELETE FROM registros WHERE id = ?', [req.params.id]);
  res.json({ message: 'Registro excluído' });
});

// POST atestado em texto
app.post('/atestados', autenticar, async (req, res) => {
  const { user_id, motivo } = req.body;
  const atestado = { id: nanoid(), user_id, data_envio: new Date().toISOString().split('T')[0], motivo };
  await pool.query('INSERT INTO atestados SET ?', atestado);
  res.status(201).json(atestado);
});

// Status
app.get('/status', (req, res) => {
  res.json({ status: 'ok', api: 'WebPonto' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API online: http://localhost:${PORT}`);
});
