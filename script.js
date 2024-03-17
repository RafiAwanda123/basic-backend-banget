const express = require('express');
const app = express();
app.use(express.json());

let notes = [];

app.post('/notes', (req, res) => {
  const note = req.body;
  const id = Date.now().toString(); // Menghasilkan ID unik berdasarkan timestamp
  note.id = id;
  notes.push(note);
  res.status(201).json(note);
});

app.get('/notes', (req, res) => {
  res.status(200).json(notes);
});

app.get('/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (note) {
    res.status(200).json(note);
  } else {
    res.status(404).json({ message: 'Catatan tidak ditemukan' });
  }
});

app.put('/notes/:id', (req, res) => {
  const index = notes.findIndex(n => n.id === req.params.id);
  if (index !== -1) {
    const updatedNote = req.body;
    updatedNote.id = notes[index].id; // Pastikan ID tetap sama
    notes[index] = updatedNote;
    res.status(200).json(notes[index]);
  } else {
    res.status(404).json({ message: 'Gagal memperbarui catatan. Id tidak ditemukan' });
  }
});

app.delete('/notes/:id', (req, res) => {
  const index = notes.findIndex(n => n.id === req.params.id);
  if (index !== -1) {
    const deletedNote = notes.splice(index, 1);
    res.status(200).json(deletedNote);
  } else {
    res.status(404).json({ message: 'Catatan gagal dihapus. Id tidak ditemukan' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
