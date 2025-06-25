const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const Books = require("../models/books.js");
const Users = require("../models/users.js");
const verifyToken = require("../service/verify_token.js");
const upload = require("../service/upload_file.js");

const router = express.Router();

//================== FRONT END ====================

// home page
router.get('/', verifyToken, async (req, res) => {

    if (!req.session.login || !req.session.token) {
        return res.redirect('/login');
    }

    // Parse page and limit from query, default to page 1, 4 items per page
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    try {
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalBooks = await Books.countDocuments();
        const totalPages = Math.ceil(totalBooks / limit);

        const books = await Books.find()
            .skip(skip)
            .limit(limit)
            .exec();

        res.render("home.ejs", {
            books,
            currentPage: page,
            totalPages,
            error: null // no error
        });

    } catch (err) {
        console.error("Error fetching books:", err);

        res.render("home.ejs", {
            books: [],
            currentPage: page,
            totalPages: 1,
            error: "There was a problem loading books. Please try again."
        });
    }

});

// register page
router.get('/register', (req, res) => {
    res.render('register.ejs');
});

// login page
router.get("/login", (req, res) => {
    res.render("login.ejs", {failedLogin: false});
});

// view book page
router.get('/view/:id', verifyToken, async (req, res) => {
    try {
        const book = await Books.findById(req.params.id);
        if (!book) {
            return res.status(404).send("Book not found.");
        }

        res.render("book.ejs", { book });
    } catch (err) {
        console.error("Error fetching book:", err);
        res.status(500).send("Error getting book.");
    }
});

// create book page
router.get('/create', verifyToken, async (req, res) => {
    res.render("createForm.ejs")
});

// update book page
router.get('/update/:id', verifyToken, async (req, res) => {
    try {
        let book = await Books.findById(req.params.id);
        if (!book) {
            return res.status(404).send("Book not found.");
        }

        res.render("editForm.ejs", { book});
    } catch (err) {
        console.error("Error fetching book:", err);
        res.status(500).send("Error getting book.");
    }
    
});

//================== BACK END ====================

// api register
router.post('/api/register', async (req, res) => {
    const origin = req.get('Origin');
    if (origin !== 'http://localhost:3000') {
        return res.status(403).send('Not allowed');
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Prepare user data
        const userData = {
            ...req.body,
            password: hashedPassword
        };

        // Save user
        const results = await Users.createUser(userData);

        res.redirect("/");
    } catch (err) {
        console.error("Error creating user:", err);
        res.redirect("/register");
        res.status(500).send("Failed to create user.");
    }
});

// api log in
router.post("/api/login", async (req, res) => {
    const origin = req.get('Origin');
    if (origin !== 'http://localhost:3000') {
        return res.status(403).send('Not allowed');
    }

    const { email, password } = req.body;

    try {
        // 1. Find user by email
        const user = await Users.findOne({ email });
        if (!user) {
            return res.render("login.ejs", { failedLogin: true });
        }

        // 2. Check password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render("login.ejs", { failedLogin: true });
        }

        // 3. Create and send JWT
        const token = jwt.sign(
            { email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" }
        );

        // 4. Save token
        req.session.login = true;
        req.session.token = token;
        res.redirect("/");

    } catch (err) {
        console.error("Login error:", err);
        res.render("login.ejs", { failedLogin: true });
    }
});

// log out
router.get('/api/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// api delete book
router.get('/api/delete-book/:id', verifyToken, async (req, res) => {
    try {
        await Books.findByIdAndDelete(req.params.id);
        res.redirect("/");

    } catch (err) {
        console.log("Can not delete book: ", err);
        res.redirect("/");
    }
    
});

// api create book
router.post('/api/create', verifyToken, upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // uploaded image filename to req.body
        req.body.image = req.file.filename;

        // insert book
        await Books.createBook(req.body);  // no need to create new instance
        res.redirect("/");
    } catch (err) {
        console.error("Error creating book:", err);
        res.status(500).send("Failed to create book.");
    }
});

// api update book
router.post('/api/update/:id', verifyToken, async (req, res) => {
    try {
        const book = await Books.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                author: req.body.author,
                published_year: req.body.published_year,
                genre: req.body.genre,
            },
            { new: true, runValidators: true }
        );

        if (!book) {
            return res.status(404).send("Book not found.");
        }

        res.redirect("/");
    } catch (err) {
        console.error("Error updated book:", err);
        res.status(500).send("Failed to updated book.");
    }
});







module.exports = router

