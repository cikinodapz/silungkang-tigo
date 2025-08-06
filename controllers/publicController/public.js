const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getPopulationStats = async (req, res) => {
  try {
    // Get total number of family heads (Kepala Keluarga)
    const totalKepalaKeluarga = await prisma.kepalaKeluarga.count();

    // Get total number of family members (Anggota Keluarga)
    const totalAnggotaKeluarga = await prisma.anggotaKeluarga.count();

    // Get total males and females from both KepalaKeluarga and AnggotaKeluarga
    const kepalaKeluargaByGender = await prisma.kepalaKeluarga.groupBy({
      by: ['jenis_kelamin'],
      _count: {
        jenis_kelamin: true,
      },
    });

    const anggotaKeluargaByGender = await prisma.anggotaKeluarga.groupBy({
      by: ['jenis_kelamin'],
      _count: {
        jenis_kelamin: true,
      },
    });

    // Calculate total males and females
    let totalLakiLaki = 0;
    let totalPerempuan = 0;

    // Process KepalaKeluarga gender counts
    kepalaKeluargaByGender.forEach((item) => {
      if (item.jenis_kelamin.toLowerCase() === 'laki-laki') {
        totalLakiLaki += item._count.jenis_kelamin;
      } else if (item.jenis_kelamin.toLowerCase() === 'perempuan') {
        totalPerempuan += item._count.jenis_kelamin;
      }
    });

    // Process AnggotaKeluarga gender counts
    anggotaKeluargaByGender.forEach((item) => {
      if (item.jenis_kelamin.toLowerCase() === 'laki-laki') {
        totalLakiLaki += item._count.jenis_kelamin;
      } else if (item.jenis_kelamin.toLowerCase() === 'perempuan') {
        totalPerempuan += item._count.jenis_kelamin;
      }
    });

    // Total population is sum of KepalaKeluarga and AnggotaKeluarga
    const totalPenduduk = totalKepalaKeluarga + totalAnggotaKeluarga;

    res.status(200).json({
      message: "Statistik penduduk berhasil diambil",
      data: {
        totalPenduduk,
        totalKepalaKeluarga,
        totalLakiLaki,
        totalPerempuan,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  getPopulationStats,
};
