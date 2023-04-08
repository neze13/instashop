const rateLimit = require('express-rate-limit');
const constants = require('../../constants');
const { MAX_FAILED_REQUESTS, WINDOW_MS } = constants.RATE_LIMITER.LOGIN;

// setup rate limiter for login endpoint
const loginRateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: MAX_FAILED_REQUESTS,
    keyGenerator: req => {
        return req.body.username;
    },
    skipSuccessfulRequests: true,
    handler: (_, res) => {
        res.status(429).json({
            code: Parse.Error.REQUEST_LIMIT_EXCEEDED,
            error: {
                message: 'Too many requests, please try again later.',
            },
        });
    },
});
module.exports = loginRateLimiter;
