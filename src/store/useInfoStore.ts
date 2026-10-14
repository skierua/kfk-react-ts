import { create } from 'zustand';
import { getData } from '../driver';
import type { DbCurrencySubType, DbCurrencyType } from './DbTypes';

const buildSubKey = (atclcode: string, id: string): string =>
  `${atclcode}_${id}`;

export interface InfoState {
  currencies: Record<string, DbCurrencyType>;
  fetchCurrencies: () => Promise<void>;
  cursub: DbCurrencySubType[];
  cursubmap: Record<string, DbCurrencySubType>;
  // cursubmap_test: Record<{ atclcode: string; id: string }, DbCurrencySubType>;
  // subkey: (atclcode: string, id: string) => string;
  subvalue: (atclcode: string, id: string) => DbCurrencySubType | null;
  fetchCursub: () => Promise<void>;
  shops: Record<string, { name: string; so: number }>;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useInfoStore = create<InfoState>((set, get) => ({
  currencies: {} as Record<string, DbCurrencyType>,
  cursubmap: {} as Record<string, DbCurrencySubType>,
  cursub: [],
  // shops: {},
  // error: null,
  // setError: (error) => set({ error }),
  // subkey: (atclcode, id) => `${atclcode}_${id}`,
  subvalue: (atclcode: string, id: string): DbCurrencySubType | null =>
    get().cursubmap[buildSubKey(atclcode, id)] || null,
  fetchCurrencies: async () => {
    if (Object.keys(useInfoStore.getState().currencies).length > 0) return;
    try {
      const raw = await getData<DbCurrencyType[]>('/currencies', 'reqid=sel');
      const data = [...raw]
        .filter((v) => !!v.so)
        .map((v): DbCurrencyType => {
          return {
            ...v,
            dmst: Number(v.dmst),
            qty: Number(v.qty || 1),
            so: Number(v.so || 99),
            flag: v.flag || '🏳️',
            sub: [],
          };
        }); // console.log('shft=', shft);
      set({
        currencies: Object.fromEntries(data.map((v) => [v.id, v])),
        //  isCurLoading: false
      });
      await get().fetchCursub();
    } catch (err: any) {
      console.error('Помилка валют:', err);
      // set({ isCurLoading: false });
      set({ error: err.message });
    }
  },
  fetchCursub: async () => {
    if (useInfoStore.getState().cursub.length > 0) return;

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
        cursubmap: Object.fromEntries(
          sortedData.map((v) => [
            buildSubKey(v.atclcode, v.id),
            // useInfoStore.getState().subkey(v.atclcode, v.id),
            v,
          ]),
        ),
        //  isCurLoading: false
      });
    } catch (err: any) {
      console.error('cursub error:', err);
      // set({ isCurLoading: false });
      set({ error: err.message });
    }
  },
  shops: Object.fromEntries(
    [
      { name: 'BULK', so: 1 },
      { name: 'CITY', so: 2 },
      { name: 'FEYA', so: 3 },
    ].map((shop) => [shop.name, shop]),
  ),
  error: null,
  setError: (error) => set({ error }),
}));
