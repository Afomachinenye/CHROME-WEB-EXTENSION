// const express = require("express");
// const app = express();
// const port = 5000;
// const multer = require("multer");
// const fs = require("fs");
// const streamifier = require("streamifier");
// const cloudinary = require("cloudinary").v2;
// require("dotenv").config();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Configure Cloudinary using your credentials
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Set up Multer for file upload
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.post("/api/upload", upload.single("video"), async (req, res) => {
//   const { file } = req;
//   const videoBuffer = Buffer.from(req.file.buffer);

//   if (!file) {
//     return res.status(400).json({ error: "No video file provided." });
//   }

//   const stream = streamifier.createReadStream(file.buffer);

//   cloudinary.uploader
//     .upload_stream({ resource_type: "video" }, (error, result) => {
//       if (error) {
//         return res
//           .status(500)
//           .json({ error: "Error uploading to Cloudinary." });
//       }

//       // Send the Cloudinary URL back to the client
//       console.log(`This is a link to your videoBuffer. Enjoy! `);
//       res.json({ url: result.secure_url });
//     })
//     .end(videoBuffer);
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const express = require("express");
const app = express();
const port = 5000;
const multer = require("multer");
const fs = require("fs");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize an array to store video chunks temporarily
const videoChunks = [];

// Configure Cloudinary using your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to start a new video recording
app.post("/api/start-recording", async (req, res) => {
  // Clear the previous video chunks
  videoChunks.length = 0;

  // Respond with a unique video ID (e.g., timestamp)
  const videoId = Date.now().toString();
  res.json({ videoId });
});

// Endpoint to append video data to the existing recording
app.post(
  "/api/append-video/:videoId",
  upload.single("video"),
  async (req, res) => {
    const { file } = req;

    if (!file) {
      return res.status(400).json({ error: "No video file provided." });
    }

    // Append the video data to the videoChunks array
    videoChunks.push(file.buffer);

    res.json({ message: "Video chunk appended successfully." });
  }
);

// Endpoint to complete video recording and return the video URL
app.post("/api/complete-recording/:videoId", async (req, res) => {
  const { videoId } = req.params;

  if (!videoChunks.length) {
    return res.status(400).json({ error: "No video data found." });
  }

  // Concatenate all video chunks to form the complete video
  const videoBuffer = Buffer.concat(videoChunks);

  // Upload the complete video to Cloudinary
  cloudinary.uploader
    .upload_stream({ resource_type: "video" }, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "Error uploading to Cloudinary." });
      }

      // Send the Cloudinary URL back to the client
      res.json({ url: result.secure_url });
    })
    .end(videoBuffer);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
