const express = require("express");
const path = require("path");
const router = express.Router();
const Books = require("../models/books.js");
const Users = require("../models/users.js");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const verifyToken = require("../service/common.js"); 

// Create storage config
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, '../public/images/book-storage'));
    },
    filename: function (req, file, callback) {
        callback(null, `${Date.now()}-${file.originalname}`);
    }
});

// start upload
const upload = multer({ storage: storage });

// secrete key
const secret_key = "helloworld";

//================== FRONT END ====================

// home
router.get('/', verifyToken, async (req, res) => {

    if(!req.session.login || !req.session.token){
        res.redirect('/login');

    }else{
        try {
            const books = await Books.find().exec();

            console.log("================");
            console.log(books);
            console.log("================");

            res.render("home.ejs", { books });

        } catch (err) {
            console.error("Error fetching books:", err);
            res.status(500).send("Error loading books.");
        }
    }

});

// register page
router.get('/register', (req, res) => {
    res.render('register.ejs');
});

// Detail page
router.get('/book/:id', verifyToken, async (req, res) => {
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

router.get('/create', verifyToken, async (req, res) => {
    res.render("createForm.ejs")
});

//================== BACK END ====================

// api log in
router.get("/login", (req, res) => {
    res.render("login.ejs", {failedLogin: false});
});

router.post("/user/login", async (req, res) => {
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
            { email: user.email, id: user._id }, secret_key, { expiresIn: "24h" }
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
router.get('/user/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// api register
router.post('/user/register', async (req, res) => {
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

// api delete book
router.get('/delete-book/:id', verifyToken, async (req, res) => {
    try {
        await Books.findByIdAndDelete(req.params.id);
        res.redirect("/");

    } catch {
        console.log("Can not delete book: ", err);
        res.redirect("/");
    }
    
});

// api create book
router.post('/get-detail', verifyToken, upload.single("image"), async (req, res) => {
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
router.post('/update-detail/:id', verifyToken, async (req, res) => {
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

