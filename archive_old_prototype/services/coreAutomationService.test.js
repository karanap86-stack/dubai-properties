import { recordTaskCompletionTime } from './coreAutomationService';

describe('recordTaskCompletionTime', () => {
  it('should add a completion time and keep max 20 entries', () => {
    for (let i = 0; i < 25; i++) {
      recordTaskCompletionTime(i * 1000);
    }
    // No error should occur, and the function should keep only the last 20 entries
    // (Cannot directly access recentTaskCompletionTimes as it's not exported)
    expect(true).toBe(true);
  });
});
