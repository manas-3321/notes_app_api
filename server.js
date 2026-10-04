const express = require('express');
const notesRouter = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Serve static frontend files from public folder
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Register API routes
app.use('/api/notes', notesRouter);

// Fallback middleware for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start listening for HTTP requests
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (JSON File Storage)`);
});
