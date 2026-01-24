const failedAttempts = {};

const THRESHOLD = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function recordFailure(key) {
  const now = Date.now();

  if (!failedAttempts[key]) {
    failedAttempts[key] = [];
  }

  failedAttempts[key] = failedAttempts[key].filter(
    t => now - t < WINDOW_MS
  );

  failedAttempts[key].push(now);

  return failedAttempts[key].length >= THRESHOLD;
}

module.exports = { recordFailure };
