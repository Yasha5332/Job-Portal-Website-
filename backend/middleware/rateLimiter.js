// middleware/rateLimiter.js
const redis = require('redis');

// Initialize Redis client
const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

const rateLimiter = async (req, res, next) => {
  const ip = req.ip;
  const limit = 5; // Max 5 requests
  const window = 60; // per 60 seconds

  try {
    const requests = await redisClient.incr(ip);
    
    if (requests === 1) {
      await redisClient.expire(ip, window);
    }

    if (requests > limit) {
      return res.status(429).json({ message: 'Too many requests, please try again later.' });
    }
    next();
  } catch (error) {
    next(); // Fallback in case Redis is down
  }
};

module.exports = rateLimiter;