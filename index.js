const express = require("express");
const router = require("./routes/routes");
const app = express();

app.use(router);

app.listen(3000, ()=> {
    console.log("start server port 3000");
})