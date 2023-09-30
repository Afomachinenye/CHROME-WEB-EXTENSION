const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
// const cors = require("cors");

app.use(bodyParser.json()); // accept json from frontend
app.use(bodyParser.urlencoded({ extended: true })); // accept form data from frontend
// app.use(cors({ credentials: true, origin: origin }));
// app.use(cors());

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const type = upload.single("video");

// Define a route for video uploads and redirection
app.post("/api/upload-video", upload.single("video"), async (req, res) => {
  try {
    // let { video } = req.file;
    if (!req.file) {
      return res.status(400).json({ error: "Please provide a video" });
    }
    const fileupload = require("express-fileupload");

    app.use(fileupload({ useTempFiles: true }));
    // Upload the video to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
    });

    // Redirect the user to the Cloudinary URL to watch the video
    res.redirect(result.secure_url);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
