// src/redis-sync.js
import Redis from 'ioredis';
import { RadixTree } from './radix.js';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error('REDIS_URL is not defined in .env');

const redis = new Redis(redisUrl);
const pub = new Redis(redisUrl);   // separate connection for publishing
const sub = new Redis(redisUrl);   // separate connection for subscribing

const TREE_CHANNEL = 'autocomplete_updates';

/**
 * Load all existing counts from Redis and populate the radix tree.
 */
export async function loadInitialCounts(tree) {
  const keys = await redis.keys('*');
  if (keys.length === 0) return;

  const counts = await redis.mget(keys);
  keys.forEach((key, i) => {
    const count = parseInt(counts[i], 10) || 0;
    if (count > 0) {
      // Insert the phrase multiple times to set the count
      for (let j = 0; j < count; j++) {
        tree.insert(key);
      }
    }
  });
}

/**
 * Increment a phrase in both the local tree and Redis, then publish the update.
 */
export async function incrementPhrase(tree, phrase) {
  // Update local tree
  tree.insert(phrase);

  // Increment in Redis
  const newCount = await redis.incr(phrase);

  // Publish to other subscribers
  await pub.publish(TREE_CHANNEL, JSON.stringify({ phrase, newCount }));

  return newCount;
}

/**
 * Subscribe to Redis channel and update the local tree on messages.
 */
export function subscribeUpdates(tree) {
  sub.subscribe(TREE_CHANNEL, (err) => {
    if (err) console.error('Failed to subscribe to Redis channel', err);
  });

  sub.on('message', (channel, message) => {
    if (channel !== TREE_CHANNEL) return;
    try {
      const { phrase, newCount } = JSON.parse(message);
      // Sync local tree to the latest count
      const nodeInfo = tree._traverseToPrefix(tree.root, phrase);
      if (nodeInfo && nodeInfo.node) {
        nodeInfo.node.count = newCount;
      } else {
        // Phrase not in tree yet, insert
        for (let i = 0; i < newCount; i++) {
          tree.insert(phrase);
        }
      }
    } catch (e) {
      console.error('Failed to parse Redis message:', message, e);
    }
  });
}

export { redis };
