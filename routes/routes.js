const express = require("express");
const router = express.Router();
const path = require("path");

const dashboardPage = path.join(__dirname, "../pages/dashboard.html");

router.get("/", (req, res)=>{
    res.status(200);
    res.type("text/html");
    res.sendFile(dashboardPage);
})

module.exports = router

