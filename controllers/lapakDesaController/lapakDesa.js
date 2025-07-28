const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { uploadLapakDesaFiles } = require("../../middlewares/scanUpload");
const path = require("path");
const fs = require("fs");

const createUMKM = async (req, res) => {
  try {
    const { nama_umkm, deskripsi_umkm, kontak_wa } = req.body;

    if (!nama_umkm || !kontak_wa) {
      return res
        .status(400)
        .json({ message: "Nama UMKM dan kontak WA harus diisi" });
    }

    const existingUMKM = await prisma.uMKM.findUnique({
      where: { nama_umkm },
    });
    if (existingUMKM) {
      return res.status(400).json({ message: "Nama UMKM sudah ada" });
    }

    const files = req.files;
    const foto_umkm = files.foto_umkm
      ? `/uploads/umkm/${files.foto_umkm[0].filename}`
      : null;

    const umkm = await prisma.uMKM.create({
      data: {
        nama_umkm,
        deskripsi_umkm,
        foto_umkm,
        kontak_wa,
      },
    });

    res.status(201).json({
      message: "UMKM berhasil dibuat",
      umkm,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllUMKM = async (req, res) => {
  try {
    const allUMKM = await prisma.uMKM.findMany({
      include: { produk: true }, // Optional: hanya jika kamu ingin tampilkan daftar produk juga
      orderBy: {
        createdAt: 'desc', // Optional: menampilkan dari yang terbaru
      }
    });

    res.status(200).json({
      message: "Daftar semua UMKM berhasil diambil",
      data: allUMKM,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getUMKM = async (req, res) => {
  try {
    const { id } = req.params;

    const umkm = await prisma.uMKM.findUnique({
      where: { id },
      include: { produk: true },
    });

    if (!umkm) {
      return res.status(404).json({ message: "UMKM tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail UMKM berhasil diambil",
      umkm,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateUMKM = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_umkm, deskripsi_umkm, kontak_wa } = req.body;

    const existingUMKM = await prisma.uMKM.findUnique({
      where: { id },
    });
    if (!existingUMKM) {
      return res.status(404).json({ message: "UMKM tidak ditemukan" });
    }

    if (nama_umkm && nama_umkm !== existingUMKM.nama_umkm) {
      const duplicateUMKM = await prisma.uMKM.findUnique({
        where: { nama_umkm },
      });
      if (duplicateUMKM) {
        return res.status(400).json({ message: "Nama UMKM sudah ada" });
      }
    }

    const files = req.files;
    const foto_umkm = files.foto_umkm
      ? `/uploads/umkm/${files.foto_umkm[0].filename}`
      : existingUMKM.foto_umkm;

    const updatedUMKM = await prisma.uMKM.update({
      where: { id },
      data: {
        nama_umkm: nama_umkm || existingUMKM.nama_umkm,
        deskripsi_umkm:
          deskripsi_umkm !== undefined
            ? deskripsi_umkm
            : existingUMKM.deskripsi_umkm,
        foto_umkm,
        kontak_wa: kontak_wa || existingUMKM.kontak_wa,
      },
    });

    res.status(200).json({
      message: "UMKM berhasil diperbarui",
      umkm: updatedUMKM,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteUMKM = async (req, res) => {
  try {
    const { id } = req.params;

    const umkm = await prisma.uMKM.findUnique({
      where: { id },
      include: { produk: true },
    });
    if (!umkm) {
      return res.status(404).json({ message: "UMKM tidak ditemukan" });
    }

    if (umkm.produk.length > 0) {
      return res
        .status(400)
        .json({
          message: "UMKM tidak dapat dihapus karena memiliki produk terkait",
        });
    }

    await prisma.uMKM.delete({
      where: { id },
    });

    res.status(200).json({ message: "UMKM berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getFotoUMKM = async (req, res) => {
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

const createProduk = async (req, res) => {
  try {
    const { nama_produk, deskripsi_produk, link_produk, umkmId } = req.body;

    if (!nama_produk || !umkmId) {
      return res
        .status(400)
        .json({ message: "Nama produk dan UMKM ID harus diisi" });
    }

    const existingUMKM = await prisma.uMKM.findUnique({
      where: { id: umkmId },
    });
    if (!existingUMKM) {
      return res.status(400).json({ message: "UMKM tidak ditemukan" });
    }

    const files = req.files;
    const foto_produk = files.foto_produk
      ? `/uploads/produk/${files.foto_produk[0].filename}`
      : null;

    const produk = await prisma.produk.create({
      data: {
        nama_produk,
        deskripsi_produk,
        foto_produk,
        link_produk,
        umkm: { connect: { id: umkmId } },
      },
    });

    res.status(201).json({
      message: "Produk berhasil dibuat",
      produk,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllProduk = async (req, res) => {
  try {
    const allProduk = await prisma.produk.findMany({
      include: { umkm: true }, // jika ingin menampilkan info UMKM juga
      orderBy: {
        createdAt: "desc", // tampilkan dari produk terbaru, opsional
      },
    });

    res.status(200).json({
      message: "Daftar semua produk berhasil diambil",
      data: allProduk,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};


const getProduk = async (req, res) => {
  try {
    const { id } = req.params;

    const produk = await prisma.produk.findUnique({
      where: { id },
      include: { umkm: true },
    });

    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail produk berhasil diambil",
      produk,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_produk, deskripsi_produk, link_produk, umkmId } = req.body;

    const existingProduk = await prisma.produk.findUnique({
      where: { id },
    });
    if (!existingProduk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    if (umkmId && umkmId !== existingProduk.umkmId) {
      const existingUMKM = await prisma.uMKM.findUnique({
        where: { id: umkmId },
      });
      if (!existingUMKM) {
        return res.status(400).json({ message: "UMKM tidak ditemukan" });
      }
    }

    const files = req.files;
    const foto_produk = files.foto_produk
      ? `/uploads/produk/${files.foto_produk[0].filename}`
      : existingProduk.foto_produk;

    const updatedProduk = await prisma.produk.update({
      where: { id },
      data: {
        nama_produk: nama_produk || existingProduk.nama_produk,
        deskripsi_produk:
          deskripsi_produk !== undefined
            ? deskripsi_produk
            : existingProduk.deskripsi_produk,
        foto_produk,
        link_produk:
          link_produk !== undefined ? link_produk : existingProduk.link_produk,
        umkm: umkmId ? { connect: { id: umkmId } } : undefined,
      },
    });

    res.status(200).json({
      message: "Produk berhasil diperbarui",
      produk: updatedProduk,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;

    const produk = await prisma.produk.findUnique({
      where: { id },
    });
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    await prisma.produk.delete({
      where: { id },
    });

    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getFotoProduk = async (req, res) => {
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
  createUMKM,
  getAllUMKM,
  getUMKM,
  updateUMKM,
  deleteUMKM,
  getFotoUMKM,
  createProduk,
  getAllProduk,
  getProduk,
  updateProduk,
  deleteProduk,
  getFotoProduk,
  uploadLapakDesaFiles,
};
