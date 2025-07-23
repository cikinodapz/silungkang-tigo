const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const createUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, username: true },
    });

    res.status(201).json({ message: "User berhasil dibuat", user });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, username: true },
    });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },  // No need to parse UUID as integer
      select: { id: true, name: true, email: true, username: true },
    });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const updateData = { name, email, username };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },  // Remove parseInt for UUID
      data: updateData,
      select: { id: true, name: true, email: true, username: true },
    });
    res.json({ message: "User berhasil diperbarui", user });
  } catch (error) {
    console.error("Update user error:", error);
    if (error.code === 'P2025') {  // Prisma error code for record not found
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.status(400).json({ message: "Terjadi kesalahan" });
  }
};

const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(400).json({ message: "Terjadi kesalahan" });
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
