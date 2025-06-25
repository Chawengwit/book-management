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
router.get("/", verifyToken, async (req, res) => {
    if (!req.session?.login || !req.session?.token) {
        console.warn("Session invalid: user not logged in or missing token.");
        return res.redirect("/login");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    try {
        const totalBooks = await Books.countDocuments();
        const totalPages = Math.ceil(totalBooks / limit);

        const books = await Books.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

        res.render("home.ejs", {
            books,
            currentPage: page,
            totalPages,
            error: null,
        });

    } catch (err) {
        console.error("[Books] Error fetching books:", err);

        res.status(500).render("home.ejs", {
            books: [],
            currentPage: page,
            totalPages: 1,
            error: "There was a problem loading books. Please try again later.",
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
router.get("/view/:id", verifyToken, async (req, res) => {
    const bookId = req.params.id;

    try {
        const book = await Books.findById(bookId);
        if (!book) {
            console.warn(`[Books] Book not found with ID: ${bookId}`);
            return res.status(404).render("error.ejs", {
                message: "Book not found",
                errorCode: 404,
            });
        }

        res.render("book.ejs", { book });

    } catch (err) {
        console.error(`[Books] Failed to fetch book with ID: ${bookId}`, err);

        res.status(500).render("error.ejs", {
            message: "Something went wrong while retrieving the book.",
            errorCode: 500,
        });
    }
});

// create book page
router.get('/create', verifyToken, async (req, res) => {
    res.render("createForm.ejs")
});

// update book page
router.get("/update/:id", verifyToken, async (req, res) => {
    const bookId = req.params.id;

    try {
        const book = await Books.findById(bookId);

        if (!book) {
            console.warn(`[Books] Book not found with ID: ${bookId}`);
            return res.status(404).render("error.ejs", {
                message: "Book not found.",
                errorCode: 404,
            });
        }

        res.render("editForm.ejs", { book });
    } catch (err) {
        console.error(`[Books] Error fetching book for edit (ID: ${bookId}):`, err);

        res.status(500).render("error.ejs", {
            message: "An error occurred while loading the book.",
            errorCode: 500,
        });
    }
});


//================== BACK END ====================

// api register
router.post("/api/register", async (req, res) => {
    const origin = req.get("Origin");

    if (origin !== "http://localhost:3000") {
        console.warn(`[Register] Unauthorized origin: ${origin}`);
        return res.status(403).send("Not allowed");
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const userData = {
            ...req.body,
            password: hashedPassword,
        };

        const results = await Users.createUser(userData);

        res.redirect("/");
    } catch (err) {
        console.error("[Register] Failed to create user:", err);

        // Handle failure gracefully
        res.status(500).redirect("/register");
    }
});


// api log in
router.post("/api/login", async (req, res) => {
    const origin = req.get("Origin");

    if (origin !== "http://localhost:3000") {
        console.warn(`[Login] Unauthorized origin attempt: ${origin}`);
        return res.status(403).send("Not allowed");
    }

    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email });

        if (!user) {
            console.warn(`[Login] User not found for email: ${email}`);
            return res.render("login.ejs", { failedLogin: true });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.warn(`[Login] Password mismatch for email: ${email}`);
            return res.render("login.ejs", { failedLogin: true });
        }

        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        req.session.login = true;
        req.session.token = token;

        res.redirect("/");

    } catch (err) {
        console.error(`[Login] Unexpected error during login for ${email}:`, err);
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
router.get("/api/delete-book/:id", verifyToken, async (req, res) => {
    const bookId = req.params.id;

    try {
        await Books.findByIdAndDelete(bookId);
        res.redirect("/");
    } catch (err) {
        console.error(`[Books] Failed to delete book with ID: ${bookId}`, err);
        res.status(500).redirect("/");
    }
});

// api create book
router.post("/api/create", verifyToken, upload.single("image"), async (req, res) => {
    if (!req.file) {
        console.warn("[CreateBook] No image file uploaded.");
        return res.status(400).send("No file uploaded.");
    }

    try {
        req.body.image = req.file.filename;

        await Books.createBook(req.body);

        res.redirect("/");
    } catch (err) {
        console.error("[CreateBook] Failed to create book:", err);
        res.status(500).send("Failed to create book.");
    }
});


// api update book
router.post("/api/update/:id", verifyToken, async (req, res) => {
    const bookId = req.params.id;

    try {
        const updatedBook = await Books.findByIdAndUpdate(
        bookId,
        {
            title: req.body.title,
            author: req.body.author,
            published_year: req.body.published_year,
            genre: req.body.genre,
        },
        { new: true, runValidators: true }
        );

        if (!updatedBook) {
            console.warn(`[UpdateBook] Book not found with ID: ${bookId}`);
            return res.status(404).send("Book not found.");
        }

        res.redirect("/");
    } catch (err) {
        console.error(`[UpdateBook] Failed to update book (ID: ${bookId}):`, err);
        res.status(500).send("Failed to update book.");
    }
});








module.exports = router

