export const safeStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage getItem error:', e);
      return null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage setItem error:', e);
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage removeItem error:', e);
    }
  }
};
