import { create } from 'zustand';
import { getData, postData } from '../driver';

interface DbDataType {
  shop: string;
  atclcode: string;
  scode: string;
  qty: number;
  bid: number;
  bidtm: string;
  ask: number;
  asktm: string;
  pricecode: string;
}

export interface DbRateRecord {
  shop: string;
  atclcode: string;
  scode: string;
  pricecode: string;
  qty: string | number;
  bid: string;
  ask: string;
  tm: string;
}

export interface RateState {
  dataset: DbDataType[];
  fetchDataset: (shop?: string | null) => Promise<void>;
  submit: (data: DbRateRecord[]) => Promise<boolean>;
  error: string | null;
  setError: (error: string | null) => void;
  isLoading: boolean;
  autoRefresh: (intervalMs: number, shop?: string | null) => () => void;
}

export const useRateStore = create<RateState>((set, get) => ({
  dataset: [],
  error: null,
  isLoading: false,
  setError: (error) => set({ error }),

  fetchDataset: async (shop) => {
    if (get().isLoading) return; // Prevent multiple simultaneous fetches
    set({ error: null, isLoading: true });
    try {
      const shopQuery = shop ? `&shop=${shop}` : '';
      //   console.log('Fetching dataset for shop:', shopQuery);
      const raw = await getData<DbDataType[]>(
        '/rates',
        `reqid=sel${shopQuery}`,
      );
      const ratesData = raw.map((v): DbDataType => {
        return {
          ...v,
          qty: Number(v.qty),
          bid: Number(v.bid),
          ask: Number(v.ask),
        };
      });
      set({
        dataset: ratesData,
        error: null,
      });
      // console.log('Fetched dataset:', ratesData); // Log the fetched dataset
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  submit: async (data: DbRateRecord[]): Promise<boolean> => {
    set({ error: null });
    const req = {
      reqid: 'upd',
      rates: data,
    };
    try {
      await postData<any>('/rates', JSON.stringify(req));
      await get().fetchDataset();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Помилка при збереженні курсу!';
      console.error('Error submitting rate:', errorMessage);
      set({ error: errorMessage });
      return false;
    }
  },

  autoRefresh: (intervalMs, shop) => {
    const runRefresh = () => {
      get().fetchDataset(shop);
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
