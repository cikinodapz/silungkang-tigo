const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "";

    // Tentukan folder tujuan berdasarkan jenis dokumen
    if (file.fieldname === "scan_ktp") {
      uploadPath = "public/uploads/ktp";
    } else if (file.fieldname === "scan_kk") {
      uploadPath = "public/uploads/kk";
    } else if (file.fieldname === "scan_akta_lahir") {
      uploadPath = "public/uploads/akta";
    } else if (file.fieldname === "scan_buku_nikah") {
      uploadPath = "public/uploads/nikah";
    } else if (file.fieldname === "sampul") {
      uploadPath = "public/uploads/berita";
    } else if (file.fieldname === "file_pendukung") {
      uploadPath = "public/uploads/produkhukum";
    } else if (file.fieldname === "foto_umkm") {
      uploadPath = "public/uploads/umkm";
    } else if (file.fieldname === "foto_produk") {
      uploadPath = "public/uploads/produk";
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Filter file (hanya image dan PDF)
const fileFilter = (req, file, cb) => {
  const allowedTypes =
    file.fieldname === "sampul" ||
    file.fieldname === "foto_umkm" ||
    file.fieldname === "foto_produk"
      ? ["image/jpeg", "image/png"]
      : file.fieldname === "file_pendukung"
      ? ["application/pdf"]
      : ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file JPEG atau PNG untuk gambar, dan PDF untuk file pendukung"
      ),
      false
    );
  }
};

// Konfigurasi upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
  fileFilter: fileFilter,
});

// Middleware untuk upload semua file sekaligus
const uploadKepalaKeluargaFiles = upload.fields([
  { name: "scan_ktp", maxCount: 1 },
  { name: "scan_kk", maxCount: 1 },
  { name: "scan_akta_lahir", maxCount: 1 },
  { name: "scan_buku_nikah", maxCount: 1 },
]);

// Middleware for Berita uploads
const uploadBeritaFiles = upload.fields([{ name: "sampul", maxCount: 1 }]);

// Middleware for ProdukHukum uploads
const uploadProdukHukumFiles = upload.fields([
  { name: "file_pendukung", maxCount: 1 },
]);

const uploadLapakDesaFiles = upload.fields([
  { name: 'foto_umkm', maxCount: 1 },
  { name: 'foto_produk', maxCount: 1 },
]);

module.exports = {
  uploadKepalaKeluargaFiles,
  uploadBeritaFiles,
  uploadProdukHukumFiles,
  uploadLapakDesaFiles,
};
