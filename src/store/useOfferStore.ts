import { create } from 'zustand';
import { getData, postData } from '../driver';

interface DbOfferType {
  id: number; // "6925"
  shop: string; // "BULK"
  curid: string; // "840"
  bidask: string; // "bid"
  amnt: string; // ""3000"
  price: string; // "43.65"
  tel: string; // "(096)001-3600"
  note: string; // "$100 синій"
  tm: string; // "2026-04-15T15:39:19.670Z"
}

export interface OfferState {
  offers: any[];
  fetchOffers: () => Promise<void>;
  submit: (data: any) => Promise<boolean>;
  error: string | null;
  setError: (error: string | null) => void;
  isLoading: boolean;
  autoRefresh: (intervalMs: number) => () => void;
}

export const useOfferStore = create<OfferState>((set, get) => ({
  offers: [],
  error: null,
  isLoading: false,
  setError: (error) => set({ error }),

  fetchOffers: async () => {
    // console.log('Fetching offers...');
    if (get().isLoading) return; // Prevent multiple simultaneous fetches
    set({ error: null, isLoading: true });
    try {
      const raw = await getData<DbOfferType[]>('/offers', 'reqid=sel');
      //   sort((a, b) => (a.tm < b.tm ? -1 : 1))
      const offersData = raw.sort((a, b) => a.tm.localeCompare(b.tm));
      //     .map((v): DbOfferType => {
      //       return {
      //         ...v,
      //         id: Number(v.id),
      //         // amnt: Number(v.amnt),
      //       };
      //     });
      // console.log('Fetched offers:', offersData);
      set({
        offers: offersData,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },
  submit: async (data: any): Promise<boolean> => {
    try {
      await postData<any>('/offers', JSON.stringify(data));
      await get().fetchOffers();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Помилка при збереженні пропозиції!';
      console.error('Error submitting offer:', errorMessage);
      set({ error: errorMessage });
      return false;
    }
  },

  autoRefresh: (intervalMs) => {
    // console.log('intervalMs=', intervalMs);
    const runRefresh = () => {
      if (document.visibilityState === 'visible') {
        get().fetchOffers();
      }
    };

    const timer = setInterval(runRefresh, intervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  },
}));
