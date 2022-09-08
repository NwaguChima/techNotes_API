const User = require("../models/User");
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      message: "All fields are required",
    });
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }

  const match = await bycrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }
});

const refresh = asyncHandler(async (req, res, next) => {});

const logoout = asyncHandler(async (req, res, next) => {});
