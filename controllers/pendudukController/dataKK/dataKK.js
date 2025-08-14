const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ExcelJS = require('exceljs');

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

const exportPopulationData = async (req, res) => {
  try {
    // Fetch all KK data with related KepalaKeluarga and AnggotaKeluarga
    const kkData = await prisma.kK.findMany({
      include: {
        kepalaKeluarga: true,
        AnggotaKeluarga: true,
      },
    });

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Penduduk');

    // Define columns for the Excel file
    worksheet.columns = [
      { header: 'No. KK', key: 'no_kk', width: 15 },
      { header: 'Provinsi', key: 'provinsi', width: 20 },
      { header: 'Kabupaten', key: 'kabupaten', width: 20 },
      { header: 'Kecamatan', key: 'kecamatan', width: 20 },
      { header: 'Kelurahan', key: 'kelurahan', width: 20 },
      { header: 'Dusun', key: 'dusun', width: 15 },
      { header: 'RW', key: 'rw', width: 10 },
      { header: 'RT', key: 'rt', width: 10 },
      { header: 'Kode Pos', key: 'kode_pos', width: 10 },
      { header: 'Tipe', key: 'tipe', width: 15 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
      { header: 'Tempat Lahir', key: 'tempat_lahir', width: 20 },
      { header: 'Tanggal Lahir', key: 'tanggal_lahir', width: 15 },
      { header: 'Golongan Darah', key: 'golongan_darah', width: 15 },
      { header: 'Agama', key: 'agama', width: 15 },
      { header: 'Status Perkawinan', key: 'status_perkawinan', width: 20 },
      { header: 'Pendidikan Akhir', key: 'pendidikan_akhir', width: 20 },
      { header: 'Pekerjaan', key: 'pekerjaan', width: 20 },
      { header: 'Nama Ayah', key: 'nama_ayah', width: 25 },
      { header: 'Nama Ibu', key: 'nama_ibu', width: 25 },
      { header: 'Status Hubungan', key: 'status_hubungan', width: 20 },
    ];

    // Add data to the worksheet
    kkData.forEach((kk) => {
      // Add Kepala Keluarga data
      if (kk.kepalaKeluarga) {
        worksheet.addRow({
          no_kk: kk.no_kk,
          provinsi: kk.provinsi,
          kabupaten: kk.kabupaten,
          kecamatan: kk.kecamatan,
          kelurahan: kk.kelurahan,
          dusun: kk.dusun,
          rw: kk.rw,
          rt: kk.rt,
          kode_pos: kk.kode_pos,
          tipe: 'Kepala Keluarga',
          nik: kk.kepalaKeluarga.nik,
          nama: kk.kepalaKeluarga.nama,
          jenis_kelamin: kk.kepalaKeluarga.jenis_kelamin,
          tempat_lahir: kk.kepalaKeluarga.tempat_lahir,
          tanggal_lahir: kk.kepalaKeluarga.tanggal_lahir.toISOString().split('T')[0],
          golongan_darah: kk.kepalaKeluarga.golongan_darah || '-',
          agama: kk.kepalaKeluarga.agama,
          status_perkawinan: kk.kepalaKeluarga.status_perkawinan,
          pendidikan_akhir: kk.kepalaKeluarga.pendidikan_akhir,
          pekerjaan: kk.kepalaKeluarga.pekerjaan,
          nama_ayah: kk.kepalaKeluarga.nama_ayah,
          nama_ibu: kk.kepalaKeluarga.nama_ibu,
          status_hubungan: 'Kepala Keluarga',
        });
      }

      // Add Anggota Keluarga data
      kk.AnggotaKeluarga.forEach((anggota) => {
        worksheet.addRow({
          no_kk: kk.no_kk,
          provinsi: kk.provinsi,
          kabupaten: kk.kabupaten,
          kecamatan: kk.kecamatan,
          kelurahan: kk.kelurahan,
          dusun: kk.dusun,
          rw: kk.rw,
          rt: kk.rt,
          kode_pos: kk.kode_pos,
          tipe: 'Anggota Keluarga',
          nik: anggota.nik,
          nama: anggota.nama,
          jenis_kelamin: anggota.jenis_kelamin,
          tempat_lahir: anggota.tempat_lahir,
          tanggal_lahir: anggota.tanggal_lahir.toISOString().split('T')[0],
          golongan_darah: anggota.golongan_darah || '-',
          agama: anggota.agama,
          status_perkawinan: anggota.status_perkawinan,
          pendidikan_akhir: anggota.pendidikan_akhir,
          pekerjaan: anggota.pekerjaan,
          nama_ayah: anggota.nama_ayah,
          nama_ibu: anggota.nama_ibu,
          status_hubungan: anggota.status_hubungan,
        });
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Set response headers for Excel file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="Data_Penduduk.xlsx"');

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export population data error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    await prisma.$disconnect();
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
  exportPopulationData,
  getDashboardSummary,
  trackVisitor,
  getVisitorStats,
};