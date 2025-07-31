const { PrismaClient } = require("@prisma/client");
const { get } = require("../../routes");
const prisma = new PrismaClient();

const getResidents = async (req, res) => {
  try {
    // Fetch data from KepalaKeluarga
    const kepalaKeluarga = await prisma.kepalaKeluarga.findMany({
      select: {
        nama: true,
        nik: true,
      },
    });

    // Fetch data from AnggotaKeluarga
    const anggotaKeluarga = await prisma.anggotaKeluarga.findMany({
      select: {
        nama: true,
        nik: true,
      },
    });

    // Combine the results
    const residents = [
      ...kepalaKeluarga.map((kepala) => ({
        nama: kepala.nama,
        nik: kepala.nik,
      })),
      ...anggotaKeluarga.map((anggota) => ({
        nama: anggota.nama,
        nik: anggota.nik,
      })),
    ];

    // Remove duplicates based on NIK (just in case)
    const uniqueResidents = Array.from(
      new Map(residents.map((item) => [item.nik, item])).values()
    );

    // Sort by name for better UX
    uniqueResidents.sort((a, b) => a.nama.localeCompare(b.nama));

    res.status(200).json({
      message: "Data penduduk berhasil diambil",
      residents: uniqueResidents,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const createLahirMasuk = async (req, res) => {
  try {
    const { nama, nik, tanggal_lahir_masuk, alamat_sebelumnya, kkId } =
      req.body;

    if (!nama || !nik || !tanggal_lahir_masuk) {
      return res
        .status(400)
        .json({ message: "Nama, NIK, dan tanggal lahir/masuk harus diisi" });
    }

    const existingNIK = await prisma.lahirMasuk.findUnique({
      where: { nik },
    });
    if (existingNIK) {
      return res.status(400).json({ message: "NIK sudah terdaftar" });
    }

    if (kkId) {
      const existingKK = await prisma.kK.findUnique({
        where: { id: kkId },
      });
      if (!existingKK) {
        return res.status(400).json({ message: "KK tidak ditemukan" });
      }
    }

    const lahirMasuk = await prisma.lahirMasuk.create({
      data: {
        nama,
        nik,
        tanggal_lahir_masuk: new Date(tanggal_lahir_masuk),
        alamat_sebelumnya,
        kk: kkId ? { connect: { id: kkId } } : undefined,
      },
    });

    res.status(201).json({
      message: "Data lahir/masuk berhasil dibuat",
      lahirMasuk,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllLahirMasuk = async (req, res) => {
  try {
    const data = await prisma.lahirMasuk.findMany({
      include: {
        kk: {
          include: {
            kepalaKeluarga: {
              select: {
                id: true,
                nama: true, // Only include the id and nama fields
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Sort by newest first (optional)
      },
    });

    res.status(200).json({
      message: "Berhasil mengambil semua data lahir/masuk",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getLahirMasuk = async (req, res) => {
  try {
    const { id } = req.params;

    const lahirMasuk = await prisma.lahirMasuk.findUnique({
      where: { id },
      include: { kk: true },
    });

    if (!lahirMasuk) {
      return res
        .status(404)
        .json({ message: "Data lahir/masuk tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail lahir/masuk berhasil diambil",
      lahirMasuk,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateLahirMasuk = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nik, tanggal_lahir_masuk, alamat_sebelumnya, kkId } =
      req.body;

    const existingLahirMasuk = await prisma.lahirMasuk.findUnique({
      where: { id },
    });
    if (!existingLahirMasuk) {
      return res
        .status(404)
        .json({ message: "Data lahir/masuk tidak ditemukan" });
    }

    if (nik && nik !== existingLahirMasuk.nik) {
      const duplicateNIK = await prisma.lahirMasuk.findUnique({
        where: { nik },
      });
      if (duplicateNIK) {
        return res.status(400).json({ message: "NIK sudah terdaftar" });
      }
    }

    if (kkId && kkId !== existingLahirMasuk.kkId) {
      const existingKK = await prisma.kK.findUnique({
        where: { id: kkId },
      });
      if (!existingKK) {
        return res.status(400).json({ message: "KK tidak ditemukan" });
      }
    }

    const updatedLahirMasuk = await prisma.lahirMasuk.update({
      where: { id },
      data: {
        nama: nama || existingLahirMasuk.nama,
        nik: nik || existingLahirMasuk.nik,
        tanggal_lahir_masuk: tanggal_lahir_masuk
          ? new Date(tanggal_lahir_masuk)
          : existingLahirMasuk.tanggal_lahir_masuk,
        alamat_sebelumnya:
          alamat_sebelumnya !== undefined
            ? alamat_sebelumnya
            : existingLahirMasuk.alamat_sebelumnya,
        kk:
          kkId !== undefined
            ? { connect: { id: kkId } }
            : existingLahirMasuk.kkId
            ? undefined
            : { disconnect: true },
      },
    });

    res.status(200).json({
      message: "Data lahir/masuk berhasil diperbarui",
      lahirMasuk: updatedLahirMasuk,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteLahirMasuk = async (req, res) => {
  try {
    const { id } = req.params;

    const lahirMasuk = await prisma.lahirMasuk.findUnique({
      where: { id },
    });
    if (!lahirMasuk) {
      return res
        .status(404)
        .json({ message: "Data lahir/masuk tidak ditemukan" });
    }

    await prisma.lahirMasuk.delete({
      where: { id },
    });

    res.status(200).json({ message: "Data lahir/masuk berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const createMeninggal = async (req, res) => {
  try {
    const { nama, nik, tanggal_meninggal, alamat_meninggal, kkId } = req.body;

    if (!nama || !nik || !tanggal_meninggal || !alamat_meninggal) {
      return res
        .status(400)
        .json({
          message:
            "Nama, NIK, tanggal meninggal, dan alamat meninggal harus diisi",
        });
    }

    const existingNIK = await prisma.meninggal.findUnique({
      where: { nik },
    });
    if (existingNIK) {
      return res.status(400).json({ message: "NIK sudah terdaftar" });
    }

    if (kkId) {
      const existingKK = await prisma.kK.findUnique({
        where: { id: kkId },
      });
      if (!existingKK) {
        return res.status(400).json({ message: "KK tidak ditemukan" });
      }
    }

    const meninggal = await prisma.meninggal.create({
      data: {
        nama,
        nik,
        tanggal_meninggal: new Date(tanggal_meninggal),
        alamat_meninggal,
        kk: kkId ? { connect: { id: kkId } } : undefined,
      },
    });

    res.status(201).json({
      message: "Data meninggal berhasil dibuat",
      meninggal,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllMeninggal = async (req, res) => {
  try {
    const data = await prisma.meninggal.findMany({
      include: {
        kk: {
          include: {
            kepalaKeluarga: {
              select: {
                id: true,
                nama: true, // Only include the id and nama fields
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Sort by newest first
      },
    });

    res.status(200).json({
      message: "Berhasil mengambil semua data meninggal",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getMeninggal = async (req, res) => {
  try {
    const { id } = req.params;

    const meninggal = await prisma.meninggal.findUnique({
      where: { id },
      include: { kk: true },
    });

    if (!meninggal) {
      return res
        .status(404)
        .json({ message: "Data meninggal tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail meninggal berhasil diambil",
      meninggal,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateMeninggal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nik, tanggal_meninggal, alamat_meninggal, kkId } = req.body;

    const existingMeninggal = await prisma.meninggal.findUnique({
      where: { id },
    });
    if (!existingMeninggal) {
      return res
        .status(404)
        .json({ message: "Data meninggal tidak ditemukan" });
    }

    if (nik && nik !== existingMeninggal.nik) {
      const duplicateNIK = await prisma.meninggal.findUnique({
        where: { nik },
      });
      if (duplicateNIK) {
        return res.status(400).json({ message: "NIK sudah terdaftar" });
      }
    }

    if (kkId && kkId !== existingMeninggal.kkId) {
      const existingKK = await prisma.kK.findUnique({
        where: { id: kkId },
      });
      if (!existingKK) {
        return res.status(400).json({ message: "KK tidak ditemukan" });
      }
    }

    const updatedMeninggal = await prisma.meninggal.update({
      where: { id },
      data: {
        nama: nama || existingMeninggal.nama,
        nik: nik || existingMeninggal.nik,
        tanggal_meninggal: tanggal_meninggal
          ? new Date(tanggal_meninggal)
          : existingMeninggal.tanggal_meninggal,
        alamat_meninggal:
          alamat_meninggal || existingMeninggal.alamat_meninggal,
        kk:
          kkId !== undefined
            ? { connect: { id: kkId } }
            : existingMeninggal.kkId
            ? undefined
            : { disconnect: true },
      },
    });

    res.status(200).json({
      message: "Data meninggal berhasil diperbarui",
      meninggal: updatedMeninggal,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteMeninggal = async (req, res) => {
  try {
    const { id } = req.params;

    const meninggal = await prisma.meninggal.findUnique({
      where: { id },
    });
    if (!meninggal) {
      return res
        .status(404)
        .json({ message: "Data meninggal tidak ditemukan" });
    }

    await prisma.meninggal.delete({
      where: { id },
    });

    res.status(200).json({ message: "Data meninggal berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const createPindahKeluar = async (req, res) => {
  try {
    const { nama, nik, tanggal_pindah, alamat_tujuan, kkId } = req.body;

    if (!nama || !nik || !tanggal_pindah || !alamat_tujuan) {
      return res
        .status(400)
        .json({
          message: "Nama, NIK, tanggal pindah, dan alamat tujuan harus diisi",
        });
    }

    const existingNIK = await prisma.pindahKeluar.findUnique({
      where: { nik },
    });
    if (existingNIK) {
      return res.status(400).json({ message: "NIK sudah terdaftar" });
    }

    if (kkId) {
      const existingKK = await prisma.kK.findUnique({
        where: { id: kkId },
      });
      if (!existingKK) {
        return res.status(400).json({ message: "KK tidak ditemukan" });
      }
    }

    const pindahKeluar = await prisma.pindahKeluar.create({
      data: {
        nama,
        nik,
        tanggal_pindah: new Date(tanggal_pindah),
        alamat_tujuan,
        kk: kkId ? { connect: { id: kkId } } : undefined,
      },
    });

    res.status(201).json({
      message: "Data pindah/keluar berhasil dibuat",
      pindahKeluar,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllPindahKeluar = async (req, res) => {
  try {
    const data = await prisma.pindahKeluar.findMany({
      include: {
        kk: {
          include: {
            kepalaKeluarga: {
              select: {
                id: true,
                nama: true, // Only include the id and nama fields
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Berhasil mengambil semua data pindah keluar",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getPindahKeluar = async (req, res) => {
  try {
    const { id } = req.params;

    const pindahKeluar = await prisma.pindahKeluar.findUnique({
      where: { id },
      include: { kk: true },
    });

    if (!pindahKeluar) {
      return res
        .status(404)
        .json({ message: "Data pindah/keluar tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail pindah/keluar berhasil diambil",
      pindahKeluar,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updatePindahKeluar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nik, tanggal_pindah, alamat_tujuan, kkId } = req.body;

    const existingPindahKeluar = await prisma.pindahKeluar.findUnique({
      where: { id },
    });
    if (!existingPindahKeluar) {
      return res
        .status(404)
        .json({ message: "Data pindah/keluar tidak ditemukan" });
    }

    if (nik && nik !== existingPindahKeluar.nik) {
      const duplicateNIK = await prisma.pindahKeluar.findUnique({
        where: { nik },
      });
      if (duplicateNIK) {
        return res.status(400).json({ message: "NIK sudah terdaftar" });
      }
    }

    if (kkId && kkId !== existingPindahKeluar.kkId) {
      const existingKK = await prisma.kK.findUnique({
        where: { id: kkId },
      });
      if (!existingKK) {
        return res.status(400).json({ message: "KK tidak ditemukan" });
      }
    }

    const updatedPindahKeluar = await prisma.pindahKeluar.update({
      where: { id },
      data: {
        nama: nama || existingPindahKeluar.nama,
        nik: nik || existingPindahKeluar.nik,
        tanggal_pindah: tanggal_pindah
          ? new Date(tanggal_pindah)
          : existingPindahKeluar.tanggal_pindah,
        alamat_tujuan: alamat_tujuan || existingPindahKeluar.alamat_tujuan,
        kk:
          kkId !== undefined
            ? { connect: { id: kkId } }
            : existingPindahKeluar.kkId
            ? undefined
            : { disconnect: true },
      },
    });

    res.status(200).json({
      message: "Data pindah/keluar berhasil diperbarui",
      pindahKeluar: updatedPindahKeluar,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deletePindahKeluar = async (req, res) => {
  try {
    const { id } = req.params;

    const pindahKeluar = await prisma.pindahKeluar.findUnique({
      where: { id },
    });
    if (!pindahKeluar) {
      return res
        .status(404)
        .json({ message: "Data pindah/keluar tidak ditemukan" });
    }

    await prisma.pindahKeluar.delete({
      where: { id },
    });

    res.status(200).json({ message: "Data pindah/keluar berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  getResidents,
  createLahirMasuk,
  getAllLahirMasuk,
  getLahirMasuk,
  updateLahirMasuk,
  deleteLahirMasuk,
  createMeninggal,
  getAllMeninggal,
  getMeninggal,
  updateMeninggal,
  deleteMeninggal,
  createPindahKeluar,
  getAllPindahKeluar,
  getPindahKeluar,
  updatePindahKeluar,
  deletePindahKeluar,
};
