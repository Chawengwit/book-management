const multer = require("multer");
const path = require("path");


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

module.exports = upload;