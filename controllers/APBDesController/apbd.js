const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAPBDes = async (req, res) => {
  try {
    const { pendanaan, jumlah_dana, jenis_apbd, tahun, keterangan } = req.body;

    // Validate required fields
    if (!pendanaan || !jumlah_dana || !jenis_apbd || !tahun) {
      return res.status(400).json({ message: "Pendanaan, jumlah_dana, jenis_apbd, dan tahun harus diisi" });
    }

    // Validate jumlah_dana is a positive number
    if (jumlah_dana <= 0) {
      return res.status(400).json({ message: "Jumlah dana harus lebih dari 0" });
    }

    // Validate tahun is a valid year
    if (tahun < 1900 || tahun > new Date().getFullYear() + 1) {
      return res.status(400).json({ message: "Tahun tidak valid" });
    }

    const apbdes = await prisma.aPBDes.create({
      data: {
        pendanaan,
        jumlah_dana: parseFloat(jumlah_dana),
        jenis_apbd,
        tahun: parseInt(tahun),
        keterangan,
      },
    });

    res.status(201).json({
      message: "Data APBDes berhasil dibuat",
      apbdes,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllAPBDes = async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { tahun, jenis_apbd } = req.query;

    // Build filter object
    const filter = {};
    if (tahun) filter.tahun = parseInt(tahun);
    if (jenis_apbd) filter.jenis_apbd = jenis_apbd;

    const allAPBDes = await prisma.aPBDes.findMany({
      where: filter,
      orderBy: {
        tahun: 'desc',
      },
    });

    res.status(200).json({
      message: allAPBDes.length > 0 
        ? "Semua data APBDes berhasil diambil" 
        : "Data APBDes kosong",
      total: allAPBDes.length,
      data: allAPBDes,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};


const getAPBDes = async (req, res) => {
  try {
    const { id } = req.params;

    const apbdes = await prisma.aPBDes.findUnique({
      where: { id },
    });

    if (!apbdes) {
      return res.status(404).json({ message: "Data APBDes tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail APBDes berhasil diambil",
      apbdes,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateAPBDes = async (req, res) => {
  try {
    const { id } = req.params;
    const { pendanaan, jumlah_dana, jenis_apbd, tahun, keterangan } = req.body;

    // Check if APBDes exists
    const existingAPBDes = await prisma.aPBDes.findUnique({
      where: { id },
    });
    if (!existingAPBDes) {
      return res.status(404).json({ message: "Data APBDes tidak ditemukan" });
    }

    // Validate jumlah_dana if provided
    if (jumlah_dana && jumlah_dana <= 0) {
      return res.status(400).json({ message: "Jumlah dana harus lebih dari 0" });
    }

    // Validate tahun if provided
    if (tahun && (tahun < 1900 || tahun > new Date().getFullYear() + 1)) {
      return res.status(400).json({ message: "Tahun tidak valid" });
    }

    const updatedAPBDes = await prisma.aPBDes.update({
      where: { id },
      data: {
        pendanaan: pendanaan || existingAPBDes.pendanaan,
        jumlah_dana: jumlah_dana ? parseFloat(jumlah_dana) : existingAPBDes.jumlah_dana,
        jenis_apbd: jenis_apbd || existingAPBDes.jenis_apbd,
        tahun: tahun ? parseInt(tahun) : existingAPBDes.tahun,
        keterangan: keterangan !== undefined ? keterangan : existingAPBDes.keterangan,
      },
    });

    res.status(200).json({
      message: "Data APBDes berhasil diperbarui",
      apbdes: updatedAPBDes,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteAPBDes = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if APBDes exists
    const apbdes = await prisma.aPBDes.findUnique({
      where: { id },
    });
    if (!apbdes) {
      return res.status(404).json({ message: "Data APBDes tidak ditemukan" });
    }

    await prisma.aPBDes.delete({
      where: { id },
    });

    res.status(200).json({ message: "Data APBDes berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  createAPBDes,
  getAllAPBDes,
  getAPBDes,
  updateAPBDes,
  deleteAPBDes,
};