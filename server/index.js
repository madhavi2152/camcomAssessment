const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const UPLOAD_DIR = path.join(__dirname, "uploads");
const MAX_BYTES = 10 * 1024 * 1024;
const CLIENT_BUILD_DIR = path.join(__dirname, "..", "client", "build");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function isJpeg(mimetype, originalname) {
  const lower = String(originalname || "").toLowerCase();
  const extOk = lower.endsWith(".jpg") || lower.endsWith(".jpeg");
  const mimeOk = mimetype === "image/jpeg";
  return extOk && mimeOk;
}

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function filename(req, file, cb) {
    const safeBase =
      "img-" +
      Date.now() +
      "-" +
      Math.random().toString(16).slice(2) +
      path.extname(file.originalname).toLowerCase();
    cb(null, safeBase);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: function fileFilter(req, file, cb) {
    if (!isJpeg(file.mimetype, file.originalname)) {
      const err = new Error("Only .jpg/.jpeg images are allowed.");
      err.code = "INVALID_FILE_TYPE";
      return cb(err);
    }
    return cb(null, true);
  }
});

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: true }));
app.use(morgan("dev"));

app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/upload", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          ok: false,
          error: "File too large. Max size is 10MB."
        });
      }
      if (err.code === "INVALID_FILE_TYPE") {
        return res.status(415).json({ ok: false, error: err.message });
      }
      return res.status(400).json({ ok: false, error: err.message || "Upload failed." });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No file received." });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    return res.status(201).json({ ok: true, imageUrl });
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(CLIENT_BUILD_DIR));
  app.get("*", (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD_DIR, "index.html"));
  });
}

app.use((err, req, res, next) => {
  void req;
  void next;
  console.error(err);
  res.status(500).json({ ok: false, error: "Server error." });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});




