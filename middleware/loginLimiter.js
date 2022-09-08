const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: "Too many login attempts, please try again after 60 seconds",
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too May Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // returns rate limit info in the RatLimit-* headers
  legacyHeaders: true, // disable the x-RateLimit-* headers
});

module.exports = loginLimiter;
