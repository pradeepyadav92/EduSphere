const multer = require("multer");
require("dotenv").config();
const path = require("path");
const fs = require("fs");

let upload;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  // Use Cloudinary when credentials are available
  const cloudinary = require("cloudinary").v2;
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "edusphere",
      allowed_formats: ["jpg", "png", "jpeg"],
      resource_type: "auto",
    },
  });

  upload = multer({ storage });
  console.log("✅ Multer: Using Cloudinary storage");
} else {
  // Fallback to local disk storage
  const uploadDir = path.join(__dirname, "../media/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

  upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png/;
      if (allowed.test(path.extname(file.originalname).toLowerCase())) {
        cb(null, true);
      } else {
        cb(new Error("Only jpg/jpeg/png images allowed"));
      }
    },
  });
  console.log("⚠️  Multer: Cloudinary not configured — using local disk storage (media/uploads/)");
}

module.exports = upload;
