import mongoose from 'mongoose';

const TodoItemSchema = new mongoose.Schema({
  id: String,
  content: String,
  completed: Boolean,
  isEditing: Boolean,
});

const NoteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['note', 'todo', 'image'],
    required: true,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  todos: [TodoItemSchema],
  imageUrl: String,
  imageWidth: Number,
  imageHeight: Number,
  noteWidth: Number,
  noteHeight: Number,
  completed: Boolean,
  isEditing: Boolean,
  color: String,
  rotation: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  strict: false,
  timestamps: true,
});

// Update the updatedAt field before saving
NoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Drop the model if it exists to force schema update
if (mongoose.models.Note) {
  delete mongoose.models.Note;
}

const Note = mongoose.model('Note', NoteSchema);

export default Note; 