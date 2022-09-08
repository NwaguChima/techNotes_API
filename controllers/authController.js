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

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10s" }
  );

  const refreshToken = jwt.sign(
    {
      username: foundUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  // Create and secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // accessible only by web server
    secure: true, // only accessible over https
    sameSite: "None", // cross-site request forgery
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expirey set to match refresh token
  });

  res.json({
    accessToken,
  });
});

const refresh = asyncHandler(async (req, res, next) => {});

const logoout = asyncHandler(async (req, res, next) => {});
