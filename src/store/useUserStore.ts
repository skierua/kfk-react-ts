import { create } from 'zustand';
import { subscribe } from '../events';
import { authFetch, postData, getData } from '../driver';
import type {
  AppUser,
  DbBalanceType,
  DbCurrencySubType,
  DbCurrencyType,
} from './DbTypes';
import { parseJwt } from '../lib/jwt';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export interface UserState {
  token: string | null;
  appUser: AppUser | null;
  setToken: (token: string | null) => void;

  // appUser: AppUser | null;
  isAuthorized: boolean;
  login: (base64Data: string) => Promise<void>;
  logout: () => void;
  fetchBalance: () => Promise<void>;
  refreshBalance: (intervalMs: number) => () => void;
  error: string | null;
  setError: (error: string | null) => void;
  balance: DbBalanceType[];
  lastShift: string;
  currencies: DbCurrencyType[];
  // isCurLoading: boolean;
  fetchCurrencies: () => Promise<void>;
  cursub: DbCurrencySubType[];
  fetchCursub: () => Promise<void>;

  snackbar: SnackbarState;
  showNotification: (
    message: string,
    severity?: SnackbarState['severity'],
  ) => void;
  closeNotification: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  token: localStorage.getItem('token'),
  appUser: parseJwt(localStorage.getItem('token')),
  isAuthorized: !!localStorage.getItem('token'),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      const decodedUser = parseJwt(token);
      set({ token, appUser: decodedUser });
    } else {
      useUserStore.getState().logout();
    }
  },
  error: null,
  setError: (error) => set({ error }),
  balance: [],
  lastShift: new Date().toISOString().split('T')[0],
  currencies: [],
  cursub: [],

  login: async (base64Data) => {
    try {
      const response = await authFetch(base64Data);
      if (response) {
        const [_, tp] = response.split('.');
        set({
          token: response,
          appUser: JSON.parse(window.atob(tp)),
          isAuthorized: true,
        });
      }
    } catch (err) {
      console.error('Login failed', err);
      set({ isAuthorized: false, appUser: null, token: null, balance: [] });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, appUser: null });
  },

  fetchBalance: async () => {
    set({ error: null });
    try {
      const balanceData = await postData<DbBalanceType[]>(
        '/accounts',
        // get().token ?? '',
        JSON.stringify({ reqid: 'sse' }),
      );
      // console.log('balanceData=', balanceData);
      let shft = new Date().toISOString().split('T')[0];
      if (balanceData.length) {
        const maxTm = balanceData.reduce(
          (max, v) => (v.tm > max ? v.tm : max),
          '',
        );
        if (maxTm.includes('T')) shft = maxTm.split('T')[0];
      }
      const sortedBalance = [...balanceData]
        .sort(
          (a, b) =>
            Number(a.cuso) - Number(b.cuso) ||
            a.acntno.localeCompare(b.acntno) ||
            Number(a.shso) - Number(b.shso),
        )
        .map((v): DbBalanceType => {
          return {
            ...v,
            amnt: Number(v.amnt),
            turndbt: Number(v.turndbt),
            turncdt: Number(v.turncdt),
            cuso: Number(v.cuso),
            shso: Number(v.shso),
          };
        });
      set({
        balance: sortedBalance,
        lastShift: shft,
        // isPubDataLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error(err.message);
      set({ error: err.message });
    }
  },

  refreshBalance: (intervalMs) => {
    // console.log('intervalMs=', intervalMs);
    const runRefresh = () => {
      if (document.visibilityState === 'visible') {
        get().fetchBalance();
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

  fetchCurrencies: async () => {
    // Якщо дані вже є, не вантажимо знову
    if (useUserStore.getState().currencies.length > 0) return;

    // set({ isCurLoading: true });
    try {
      const data = await getData<DbCurrencyType[]>('/currencies', 'reqid=sel');
      const sortedData = [...data]
        .sort(
          (a, b) => Number(a.so) - Number(b.so) || a.name.localeCompare(b.name),
        )
        .map((v): DbCurrencyType => {
          return {
            ...v,
            dmst: Number(v.dmst),
            qty: Number(v.qty),
            so: Number(v.so),
          };
        }); // console.log('shft=', shft);
      set({
        currencies: sortedData,
        //  isCurLoading: false
      });
    } catch (err: any) {
      console.error('Помилка валют:', err);
      // set({ isCurLoading: false });
      set({ error: err.message });
    }
  },

  fetchCursub: async () => {
    if (useUserStore.getState().cursub.length > 0) return;

    // set({ isCurLoading: true });
    try {
      const data = await getData<DbCurrencySubType[]>(
        '/currencies',
        'reqid=selsub',
      );
      const sortedData = [...data].sort(
        (a, b) =>
          Number(a.atclcode) - Number(b.atclcode) ||
          Number(a.id) - Number(b.id),
      );
      // console.log('cursub data=', sortedData);
      set({
        cursub: sortedData,
        //  isCurLoading: false
      });
    } catch (err: any) {
      console.error('cursub error:', err);
      // set({ isCurLoading: false });
      set({ error: err.message });
    }
  },
  snackbar: {
    open: false,
    message: '',
    severity: 'success',
  },
  showNotification: (
    message: string,
    severity: SnackbarState['severity'] = 'success',
  ) => {
    set({
      snackbar: {
        open: true,
        message,
        severity,
      },
    });
  },
  closeNotification: () => {
    set((state) => ({
      snackbar: { ...state.snackbar, open: false },
    }));
  },
}));

subscribe('userChanged', (base64Data) => {
  useUserStore.getState().login(base64Data);
});
