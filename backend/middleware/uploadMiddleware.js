import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPEG, PNG, WEBP and GIF images are allowed."),
      false
    );
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export function handleUpload(fieldName) {
  const middleware = upload.single(fieldName);

  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          message: `Upload error: ${err.message}`,
        });
      }

      if (err) {
        return res.status(400).json({
          message: err.message,
        });
      }

      next();
    });
  };
}