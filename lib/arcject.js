// lib/rate-limiter.js

// Storage for rate limiting data
const rateLimitStore = new Map();

/**
 * Simple in-memory rate limiter
 * @param {string} userId - User identifier
 * @param {number} maxRequests - Maximum requests allowed in the time window
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Object} Result indicating if request is allowed
 */
export async function checkRateLimit(userId, maxRequests = 10, windowSeconds =3600) {
  if (!userId) return { allowed: true };
  
  const key = `ratelimit:${userId}`;
  const now = Date.now();
  
  // Get or create record
  let record = rateLimitStore.get(key) || { count: 0, reset: now + (windowSeconds * 1000) };
  
  // If the window has expired, reset the counter
  if (now > record.reset) {
    record = { count: 0, reset: now + (windowSeconds * 1000) };
  }
  
  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return { 
      allowed: false, 
      reason: 'RATE_LIMIT', 
      message: 'Too many requests. Try again later.',
      retryAfter: Math.ceil((record.reset - now) / 1000) // seconds until reset
    };
  }
  
  // Increment count and store
  record.count += 1;
  rateLimitStore.set(key, record);
  
  // Clean up old records periodically (optional)
  setTimeout(() => {
    if (rateLimitStore.has(key) && now > rateLimitStore.get(key).reset) {
      rateLimitStore.delete(key);
    }
  }, windowSeconds * 1000);
  
  return { allowed: true };
}