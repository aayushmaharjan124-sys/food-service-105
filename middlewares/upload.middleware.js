const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const allowedExts = /\.(jpeg|jpg|png|webp)$/i
  const validMime = allowedMimes.includes(file.mimetype)
  const validExt = allowedExts.test(path.extname(file.originalname))
  if (validMime && validExt) return cb(null, true)
  cb(new Error('Only images (jpg, jpeg, png, webp) are allowed'))
}

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB — matches PHP limit
  fileFilter,
});

module.exports = upload;
