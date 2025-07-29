const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { uploadPotensiDesaFiles } = require("../../middlewares/scanUpload");
const path = require("path");
const fs = require("fs");
const { get } = require("http");

const createPotensiDesa = async (req, res) => {
  try {
    const { nama, deskripsi, kategori } = req.body;

    if (!nama || !kategori) {
      return res.status(400).json({ message: "Nama dan kategori harus diisi" });
    }

    const validCategories = ["Kesenian dan Kebudayaan", "Pariwisata", "Sarana Prasarana"];
    if (!validCategories.includes(kategori)) {
      return res.status(400).json({ message: "Kategori harus salah satu dari: Kesenian dan Kebudayaan, Pariwisata, Sarana Prasarana" });
    }

    const files = req.files;
    const foto = files.foto ? `/uploads/potensidesa/${files.foto[0].filename}` : null;

    const potensiDesa = await prisma.potensiDesa.create({
      data: {
        nama,
        deskripsi,
        kategori,
        foto,
      },
    });

    res.status(201).json({
      message: "Potensi desa berhasil dibuat",
      potensiDesa,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllPotensiDesa = async (req, res) => {
  try {
    const data = await prisma.potensiDesa.findMany({
      orderBy: {
        createdAt: 'desc', // Urut dari yang terbaru (opsional, pastikan field ini ada)
      },
    });

    res.status(200).json({
      message: "Berhasil mengambil semua data potensi desa",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};


const getPotensiDesa = async (req, res) => {
  try {
    const { id } = req.params;

    const potensiDesa = await prisma.potensiDesa.findUnique({
      where: { id },
    });

    if (!potensiDesa) {
      return res.status(404).json({ message: "Potensi desa tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail potensi desa berhasil diambil",
      potensiDesa,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updatePotensiDesa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, kategori } = req.body;

    const existingPotensiDesa = await prisma.potensiDesa.findUnique({
      where: { id },
    });
    if (!existingPotensiDesa) {
      return res.status(404).json({ message: "Potensi desa tidak ditemukan" });
    }

    if (kategori) {
      const validCategories = ["Kesenian dan Kebudayaan", "Pariwisata", "Sarana Prasarana"];
      if (!validCategories.includes(kategori)) {
        return res.status(400).json({ message: "Kategori harus salah satu dari: Kesenian dan Kebudayaan, Pariwisata, Sarana Prasarana" });
      }
    }

    const files = req.files;
    const foto = files.foto ? `/uploads/potensidesa/${files.foto[0].filename}` : existingPotensiDesa.foto;

    const updatedPotensiDesa = await prisma.potensiDesa.update({
      where: { id },
      data: {
        nama: nama || existingPotensiDesa.nama,
        deskripsi: deskripsi !== undefined ? deskripsi : existingPotensiDesa.deskripsi,
        kategori: kategori || existingPotensiDesa.kategori,
        foto,
      },
    });

    res.status(200).json({
      message: "Potensi desa berhasil diperbarui",
      potensiDesa: updatedPotensiDesa,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deletePotensiDesa = async (req, res) => {
  try {
    const { id } = req.params;

    const potensiDesa = await prisma.potensiDesa.findUnique({
      where: { id },
    });
    if (!potensiDesa) {
      return res.status(404).json({ message: "Potensi desa tidak ditemukan" });
    }

    await prisma.potensiDesa.delete({
      where: { id },
    });

    res.status(200).json({ message: "Potensi desa berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getFotoPotensiDesa = async (req, res) => {
  try {
    const { type, filename } = req.params;

    // Path absolut ke folder 'public/uploads'
    const rootDir = path.resolve(__dirname, '../..'); // <- dari controllers/pendudukController
    const filePath = path.join(rootDir, 'public', 'uploads', type, filename);

    console.log("File Path:", filePath);

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath); // path absolut, ini wajib
    } else {
      res.status(404).json({ message: "File tidak ditemukan" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  createPotensiDesa,
  getAllPotensiDesa,
  getPotensiDesa,
  updatePotensiDesa,
  deletePotensiDesa,
  uploadPotensiDesaFiles,
  getFotoPotensiDesa,
};