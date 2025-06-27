require('dotenv').config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require('cors');
const router = require("./routes/routes");

const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// app.use(cors({
//     origin: `http://localhost:${process.env.PORT}`,
//     methods: ["GET", "POST"],
//     credentials: true
// }));

app.use(express.static('public'));
app.use('/fa', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')));
// app.use('/js', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));

app.use(router);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});