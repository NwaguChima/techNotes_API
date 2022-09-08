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
    { expiresIn: "1m" }
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

const refresh = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies.jwt) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err)
        return res.status(403).send({
          message: "Forbidden",
        });

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser) {
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
        { expiresIn: "1m" }
      );

      res.json({
        accessToken,
      });
    })
  );
});

const logout = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No Content

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.json({
    message: "Cookie cleared",
  });
});

module.exports = {
  login,
  refresh,
  logout,
};
