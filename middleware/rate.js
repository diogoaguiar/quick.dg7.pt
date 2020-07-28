'use strict';

const rateLimit = require('express-rate-limit');

// Rate Limit: 10 per hour
const rate = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Quota limit exceeded',
    skipFailedRequests: true
});

module.exports = rate;