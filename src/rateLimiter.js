
// Clean memory
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now - entry.startTime > 10 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

