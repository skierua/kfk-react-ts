import { create } from 'zustand';
import { getData, postData } from '../driver';
import type { DbDayCurRsltType, DbDcmAgrType, DbMnRsltType } from './DbTypes';

export interface RepoStore {
  dayCurRslt: DbDayCurRsltType[];
  fetchDayCurRslt: (datestr: string) => Promise<void>;
  dcmAgrRslt: DbDcmAgrType[];
  fetchDcmAgrRslt: (datestr: string) => Promise<void>;
  monRslt: DbMnRsltType[];
  fetchMonRslt: (from: string, to: string, shop?: string) => Promise<void>;
}

export const useRepoStore = create<RepoStore>(() => ({
  dayCurRslt: [] as DbDayCurRsltType[],
  dcmAgrRslt: [] as DbDcmAgrType[],
  monRslt: [] as DbMnRsltType[],
  fetchDayCurRslt: async (datestr) => {
    useRepoStore.setState({ dayCurRslt: [] }); // Clear previous data
    try {
      const raw = await getData<DbDayCurRsltType[]>(
        '/reports',
        `reqid=dayCurRslt&period=${datestr}`,
      );
      const res = raw.map((v): DbDayCurRsltType => {
        return {
          ...v,
          qty: Number(v.qty),
          amnt: Number(v.amnt),
          eq: Number(v.eq),
          minrate: Number(v.minrate),
          maxrate: Number(v.maxrate),
        };
      });
      useRepoStore.setState({ dayCurRslt: res });
    } catch (err) {
      console.error('Error fetching dayCurRslt:', err);
    }
  },
  fetchDcmAgrRslt: async (datestr) => {
    useRepoStore.setState({ dcmAgrRslt: [] }); // Clear previous data
    try {
      const raw = await postData<any[]>(
        '/reports',
        JSON.stringify({ reqid: 'crntTradeOper', tm: datestr }),
      );
      const res = raw.map((v): DbDcmAgrType => {
        return {
          ...v,
          amnt: Number(v.amnt),
          eq: Number(v.eq),
          dsc: v.dsc !== undefined ? Number(v.dsc) : 0,
          bns: v.bns !== undefined ? Number(v.bns) : 0,
        };
      });
      useRepoStore.setState({ dcmAgrRslt: res });
    } catch (err) {
      console.error('Error fetching dcmAgrRslt:', err);
    }
  },
  fetchMonRslt: async (vfrom, vto, vshop) => {
    useRepoStore.setState({ monRslt: [] }); // Clear previous data
    try {
      const raw = await postData<any[]>(
        '/reports',
        JSON.stringify({
          reqid: 'moncurprofit',
          from: vfrom,
          to: vto,
          shop: vshop,
        }),
      );
      const res = raw.map((v): DbMnRsltType => {
        return {
          ...v,
          amnt: Number(v.amnt),
          cashier: v.cashier !== undefined ? String(v.cashier) : undefined,
        };
      });
      useRepoStore.setState({ monRslt: res });
    } catch (err) {
      console.error('Error fetching monRslt:', err);
    }
  },
}));
