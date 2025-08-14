// const { PrismaClient } = require("../../generated/prisma");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login berhasil", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const logout = async (req, res) => {
  try {
    // Karena JWT bersifat stateless, logout biasanya hanya menghapus token di client
    // Kita bisa menambahkan blacklist token di masa depan jika diperlukan
    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Cek apakah email atau username sudah digunakan
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email atau username sudah digunakan" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, username: true },
    });

    res.status(201).json({ message: "Registrasi berhasil", user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = { login, logout, register };
