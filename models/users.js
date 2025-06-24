const mongoose = require("mongoose");

// Connect MongoDB
const dbUrl = "mongodb://localhost:27017/booksDB";
mongoose.connect(dbUrl)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        maxlength: 255
    },
}, {
    timestamps: true // createdAt, updatedAt
});

// Create the model
const Users = mongoose.model('Users', userSchema);

// Export Models
module.exports = Users;

// Export function to create a book
module.exports.createUser = async function(data) {
    const user = new Users(data);
    return await user.save();
};