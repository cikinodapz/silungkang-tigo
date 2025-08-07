const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { uploadBeritaFiles } = require('../../middlewares/scanUpload');
const path = require('path');
const fs = require('fs');
const { get } = require('http');

const createKategoriBerita = async (req, res) => {
  try {
    const { kategori } = req.body;

    if (!kategori) {
      return res.status(400).json({ message: "Kategori harus diisi" });
    }

    const existingKategori = await prisma.kategoriBerita.findUnique({
      where: { kategori },
    });
    if (existingKategori) {
      return res.status(400).json({ message: "Kategori sudah ada" });
    }

    const kategoriBerita = await prisma.kategoriBerita.create({
      data: { kategori },
    });

    res.status(201).json({
      message: "Kategori berita berhasil dibuat",
      kategoriBerita,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllKategoriBerita = async (req, res) => {
  try {
    const allKategori = await prisma.kategoriBerita.findMany({
      orderBy: {
        kategori: 'asc', // Mengurutkan berdasarkan nama kategori A-Z
      },
    });

    if (!allKategori || allKategori.length === 0) {
      return res.status(404).json({ message: "Tidak ada kategori berita yang ditemukan" });
    }

    res.status(200).json({
      message: "Semua kategori berita berhasil diambil",
      total: allKategori.length,
      data: allKategori,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getDetailKategoriBerita = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID kategori harus disediakan" });
    }

    const kategoriBerita = await prisma.kategoriBerita.findUnique({
      where: { id },
    });

    if (!kategoriBerita) {
      return res.status(404).json({ message: "Kategori berita tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail kategori berita berhasil diambil",
      data: kategoriBerita,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateKategoriBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori } = req.body;

    const existingKategori = await prisma.kategoriBerita.findUnique({
      where: { id },
    });
    if (!existingKategori) {
      return res.status(404).json({ message: "Kategori berita tidak ditemukan" });
    }

    if (kategori && kategori !== existingKategori.kategori) {
      const duplicateKategori = await prisma.kategoriBerita.findUnique({
        where: { kategori },
      });
      if (duplicateKategori) {
        return res.status(400).json({ message: "Kategori sudah ada" });
      }
    }

    const updatedKategoriBerita = await prisma.kategoriBerita.update({
      where: { id },
      data: { kategori: kategori || existingKategori.kategori },
    });

    res.status(200).json({
      message: "Kategori berita berhasil diperbarui",
      kategoriBerita: updatedKategoriBerita,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteKategoriBerita = async (req, res) => {
  try {
    const { id } = req.params;

    const kategoriBerita = await prisma.kategoriBerita.findUnique({
      where: { id },
      include: { berita: true },
    });
    if (!kategoriBerita) {
      return res.status(404).json({ message: "Kategori berita tidak ditemukan" });
    }

    if (kategoriBerita.berita.length > 0) {
      return res.status(400).json({ message: "Kategori tidak dapat dihapus karena memiliki berita terkait" });
    }

    await prisma.kategoriBerita.delete({
      where: { id },
    });

    res.status(200).json({ message: "Kategori berita berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const createBerita = async (req, res) => {
  try {
    const { judul, berita, kategoriId } = req.body;

    if (!judul || !berita || !kategoriId) {
      return res.status(400).json({ message: "Judul, berita, dan kategoriId harus diisi" });
    }

    const existingKategori = await prisma.kategoriBerita.findUnique({
      where: { id: kategoriId },
    });
    if (!existingKategori) {
      return res.status(400).json({ message: "Kategori tidak ditemukan" });
    }

    // Handle multiple file uploads
    const files = req.files || {};
    const sampul = files.sampul && Array.isArray(files.sampul)
      ? files.sampul.map(file => `/uploads/berita/${file.filename}`)
      : [];

    const newBerita = await prisma.berita.create({
      data: {
        judul,
        berita,
        sampul, // Store array of image paths (empty array if no files)
        kategori: { connect: { id: kategoriId } },
      },
    });

    // Update jumlah_berita in KategoriBerita
    await prisma.kategoriBerita.update({
      where: { id: kategoriId },
      data: { jumlah_berita: { increment: 1 } },
    });

    res.status(201).json({
      message: "Berita berhasil dibuat",
      berita: newBerita,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

const getAllBerita = async (req, res) => {
  try {
    const semuaBerita = await prisma.berita.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        kategori: {
          select: {
            id: true,
            kategori: true
          }
        }
      }
    });

    res.status(200).json({
      message: "Berhasil mengambil semua data berita",
      data: semuaBerita
    });
  } catch (error) {
    console.error("Error saat mengambil berita:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getBerita = async (req, res) => {
  try {
    const { id } = req.params;

    const berita = await prisma.berita.findUnique({
      where: { id },
      include: { kategori: true },
    });

    if (!berita) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail berita berhasil diambil",
      berita,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, berita, kategoriId } = req.body;

    // Validate required fields
    if (!judul && !berita && !kategoriId && !req.files?.sampul) {
      return res.status(400).json({ message: "Minimal satu field harus diupdate" });
    }

    // Check if news exists
    const existingBerita = await prisma.berita.findUnique({
      where: { id },
      include: { kategori: true } // Include kategori relation
    });
    
    if (!existingBerita) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    // Validate kategori if provided
    if (kategoriId && kategoriId !== existingBerita.kategoriId) {
      const existingKategori = await prisma.kategoriBerita.findUnique({
        where: { id: kategoriId },
      });
      if (!existingKategori) {
        return res.status(400).json({ message: "Kategori tidak ditemukan" });
      }
    }

    // Handle file uploads (support multiple files like create function)
    const files = req.files || {};
    let sampul = existingBerita.sampul;
    
    if (files.sampul) {
      sampul = Array.isArray(files.sampul)
        ? files.sampul.map(file => `/uploads/berita/${file.filename}`)
        : [`/uploads/berita/${files.sampul[0].filename}`];
    }

    // Update news data
    const updatedBerita = await prisma.berita.update({
      where: { id },
      data: {
        judul: judul || existingBerita.judul,
        berita: berita || existingBerita.berita,
        sampul,
        kategori: kategoriId ? { connect: { id: kategoriId } } : undefined,
      },
      include: { kategori: true } // Include updated kategori relation in response
    });

    // Update jumlah_berita counters if kategori changed
    if (kategoriId && kategoriId !== existingBerita.kategoriId) {
      await prisma.$transaction([
        prisma.kategoriBerita.update({
          where: { id: existingBerita.kategoriId },
          data: { jumlah_berita: { decrement: 1 } },
        }),
        prisma.kategoriBerita.update({
          where: { id: kategoriId },
          data: { jumlah_berita: { increment: 1 } },
        }),
      ]);
    }

    res.status(200).json({
      message: "Berita berhasil diperbarui",
      berita: updatedBerita,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan server",
      error: error.message // Include error message for debugging
    });
  }
};

const deleteBerita = async (req, res) => {
  try {
    const { id } = req.params;

    const berita = await prisma.berita.findUnique({
      where: { id },
    });
    if (!berita) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    await prisma.berita.delete({
      where: { id },
    });

    // Update jumlah_berita in KategoriBerita
    await prisma.kategoriBerita.update({
      where: { id: berita.kategoriId },
      data: { jumlah_berita: { decrement: 1 } },
    });

    res.status(200).json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Fungsi untuk melihat file
const getSampul = async (req, res) => {
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
  createKategoriBerita,
  getAllKategoriBerita,
  getDetailKategoriBerita,
  updateKategoriBerita,
  deleteKategoriBerita,
  createBerita,
  getAllBerita,
  getBerita,
  updateBerita,
  deleteBerita,
  uploadBeritaFiles,
  getSampul,
};