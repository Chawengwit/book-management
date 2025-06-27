// Use Mongoose
const mongoose = require('mongoose');

// Connect MongoDB
const dbUrl = process.env.MONGODB_URI;

if (!dbUrl) {
    throw new Error('❌ MONGODB_URI is not defined');
}

mongoose.connect(dbUrl)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Design the schema for books
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 255
    },
    author: {
        type: String,
        required: true,
        maxlength: 255
    },
    published_year: {
        type: Number
    },
    genre: {
        type: String,
        maxlength: 100
    },

    image: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true // createdAt, updatedAt
});

// Create the model
const Books = mongoose.model('Books', bookSchema);

// Export Models
module.exports = Books;

// Export function to create a book
module.exports.createBook = async function(data) {
    const book = new Books(data);
    return await book.save();
};