import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_PRAYERS_KEY = 'guest_prayers';

export type GuestPrayer = {
  id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  organization_id: null;
  user_id: string; // 'guest'
  prayer_count: number;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
};

export const GuestStorage = {
  async getPrayers(): Promise<GuestPrayer[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(GUEST_PRAYERS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading guest prayers', e);
      return [];
    }
  },

  async savePrayer(content: string, isAnonymous: boolean): Promise<GuestPrayer> {
    const newPrayer: GuestPrayer = {
      id: 'guest-' + Date.now(),
      content,
      is_anonymous: isAnonymous,
      created_at: new Date().toISOString(),
      organization_id: null,
      user_id: 'guest',
      prayer_count: 0,
      profiles: {
        full_name: 'Guest',
        avatar_url: '', // TODO: Add a default guest avatar or placeholder
      },
    };

    try {
      const existingPrayers = await this.getPrayers();
      const updatedPrayers = [newPrayer, ...existingPrayers];
      await AsyncStorage.setItem(GUEST_PRAYERS_KEY, JSON.stringify(updatedPrayers));
      return newPrayer;
    } catch (e) {
      console.error('Error saving guest prayer', e);
      throw e;
    }
  },

  async clearPrayers() {
    try {
        await AsyncStorage.removeItem(GUEST_PRAYERS_KEY);
    } catch (e) {
        console.error('Error clearing guest prayers', e);
    }
  }
};
