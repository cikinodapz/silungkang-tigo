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

const getDashboardSummary = async (req, res) => {
  try {
    // Fetch counts for each model
    const [
      totalKK,
      totalKepalaKeluarga,
      totalAnggotaKeluarga,
      totalLahirMasuk,
      totalMeninggal,
      totalPindahKeluar,
      totalAPBDes,
      totalBerita,
      totalKategoriBerita,
      totalUMKM,
      totalProduk,
      totalProdukHukum,
      totalKategoriProdukHukum,
      totalPotensiDesa,
    ] = await Promise.all([
      prisma.kK.count(),
      prisma.kepalaKeluarga.count(),
      prisma.anggotaKeluarga.count(),
      prisma.lahirMasuk.count(),
      prisma.meninggal.count(),
      prisma.pindahKeluar.count(),
      prisma.aPBDes.count(),
      prisma.berita.count(),
      prisma.kategoriBerita.count(),
      prisma.uMKM.count(),
      prisma.produk.count(),
      prisma.produkHukum.count(),
      prisma.kategoriProdukHukum.count(),
      prisma.potensiDesa.count(),
    ]);

    // Fetch additional metrics, e.g., latest entries or aggregates
    const latestBerita = await prisma.berita.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, judul: true, createdAt: true },
    });

    const totalAPBDesDana = await prisma.aPBDes.aggregate({
      _sum: { jumlah_dana: true },
    });

    const response = {
      message: 'Dashboard summary retrieved successfully',
      data: {
        penduduk: {
          totalKK,
          totalKepalaKeluarga,
          totalAnggotaKeluarga,
        },
        mutasiPenduduk: {
          totalLahirMasuk,
          totalMeninggal,
          totalPindahKeluar,
        },
        apbdes: {
          totalRecords: totalAPBDes,
          totalDana: totalAPBDesDana._sum.jumlah_dana || 0,
        },
        berita: {
          totalBerita,
          totalKategoriBerita,
          latestBerita,
        },
        lapakDesa: {
          totalUMKM,
          totalProduk,
        },
        produkHukum: {
          totalProdukHukum,
          totalKategoriProdukHukum,
        },
        potensiDesa: {
          totalPotensiDesa,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Track visitor setiap request
const trackVisitor = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Cek apakah visitor sudah ada
    let visitor = await prisma.visitor.findFirst({
      where: { ip_address: ip, user_agent: userAgent }
    });

    if (visitor) {
      // Kalau sudah ada → update jumlah kunjungan
      visitor = await prisma.visitor.update({
        where: { id: visitor.id },
        data: { visits: visitor.visits + 1 }
      });
    } else {
      // Kalau belum ada → buat baru
      visitor = await prisma.visitor.create({
        data: { ip_address: ip, user_agent: userAgent }
      });
    }

    res.status(200).json({
      message: "Visitor tracked successfully",
      data: visitor
    });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Ambil statistik jumlah pengunjung
const getVisitorStats = async (req, res) => {
  try {
    const totalVisitors = await prisma.visitor.count(); // jumlah pengunjung unik
    const totalVisits = await prisma.visitor.aggregate({
      _sum: { visits: true }
    });

    res.status(200).json({
      message: "Visitor stats retrieved",
      totalVisitors,
      totalVisits: totalVisits._sum.visits || 0
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createKK,
  getKKWithoutKepalaKeluarga,
  getAllKK,
  getKKById,
  updateKK,
  deleteKK,
  getDashboardSummary,
  trackVisitor,
  getVisitorStats,
};