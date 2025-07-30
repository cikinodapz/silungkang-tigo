const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

const createKepalaKeluarga = async (req, res) => {
  try {
    const {
      nik,
      nama,
      no_akta_kelahiran,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      golongan_darah,
      agama,
      status_perkawinan,
      pendidikan_akhir,
      pekerjaan,
      nama_ayah,
      nama_ibu,
      kkId,
    } = req.body;

    // Validasi field wajib
    if (!nik) {
      return res.status(400).json({ message: "NIK harus diisi" });
    }
    if (!kkId) {
      return res.status(400).json({ message: "ID KK harus diisi" });
    }

    // Validasi NIK unik
    const existingNik = await prisma.kepalaKeluarga.findUnique({
      where: { nik: nik.toString() }, // Pastikan nik berupa string
    });
    if (existingNik) {
      return res.status(400).json({ message: "NIK sudah terdaftar" });
    }

    // Validasi bahwa KK belum memiliki kepala keluarga
    const existingKK = await prisma.kK.findUnique({
      where: { id: kkId },
      select: { kepalaKeluargaId: true },
    });

    if (!existingKK) {
      return res.status(404).json({ message: "KK tidak ditemukan" });
    }

    if (existingKK.kepalaKeluargaId) {
      return res
        .status(400)
        .json({ message: "KK sudah memiliki kepala keluarga" });
    }

    // Dapatkan path file yang diupload
    const files = req.files;
    const scan_ktp = files?.scan_ktp?.[0]
      ? `/uploads/ktp/${files.scan_ktp[0].filename}`
      : null;
    const scan_kk = files?.scan_kk?.[0]
      ? `/uploads/kk/${files.scan_kk[0].filename}`
      : null;
    const scan_akta_lahir = files?.scan_akta_lahir?.[0]
      ? `/uploads/akta/${files.scan_akta_lahir[0].filename}`
      : null;
    const scan_buku_nikah = files?.scan_buku_nikah?.[0]
      ? `/uploads/nikah/${files.scan_buku_nikah[0].filename}`
      : null;

    // Buat data kepala keluarga
    const kepalaKeluarga = await prisma.kepalaKeluarga.create({
      data: {
        nik: nik.toString(), // Pastikan nik berupa string
        nama,
        no_akta_kelahiran,
        jenis_kelamin,
        tempat_lahir,
        tanggal_lahir: new Date(tanggal_lahir),
        golongan_darah,
        agama,
        status_perkawinan,
        pendidikan_akhir,
        pekerjaan,
        nama_ayah,
        nama_ibu,
        scan_ktp,
        scan_kk,
        scan_akta_lahir,
        scan_buku_nikah,
        kk: { connect: { id: kkId } },
      },
    });

    // Update KK untuk merujuk ke kepala keluarga ini
    await prisma.kK.update({
      where: { id: kkId },
      data: { kepalaKeluargaId: kepalaKeluarga.id },
    });

    res.status(201).json({
      message: "Kepala keluarga berhasil dibuat",
      data: kepalaKeluarga,
    });
  } catch (error) {
    console.error("Error:", error);

    // Hapus file yang sudah diupload jika terjadi error
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        if (fileArray && fileArray[0]) {
          fs.unlink(fileArray[0].path, (err) => {
            if (err) console.error("Gagal menghapus file:", err);
          });
        }
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllKepalaKeluarga = async (req, res) => {
  try {
    const kepalaKeluargaList = await prisma.kepalaKeluarga.findMany({
      include: {
        kk: true, // jika ingin menampilkan informasi KK yang terhubung
      },
      orderBy: {
        createdAt: "desc", // optional: urut berdasarkan waktu input
      },
    });

    res.status(200).json({
      message: "Data semua kepala keluarga berhasil diambil",
      data: kepalaKeluargaList,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getDetailKepalaKeluarga = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari kepala keluarga berdasarkan ID
    const kepalaKeluarga = await prisma.kepalaKeluarga.findUnique({
      where: { id },
      include: {
        kk: true, // Include related KK data
      },
    });

    // Jika kepala keluarga tidak ditemukan
    if (!kepalaKeluarga) {
      return res
        .status(404)
        .json({ message: "Kepala keluarga tidak ditemukan" });
    }

    res.status(200).json({
      message: "Kepala keluarga berhasil ditemukan",
      kepalaKeluarga,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// UPDATE
const updateKepalaKeluarga = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

    // Dapatkan data lama untuk hapus file jika diupdate
    const oldData = await prisma.kepalaKeluarga.findUnique({ where: { id } });
    if (!oldData) {
      return res
        .status(404)
        .json({ message: "Data kepala keluarga tidak ditemukan" });
    }

    // Handle file upload
    const filePaths = {};
    const filesToDelete = [];

    if (files) {
      if (files.scan_ktp) {
        if (oldData.scan_ktp) filesToDelete.push(oldData.scan_ktp);
        filePaths.scan_ktp = `/uploads/ktp/${files.scan_ktp[0].filename}`;
      }
      if (files.scan_kk) {
        if (oldData.scan_kk) filesToDelete.push(oldData.scan_kk);
        filePaths.scan_kk = `/uploads/kk/${files.scan_kk[0].filename}`;
      }
      if (files.scan_akta_lahir) {
        if (oldData.scan_akta_lahir)
          filesToDelete.push(oldData.scan_akta_lahir);
        filePaths.scan_akta_lahir = `/uploads/akta/${files.scan_akta_lahir[0].filename}`;
      }
      if (files.scan_buku_nikah) {
        if (oldData.scan_buku_nikah)
          filesToDelete.push(oldData.scan_buku_nikah);
        filePaths.scan_buku_nikah = `/uploads/nikah/${files.scan_buku_nikah[0].filename}`;
      }
    }

    // Update data
    const updatedData = await prisma.kepalaKeluarga.update({
      where: { id },
      data: {
        nik: body.nik,
        nama: body.nama,
        no_akta_kelahiran: body.no_akta_kelahiran,
        jenis_kelamin: body.jenis_kelamin,
        tempat_lahir: body.tempat_lahir,
        tanggal_lahir: body.tanggal_lahir
          ? new Date(body.tanggal_lahir)
          : undefined,
        golongan_darah: body.golongan_darah,
        agama: body.agama,
        status_perkawinan: body.status_perkawinan,
        pendidikan_akhir: body.pendidikan_akhir,
        pekerjaan: body.pekerjaan,
        nama_ayah: body.nama_ayah,
        nama_ibu: body.nama_ibu,
        ...filePaths,
      },
    });

    // Hapus file lama jika ada
    filesToDelete.forEach((filePath) => {
      const fullPath = path.join(__dirname, "../../public", filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    res.json({
      message: "Data kepala keluarga berhasil diperbarui",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// DELETE
const deleteKepalaKeluarga = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. HAPUS FILE TERKAIT
    const data = await prisma.kepalaKeluarga.findUnique({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const rootDir = path.join(__dirname, "../../public");
    if (data.scan_ktp) {
      const filePath = path.join(rootDir, data.scan_ktp);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (data.scan_kk) {
      const filePath = path.join(rootDir, data.scan_kk);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (data.scan_akta_lahir) {
      const filePath = path.join(rootDir, data.scan_akta_lahir);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (data.scan_buku_nikah) {
      const filePath = path.join(rootDir, data.scan_buku_nikah);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // 2. HAPUS DATA
    await prisma.kepalaKeluarga.delete({ where: { id } });

    // 3. UPDATE RELASI DI KK
    await prisma.kK.updateMany({
      where: { kepalaKeluargaId: id },
      data: { kepalaKeluargaId: null },
    });

    res.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Gagal menghapus data",
      error: error.message,
    });
  }
};

const createAnggotaKeluarga = async (req, res) => {
  try {
    const {
      nik,
      nama,
      no_akta_kelahiran,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      golongan_darah,
      agama,
      status_hubungan,
      status_perkawinan,
      pendidikan_akhir,
      pekerjaan,
      nama_ayah,
      nama_ibu,
      kkId,
    } = req.body;

    // Validate unique NIK
    const existingNik = await prisma.anggotaKeluarga.findUnique({
      where: { nik },
    });
    if (existingNik) {
      return res.status(400).json({ message: "NIK sudah terdaftar" });
    }

    // Validate KK exists
    const existingKK = await prisma.kK.findUnique({
      where: { id: kkId },
    });
    if (!existingKK) {
      return res.status(400).json({ message: "KK tidak ditemukan" });
    }

    // Get uploaded file paths
    const files = req.files;
    const scan_ktp = files.scan_ktp
      ? `/uploads/ktp/${files.scan_ktp[0].filename}`
      : null;
    const scan_kk = files.scan_kk
      ? `/uploads/kk/${files.scan_kk[0].filename}`
      : null;
    const scan_akta_lahir = files.scan_akta_lahir
      ? `/uploads/akta/${files.scan_akta_lahir[0].filename}`
      : null;
    const scan_buku_nikah = files.scan_buku_nikah
      ? `/uploads/nikah/${files.scan_buku_nikah[0].filename}`
      : null;

    // Create Anggota Keluarga
    const anggotaKeluarga = await prisma.anggotaKeluarga.create({
      data: {
        nik,
        nama,
        no_akta_kelahiran,
        jenis_kelamin,
        tempat_lahir,
        tanggal_lahir: new Date(tanggal_lahir),
        golongan_darah,
        agama,
        status_hubungan,
        status_perkawinan,
        pendidikan_akhir,
        pekerjaan,
        nama_ayah,
        nama_ibu,
        scan_ktp,
        scan_kk,
        scan_akta_lahir,
        scan_buku_nikah,
        kk: { connect: { id: kkId } },
      },
    });

    res.status(201).json({
      message: "Anggota keluarga berhasil dibuat",
      anggotaKeluarga,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Detail Anggota Keluarga
const getAnggotaKeluarga = async (req, res) => {
  try {
    const { id } = req.params;

    const anggotaKeluarga = await prisma.anggotaKeluarga.findUnique({
      where: { id },
      include: { kk: true }, // Include related KK data
    });

    if (!anggotaKeluarga) {
      return res
        .status(404)
        .json({ message: "Anggota keluarga tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail anggota keluarga berhasil diambil",
      anggotaKeluarga,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Edit Anggota Keluarga
const updateAnggotaKeluarga = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nik,
      nama,
      no_akta_kelahiran,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      golongan_darah,
      agama,
      status_hubungan,
      status_perkawinan,
      pendidikan_akhir,
      pekerjaan,
      nama_ayah,
      nama_ibu,
      kkId,
    } = req.body;

    // Check if AnggotaKeluarga exists
    const existingAnggota = await prisma.anggotaKeluarga.findUnique({
      where: { id },
    });
    if (!existingAnggota) {
      return res
        .status(404)
        .json({ message: "Anggota keluarga tidak ditemukan" });
    }

    // Validate unique NIK (if changed)
    if (nik && nik !== existingAnggota.nik) {
      const existingNik = await prisma.anggotaKeluarga.findUnique({
        where: { nik },
      });
      if (existingNik) {
        return res.status(400).json({ message: "NIK sudah terdaftar" });
      }
    }

    // Validate KK exists (if changed)
    if (kkId) {
      const existingKK = await prisma.kK.findUnique({
        where: { id: kkId },
      });
      if (!existingKK) {
        return res.status(400).json({ message: "KK tidak ditemukan" });
      }
    }

    // Get uploaded file paths
    const files = req.files;
    const scan_ktp = files.scan_ktp
      ? `/uploads/ktp/${files.scan_ktp[0].filename}`
      : existingAnggota.scan_ktp;
    const scan_kk = files.scan_kk
      ? `/uploads/kk/${files.scan_kk[0].filename}`
      : existingAnggota.scan_kk;
    const scan_akta_lahir = files.scan_akta_lahir
      ? `/uploads/akta/${files.scan_akta_lahir[0].filename}`
      : existingAnggota.scan_akta_lahir;
    const scan_buku_nikah = files.scan_buku_nikah
      ? `/uploads/nikah/${files.scan_buku_nikah[0].filename}`
      : existingAnggota.scan_buku_nikah;

    // Update Anggota Keluarga
    const updatedAnggotaKeluarga = await prisma.anggotaKeluarga.update({
      where: { id },
      data: {
        nik: nik || existingAnggota.nik,
        nama: nama || existingAnggota.nama,
        no_akta_kelahiran:
          no_akta_kelahiran !== undefined
            ? no_akta_kelahiran
            : existingAnggota.no_akta_kelahiran,
        jenis_kelamin: jenis_kelamin || existingAnggota.jenis_kelamin,
        tempat_lahir: tempat_lahir || existingAnggota.tempat_lahir,
        tanggal_lahir: tanggal_lahir
          ? new Date(tanggal_lahir)
          : existingAnggota.tanggal_lahir,
        golongan_darah:
          golongan_darah !== undefined
            ? golongan_darah
            : existingAnggota.golongan_darah,
        agama: agama || existingAnggota.agama,
        status_hubungan: status_hubungan || existingAnggota.status_hubungan,
        status_perkawinan:
          status_perkawinan || existingAnggota.status_perkawinan,
        pendidikan_akhir: pendidikan_akhir || existingAnggota.pendidikan_akhir,
        pekerjaan: pekerjaan || existingAnggota.pekerjaan,
        nama_ayah: nama_ayah || existingAnggota.nama_ayah,
        nama_ibu: nama_ibu || existingAnggota.nama_ibu,
        scan_ktp,
        scan_kk,
        scan_akta_lahir,
        scan_buku_nikah,
        kk: kkId ? { connect: { id: kkId } } : undefined,
      },
    });

    res.status(200).json({
      message: "Anggota keluarga berhasil diperbarui",
      anggotaKeluarga: updatedAnggotaKeluarga,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Delete Anggota Keluarga
const deleteAnggotaKeluarga = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if AnggotaKeluarga exists
    const anggotaKeluarga = await prisma.anggotaKeluarga.findUnique({
      where: { id },
    });
    if (!anggotaKeluarga) {
      return res
        .status(404)
        .json({ message: "Anggota keluarga tidak ditemukan" });
    }

    // Delete Anggota Keluarga
    await prisma.anggotaKeluarga.delete({
      where: { id },
    });

    res.status(200).json({ message: "Anggota keluarga berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Fungsi untuk melihat file
const getFile = async (req, res) => {
  try {
    const { type, filename } = req.params;

    // Path absolut ke folder 'public/uploads'
    const rootDir = path.resolve(__dirname, "../../../"); // <- dari controllers/pendudukController
    const filePath = path.join(rootDir, "public", "uploads", type, filename);

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
  createKepalaKeluarga,
  getAllKepalaKeluarga,
  getDetailKepalaKeluarga,
  updateKepalaKeluarga,
  deleteKepalaKeluarga,
  createAnggotaKeluarga,
  getAnggotaKeluarga,
  updateAnggotaKeluarga,
  deleteAnggotaKeluarga,
  getFile,
};
