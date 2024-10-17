const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

const CACHE_DURATION = 3600; // Cache for 1 hour (in seconds)

const cacheService = {
  async get(key) {
    console.log("GETTING FROM CACHE", key)
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key, value) {
    console.log("SETTING IN CACHE", key, value)
    await redisClient.set(key, JSON.stringify(value), 'EX', CACHE_DURATION);
  },

  async del(key) {
    console.log("DELETING FROM CACHE", key)
    await redisClient.del(key);
  }
};

module.exports = cacheService;
