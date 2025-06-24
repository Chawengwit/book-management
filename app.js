const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require('cors');
const router = require("./routes/routes");
const app = express();

// dynamic file
app.set("views", path.join(__dirname, "views"));
app.set("view engine", 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: "secrete",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],        
    credentials: true // Allow cookies if needed
}));

app.use(express.static('public'));
app.use(express.json());
app.use(router);

app.listen(3000, ()=> {
    console.log("start server port 3000");
});