const express = require("express");
const path = require("path");
const router =require("./routes/routes");

const app = express();

// dynamic file
app.use(router);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", 'ejs');

// for route
// const router = require("./routes/routes");
// app.use(router);

app.listen(3000, ()=> {
    console.log("start server port 3000");
})