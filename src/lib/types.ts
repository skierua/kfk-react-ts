export interface OfferType {
  id: string; // "6925"
  amnt: string; // ""3000"
  bidask: 'bid' | 'ask'; // "bid"
  curid: string; // "840"
  chid: string; // "USD"
  name: string; // "долар США"
  note: string; // "$100 синій"
  price: string; // "43.65"
  qty: string; // ""
  shop: string; // "BULK"
  tel: string; // "(096)001-3600"
  tm: string; // "2026-04-15T15:39:19.670Z"
  flag?: string; // "🇺🇸"
  symb?: string; // "$"
  so?: number; // "10" sortorder
}

export interface RateType {
  atclcode: string; // "985",
  chid: string; // "PLN",
  name: string; // "польський злотий",
  cqty: number; // "1",
  rqty: number; // "1",
  bid: number; // "11.95",
  ask: number; // "12.05",
  bidtm: string; // "2026-04-11T08:03:19.498Z",
  asktm: string; // "2026-04-11T08:03:19.498Z",
  shop: string; // "CITY",
  scode: string; // "",
  sname: string; // "",
  sortorder: number; // "20",
  prc: string; // "",
  domestic: number; // "2"
  flag?: string; // "🇺🇸"
  symb?: string; // "$"
  shopSortOrder?: number;
}
