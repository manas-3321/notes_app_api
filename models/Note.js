const mongoose = require('mongoose');

// Define the Schema for a Note
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      trim: true
    },
    content: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    // Automatically adds createdAt and updatedAt timestamp fields
    timestamps: true
  }
);

// Create and export the Note model
module.exports = mongoose.model('Note', noteSchema);
