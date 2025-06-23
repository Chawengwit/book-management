const express = require("express");
const router = express.Router();

// const path = require("path");

// const indexPage = path.join(__dirname, "../pages/index.html");
// const bookPage = path.join(__dirname, "../pages/book.html");

// router.get("/", (req, res)=>{
//     let params = req.params;
//     console.log("## params: ", params);

//     res.status(200);
//     res.type("text/html");
//     res.sendFile(bookPage);
// });

// router.get("/book:id", (req, res)=>{
//     let params = req.params;
//     res.status(200);
//     res.type("text/html");
//     res.sendFile(indexPage);
// });

// for ejs
router.get('/', (req, res) => {
    const product = {
        "name": "Car"
    }

    let sendData = {
        data: product['name'],
        data2: "test123",
        html: '<p style="color:red;">test send html</p>'
    }

    res.render('index.ejs', sendData);
});

module.exports = router

