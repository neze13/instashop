const constants = {
    RATE_LIMITER: {
        LOGIN: {
            //The maximum number of failed requests to allow during the window before rate limiting the client
            MAX_FAILED_REQUESTS: 5,
            //Time frame for which requests are checked/remembered
            WINDOW_MS: 900000 // ms | 900000 ms equals to 15 min
        }
    }
};
module.exports = constants;

