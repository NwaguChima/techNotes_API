const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc    Get all users
// @route   GET /users
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

// @desc    Create new user
// @route   POST /users
// @access  Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const hashedPwd = await bcrypt.hash(password, 10);

  const userObject = { username, password: hashedPwd, roles };

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data recieved" });
  }
});

// @desc   Update a user
// @route  PATCH /users/:id
// @access Private
const updateUser = asyncHandler(async (req, res) => {});

// @desc   Delete a user
// @route  DELETE /users/:id
// @access Private
const deleteUser = asyncHandler(async (req, res) => {});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
