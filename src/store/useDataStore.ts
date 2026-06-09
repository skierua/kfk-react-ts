import { create } from 'zustand';

import type { DbRateType, DbOfferType } from './DbTypes';
import { getData } from '../driver';
// import { subscribe } from '../events';

export interface DataState {
  rates: DbRateType[];
  isRatesLoading: boolean;
  isOffersLoading: boolean;
  offers: DbOfferType[];
  isPubDataLoading: boolean;
  fetchRates: () => Promise<void>;
  fetchOffers: () => Promise<void>;

  fetchPubData: () => Promise<void>;
  startAutoRefresh: (intervalMs: number) => () => void;
  ratesAutoRefresh: (intervalMs: number) => () => void;
  offersAutoRefresh: (intervalMs: number) => () => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  rates: [],
  offers: [],
  error: null,
  setError: (error) => set({ error }),
  isPubDataLoading: false,
  isRatesLoading: false,
  isOffersLoading: false,
  fetchRates: async () => {
    set({ error: null, isRatesLoading: true });
    // const query = cache ? 'reqid=sse' : 'reqid=ssedb';
    try {
      const ratesData = await getData<DbRateType[]>('/rates', 'reqid=sse');
      const sortedRates = [...ratesData]
        // .filter((v) => Number(v.bid) !== 0 || Number(v.ask) !== 0)
        .sort(
          (a, b) =>
            Number(a.sortorder) - Number(b.sortorder) ||
            Number(a.scode) - Number(b.scode) ||
            a.shop.localeCompare(b.shop),
        )
        .map((v): DbRateType => {
          return {
            ...v,
            cqty: Number(v.cqty),
            rqty: Number(v.rqty),
            bid: Number(v.bid),
            ask: Number(v.ask),
            sortorder: Number(v.sortorder),
            domestic: Number(v.domestic),
          };
        }); // console.log('shft=', shft);
      set({ rates: sortedRates, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isRatesLoading: false });
    }
  },

  fetchOffers: async () => {
    set({ error: null, isOffersLoading: true });
    try {
      const offersData = await getData<DbOfferType[]>('/offers', 'reqid=sse');
      set({
        offers: offersData.sort((a, b) => (a.tm < b.tm ? -1 : 1)),
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isOffersLoading: false });
    }
  },

  fetchPubData: async () => {
    if (get().isPubDataLoading) return;
    set({ error: null });
    if (get().offers.length === 0 || get().rates.length === 0) {
      set({ isPubDataLoading: true });
    }
    // console.log('Fetching public data...' + new Date().toLocaleTimeString());
    try {
      const ratesData = await getData<DbRateType[]>('/rates', 'reqid=sse');
      const offersData = await getData<DbOfferType[]>('/offers', 'reqid=sse');

      const sortedRates = [...ratesData]
        // .filter((v) => Number(v.bid) !== 0 || Number(v.ask) !== 0)
        .sort(
          (a, b) =>
            Number(a.sortorder) - Number(b.sortorder) ||
            a.shop.localeCompare(b.shop),
        )
        .map((v): DbRateType => {
          return {
            ...v,
            bid: Number(v.bid),
            ask: Number(v.ask),
            sortorder: Number(v.sortorder),
            domestic: Number(v.domestic),
          };
        }); // console.log('shft=', shft);

      set({
        rates: sortedRates,
        offers: offersData.sort((a, b) => (a.tm < b.tm ? -1 : 1)),
        isPubDataLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message, isPubDataLoading: false });
    }
  },

  ratesAutoRefresh: (intervalMs) => {
    // console.log('intervalMs=', intervalMs);
    const runRefresh = () => {
      if (document.visibilityState === 'visible') {
        get().fetchRates();
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

  offersAutoRefresh: (intervalMs) => {
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

  startAutoRefresh: (intervalMs) => {
    // console.log('intervalMs=', intervalMs);
    const runRefresh = () => {
      if (document.visibilityState === 'visible') {
        get().fetchPubData();
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
