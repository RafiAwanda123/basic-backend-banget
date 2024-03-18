const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

let users = [];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'SECRET_KEY', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/register', (req, res) => {
  const user = req.body;
  users.push(user);
  res.status(201).json(user);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const accessToken = jwt.sign(user, 'SECRET_KEY');
    res.json({ accessToken });
  } else {
    res.status(401).json({ message: 'Username atau password salah' });
  }
});

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Halaman ini dilindungi dan hanya bisa diakses oleh pengguna yang sudah login', user: req.user });
});

app.listen(3000, () => console.log('Server running on port 3000'));
