export const isSpam = (message: string): boolean => {
  // Anti-Spam Protection
  // 1. Block Links (http, https, www, .com, .net, etc)
  const linkRegex = /((https?:\/\/)|(www\.))[^\s]+|\.[a-z]{2,}(\/[^\s]*)?/i;
  
  // 2. Block Phone Numbers (basic check for consecutive digits that look like a phone number)
  const phoneRegex = /\b\d{7,15}\b/g;

  if (linkRegex.test(message)) {
    return true;
  }

  if (phoneRegex.test(message)) {
    return true;
  }

  return false;
};

export const generateMathChallenge = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return {
    question: `What is ${num1} + ${num2}?`,
    answer: (num1 + num2).toString()
  };
};

export class RateLimiter {
  private timestamps: number[] = [];
  private limit: number;
  private timeWindow: number;

  constructor(limit = 4, timeWindow = 5000) {
    this.limit = limit; // Messages
    this.timeWindow = timeWindow; // Milliseconds
  }

  public checkLimit(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(ts => now - ts < this.timeWindow);
    
    if (this.timestamps.length >= this.limit) {
      return false; // Rate limit exceeded (Spam)
    }

    this.timestamps.push(now);
    return true;
  }
}
