const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const app = express();

app.use(express.json());

let users = [];
let notes = [];
let images = [];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const upload = multer({ storage: storage });

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

app.post('/upload', authenticateToken, upload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Harap unggah gambar');
    error.httpStatusCode = 400;
    return next(error);
  }
  images.push(file);
  res.send(file);
});

app.delete('/delete/:imageName', authenticateToken, (req, res) => {
  const imageName = req.params.imageName;
  fs.unlink(`./uploads/${imageName}`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    }
    images = images.filter(image => image.filename !== imageName);
    res.status(200).json({ message: 'Gambar berhasil dihapus' });
  });
});

app.post('/notes', authenticateToken, (req, res) => {
  const note = req.body;
  notes.push(note);
  res.status(201).json(note);
});

app.get('/notes', authenticateToken, (req, res) => {
  res.status(200).json(notes);
});

app.get('/notes/:id', authenticateToken, (req, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (note) {
    res.status(200).json(note);
  } else {
    res.status(404).json({ message: 'Catatan tidak ditemukan' });
  }
});

app.put('/notes/:id', authenticateToken, (req, res) => {
  const index = notes.findIndex(n => n.id === req.params.id);
  if (index !== -1) {
    notes[index] = req.body;
    res.status(200).json(notes[index]);
  } else {
    res.status(404).json({ message: 'Gagal memperbarui catatan. Id tidak ditemukan' });
  }
});

app.delete('/notes/:id', authenticateToken, (req, res) => {
  const index = notes.findIndex(n => n.id === req.params.id);
  if (index !== -1) {
    const deletedNote = notes.splice(index, 1);
    res.status(200).json(deletedNote);
  } else {
    res.status(404).json({ message: 'Catatan gagal dihapus. Id tidak ditemukan' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
