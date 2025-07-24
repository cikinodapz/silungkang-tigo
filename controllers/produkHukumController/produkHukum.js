const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { uploadProdukHukumFiles } = require('../../middlewares/scanUpload');
const path = require('path');
const fs = require('fs');

const createKategoriProdukHukum = async (req, res) => {
  try {
    const { kategori } = req.body;

    if (!kategori) {
      return res.status(400).json({ message: "Kategori harus diisi" });
    }

    const existingKategori = await prisma.kategoriProdukHukum.findUnique({
      where: { kategori },
    });
    if (existingKategori) {
      return res.status(400).json({ message: "Kategori sudah ada" });
    }

    const kategoriProdukHukum = await prisma.kategoriProdukHukum.create({
      data: { kategori },
    });

    res.status(201).json({
      message: "Kategori produk hukum berhasil dibuat",
      kategoriProdukHukum,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getKategoriProdukHukum = async (req, res) => {
  try {
    const { id } = req.params;

    const kategoriProdukHukum = await prisma.kategoriProdukHukum.findUnique({
      where: { id },
      include: { produkHukum: true },
    });

    if (!kategoriProdukHukum) {
      return res.status(404).json({ message: "Kategori produk hukum tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail kategori produk hukum berhasil diambil",
      kategoriProdukHukum: kategoriProdukHukum,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateKategoriProdukHukum = async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori } = req.body;

    const existingKategori = await prisma.kategoriProdukHukum.findUnique({
      where: { id },
    });
    if (!existingKategori) {
      return res.status(404).json({ message: "Kategori produk hukum tidak ditemukan" });
    }

    if (kategori && kategori !== existingKategori.kategori) {
      const duplicateKategori = await prisma.kategoriProdukHukum.findUnique({
        where: { kategori },
      });
      if (duplicateKategori) {
        return res.status(400).json({ message: "Kategori sudah ada" });
      }
    }

    const updatedKategoriProdukHukum = await prisma.kategoriProdukHukum.update({
      where: { id },
      data: { kategori: kategori || existingKategori.kategori },
    });

    res.status(200).json({
      message: "Kategori produk hukum berhasil diperbarui",
      kategoriProdukHukum: updatedKategoriProdukHukum,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteKategoriProdukHukum = async (req, res) => {
  try {
    const { id } = req.params;

    const kategoriProdukHukum = await prisma.kategoriProdukHukum.findUnique({
      where: { id },
      include: { produkHukum: true },
    });
    if (!kategoriProdukHukum) {
      return res.status(404).json({ message: "Kategori produk hukum tidak ditemukan" });
    }

    if (kategoriProdukHukum.produkHukum.length > 0) {
      return res.status(400).json({ message: "Kategori tidak dapat dihapus karena memiliki produk hukum terkait" });
    }

    await prisma.kategoriProdukHukum.delete({
      where: { id },
    });

    res.status(200).json({ message: "Kategori produk hukum berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const createProdukHukum = async (req, res) => {
  try {
    const { nama_produk_hukum, kategoriId } = req.body;

    if (!nama_produk_hukum || !kategoriId) {
      return res.status(400).json({ message: "Nama produk hukum dan kategoriId harus diisi" });
    }

    const existingKategori = await prisma.kategoriProdukHukum.findUnique({
      where: { id: kategoriId },
    });
    if (!existingKategori) {
      return res.status(400).json({ message: "Kategori tidak ditemukan" });
    }

    const files = req.files;
    const file_pendukung = files.file_pendukung ? `/uploads/produkhukum/${files.file_pendukung[0].filename}` : null;

    const produkHukum = await prisma.produkHukum.create({
      data: {
        nama_produk_hukum,
        file_pendukung,
        kategori: { connect: { id: kategoriId } },
      },
    });

    await prisma.kategoriProdukHukum.update({
      where: { id: kategoriId },
      data: { jumlah_produk_hukum: { increment: 1 } },
    });

    res.status(201).json({
      message: "Produk hukum berhasil dibuat",
      produkHukum: produkHukum,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllProdukHukum = async (req, res) => {
  try {
    const produkHukumList = await prisma.produkHukum.findMany({
      include: {
        kategori: {
          select: {
            id: true,
            kategori: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // opsional: tampilkan produk hukum terbaru duluan
      },
    });

    res.status(200).json({
      message: "Daftar produk hukum berhasil diambil",
      data: produkHukumList,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};


const getProdukHukum = async (req, res) => {
  try {
    const { id } = req.params;

    const produkHukum = await prisma.produkHukum.findUnique({
      where: { id },
      include: { kategori: true },
    });

    if (!produkHukum) {
      return res.status(404).json({ message: "Produk hukum tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail produk hukum berhasil diambil",
      produkHukum: produkHukum,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateProdukHukum = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_produk_hukum, kategoriId } = req.body;

    const existingProdukHukum = await prisma.produkHukum.findUnique({
      where: { id },
    });
    if (!existingProdukHukum) {
      return res.status(404).json({ message: "Produk hukum tidak ditemukan" });
    }

    if (kategoriId && kategoriId !== existingProdukHukum.kategoriId) {
      const existingKategori = await prisma.kategoriProdukHukum.findUnique({
        where: { id: kategoriId },
      });
      if (!existingKategori) {
        return res.status(400).json({ message: "Kategori tidak ditemukan" });
      }
    }

    const files = req.files;
    const file_pendukung = files.file_pendukung 
      ? `/uploads/produkhukum/${files.file_pendukung[0].filename}` 
      : existingProdukHukum.file_pendukung;

    const updatedProdukHukum = await prisma.produkHukum.update({
      where: { id },
      data: {
        nama_produk_hukum: nama_produk_hukum || existingProdukHukum.nama_produk_hukum,
        file_pendukung,
        kategori: kategoriId ? { connect: { id: kategoriId } } : undefined,
      },
    });

    if (kategoriId && kategoriId !== existingProdukHukum.kategoriId) {
      await prisma.kategoriProdukHukum.update({
        where: { id: existingProdukHukum.kategoriId },
        data: { jumlah_produk_hukum: { decrement: 1 } },
      });
      await prisma.kategoriProdukHukum.update({
        where: { id: kategoriId },
        data: { jumlah_produk_hukum: { increment: 1 } },
      });
    }

    res.status(200).json({
      message: "Produk hukum berhasil diperbarui",
      produkHukum: updatedProdukHukum,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteProdukHukum = async (req, res) => {
  try {
    const { id } = req.params;

    const produkHukum = await prisma.produkHukum.findUnique({
      where: { id },
    });
    if (!produkHukum) {
      return res.status(404).json({ message: "Produk hukum tidak ditemukan" });
    }

    await prisma.produkHukum.delete({
      where: { id },
    });

    await prisma.kategoriProdukHukum.update({
      where: { id: produkHukum.kategoriId },
      data: { jumlah_produk_hukum: { decrement: 1 } },
    });

    res.status(200).json({ message: "Produk hukum berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  createKategoriProdukHukum,
  getKategoriProdukHukum,
  updateKategoriProdukHukum,
  deleteKategoriProdukHukum,
  createProdukHukum,
  getAllProdukHukum,
  getProdukHukum,
  updateProdukHukum,
  deleteProdukHukum,
  uploadProdukHukumFiles,
};