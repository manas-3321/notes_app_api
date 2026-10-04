const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, '../notes.json');

// Helper function to asynchronously read notes from notes.json (creates file if missing)
async function readNotes() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If notes.json does not exist yet, create it with an empty array
    if (error.code === 'ENOENT') {
      await writeNotes([]);
      return [];
    }
    throw error;
  }
}

// Helper function to asynchronously write notes array to notes.json
async function writeNotes(notes) {
  await fs.writeFile(filePath, JSON.stringify(notes, null, 2), 'utf-8');
}

module.exports = { readNotes, writeNotes };
