const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createKK = async (req, res) => {
  try {
    const { no_kk, provinsi, kabupaten, kecamatan, kelurahan, dusun, rw, rt, kode_pos } = req.body;

    const existingKK = await prisma.kK.findUnique({
      where: { no_kk }
    });
    
    if (existingKK) {
      return res.status(400).json({ message: "Nomor KK sudah terdaftar" });
    }

    const kk = await prisma.kK.create({
      data: {
        no_kk,
        provinsi,
        kabupaten,
        kecamatan,
        kelurahan,
        dusun,
        rw,
        rt,
        kode_pos
      }
    });

    res.status(201).json({ message: "KK berhasil dibuat", kk });
  } catch (error) {
    console.error("Create KK error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getKKWithoutKepalaKeluarga = async (req, res) => {
  try {
    // Cari semua KK yang kepalaKeluargaId-nya null
    const kkList = await prisma.kK.findMany({
      where: {
        kepalaKeluargaId: null
      },
      select: {
        id: true,
        no_kk: true,
        provinsi: true,
        kabupaten: true,
        kecamatan: true,
        kelurahan: true,
        dusun: true,
        rw: true,
        rt: true,
        kode_pos: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ 
      success: true,
      data: kkList 
    });
  } catch (error) {
    console.error("Error fetching KK without kepala keluarga:", error);
    res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan server" 
    });
  }
};

const getAllKK = async (req, res) => {
  try {
    const kkList = await prisma.kK.findMany({
      include: {
        kepalaKeluarga: {
          select: {
            id: true,
            nik: true,
            nama: true,
            no_akta_kelahiran: true,
            jenis_kelamin: true,
            tempat_lahir: true,
            tanggal_lahir: true,
            golongan_darah: true,
            agama: true,
            status_perkawinan: true,
            pendidikan_akhir: true,
            pekerjaan: true,
            nama_ayah: true,
            nama_ibu: true,
            scan_ktp: true,
            scan_kk: true,
            scan_akta_lahir: true,
            scan_buku_nikah: true,
            createdAt: true,
            updatedAt: true,
          },
        },
          AnggotaKeluarga: {
          select: {
            id: true,
            nik: true,
            nama: true,
            no_akta_kelahiran: true,
            jenis_kelamin: true,
            tempat_lahir: true,
            tanggal_lahir: true,
            golongan_darah: true,
            agama: true,
            status_hubungan: true,
            status_perkawinan: true,
            pendidikan_akhir: true,
            pekerjaan: true,
            nama_ayah: true,
            nama_ibu: true,
            scan_ktp: true,
            scan_kk: true,
            scan_akta_lahir: true,
            scan_buku_nikah: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    res.json(kkList);
  } catch (error) {
    console.error("Get all KK error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getKKById = async (req, res) => {
  try {
    const kk = await prisma.kK.findUnique({
      where: { id: req.params.id },
    });
    
    if (!kk) return res.status(404).json({ message: "KK tidak ditemukan" });
    res.json(kk);
  } catch (error) {
    console.error("Get KK by ID error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateKK = async (req, res) => {
  try {
    const { no_kk, provinsi, kabupaten, kecamatan, kelurahan, dusun, rw, rt, kode_pos } = req.body;

    const kk = await prisma.kK.update({
      where: { id: req.params.id },
      data: {
        no_kk,
        provinsi,
        kabupaten,
        kecamatan,
        kelurahan,
        dusun,
        rw,
        rt,
        kode_pos
      }
    });
    
    res.json({ message: "KK berhasil diperbarui", kk });
  } catch (error) {
    console.error("Update KK error:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "KK tidak ditemukan" });
    }
    res.status(400).json({ message: "Terjadi kesalahan" });
  }
};

const deleteKK = async (req, res) => {
  try {
    await prisma.kK.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: "KK berhasil dihapus" });
  } catch (error) {
    console.error("Delete KK error:", error);
    res.status(400).json({ message: "Terjadi kesalahan" });
  }
};

module.exports = {
  createKK,
  getKKWithoutKepalaKeluarga,
  getAllKK,
  getKKById,
  updateKK,
  deleteKK
};