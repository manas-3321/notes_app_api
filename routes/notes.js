const express = require('express');
const crypto = require('crypto');
const { readNotes, writeNotes } = require('../utils/fileHandler');

const router = express.Router();

// 1. POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validate required title field
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const notes = await readNotes();
    const now = new Date().toISOString();

    const newNote = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content ? content.trim() : '',
      createdAt: now,
      updatedAt: now
    };

    notes.push(newNote);
    await writeNotes(notes);

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Server error while creating note.' });
  }
});

// 2. GET /api/notes - List notes (newest first, search, pagination)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let notes = await readNotes();

    // Filter by search keyword across title and content
    if (search) {
      const searchLower = search.toLowerCase();
      notes = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort newest first by createdAt descending
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination logic
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedNotes = notes.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      total: notes.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(notes.length / limitNum) || 1,
      notes: paginatedNotes
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching notes.' });
  }
});

// 3. GET /api/notes/:id - Get a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await readNotes();
    const note = notes.find((n) => n.id === id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching the note.' });
  }
});

// 4. PUT /api/notes/:id - Update a note by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const notes = await readNotes();

    const note = notes.find((n) => n.id === id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    // Validate title if provided in payload
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty.' });
      }
      note.title = title.trim();
    }

    if (content !== undefined) {
      note.content = content.trim();
    }

    note.updatedAt = new Date().toISOString();
    await writeNotes(notes);

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error while updating the note.' });
  }
});

// 5. DELETE /api/notes/:id - Delete a note by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await readNotes();
    const index = notes.findIndex((n) => n.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    const deletedNote = notes.splice(index, 1)[0];
    await writeNotes(notes);

    res.status(200).json({ message: 'Note deleted successfully.', note: deletedNote });
  } catch (error) {
    res.status(500).json({ error: 'Server error while deleting the note.' });
  }
});

module.exports = router;
