import { createClient } from 'redis';

let redisClient = null;

function createInMemoryRedisStub() {
  const kv = new Map();
  const hashes = new Map();

  return {
    // Lifecycle
    connect: async () => {},
    quit: async () => {},

    // Basic commands
    ping: async () => 'PONG',
    get: async (key) => {
      const v = kv.get(String(key));
      return v === undefined ? null : v;
    },
    set: async (key, value) => {
      kv.set(String(key), String(value));
      return 'OK';
    },
    del: async (key) => {
      return kv.delete(String(key)) ? 1 : 0;
    },
    expire: async (key, seconds) => {
      // no-op for in-memory stub
      return 1;
    },

    // Hash commands (hget/hset)
    hget: async (hash, field) => {
      const m = hashes.get(String(hash));
      if (!m) return null;
      const val = m.get(String(field));
      return val === undefined ? null : val;
    },
    hset: async (hash, field, value) => {
      let m = hashes.get(String(hash));
      if (!m) {
        m = new Map();
        hashes.set(String(hash), m);
      }
      m.set(String(field), String(value));
      return 1;
    },

    // Pub/Sub & other no-ops
    publish: async () => 0,
    subscribe: async () => {},
    on: () => {},
  };
}

export async function initializeRedis() {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    // Try real Redis client first
    redisClient = createClient({ url });
    // If connection fails this will throw and we'll fall back
    await redisClient.connect();
    console.log('✓ Redis connected');
    return redisClient;
  } catch (error) {
    // If we are in production, fail fast — Redis is a critical dependency.
    if (process.env.NODE_ENV === 'production') {
      console.error('Redis connection failed:', error?.message || error);
      throw error;
    }

    // Development fallback: use an in-memory stub so the app can run without Docker.
    console.warn('⚠️ Redis not available, using in-memory fallback for development. Some features (queues, pub/sub) will be disabled.');
    redisClient = createInMemoryRedisStub();
    return redisClient;
  }
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis not initialized');
  }
  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit?.();
    } catch (e) {
      // ignore
    }
    redisClient = null;
  }
}
