const User = require("../models/User");
const Note = require("../models/Note");
const bcrypt = require("bcrypt");

// @desc    Get all users
// @route   GET /users
// @access  Private
const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
};

// @desc    Create new user
// @route   POST /users
// @access  Private
const createNewUser = async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await User.findOne({ username })
    .collation({
      locale: "en",
      strength: 2,
    })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const hashedPwd = await bcrypt.hash(password, 10);

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? {
          username,
          password: hashedPwd,
        }
      : {
          username,
          password: hashedPwd,
          roles,
        };

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data recieved" });
  }
};

// @desc   Update a user
// @route  PATCH /users/:id
// @access Private
const updateUser = async (req, res) => {
  const { id, username, password, roles, active } = req.body;

  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const duplicate = await User.findOne({ username })
    .collation({
      locale: "en",
      strength: 2,
    })
    .lean()
    .exec();
  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Username already exists" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    const hashedPwd = await bcrypt.hash(password, 10);
    user.password = hashedPwd;
  }

  const updatedUser = await user.save();

  res.json({ message: `User ${updatedUser.username} updated` });
};

// @desc   Delete a user
// @route  DELETE /users/:id
// @access Private
const deleteUser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
