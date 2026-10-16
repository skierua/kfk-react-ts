export interface AppUser {
  crntuser: string;
  term: string;
  role: string;
  user: string;
  exp?: number; // якщо додасте час дії на сервері
}

export interface DbRateType {
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
}

export interface DbOfferType {
  amnt: string; // ""3000"
  bidask: 'bid' | 'ask'; // "bid"
  curid: string; // "840"
  chid: string; // "USD"
  name: string; // "долар США"
  oid: string; // "6925"
  onote: string; // "$100 синій"
  price: string; // "43.65"
  qty: string; // ""
  shop: string; // "BULK"
  sortorder: string; // "10"
  tel: string; // "(096)001-3600"
  tm: string; // "2026-04-15T15:39:19.670Z"
}

//period, atclcode, ba, qty, amnt, eq, shop, acnt, cashier, minrate, maxrate
export interface DbDayCurRsltType {
  period: string; // "2026-04-11"
  atclcode: string; // "840"
  ba: string; // "26000"
  qty: number; // "1"
  amnt: number; // "43340"
  eq: number; // "1137890"
  shop: string; // "43.4"
  acnt: string; // "43.8"
  cashier: string; // "-1903000"
  minrate: number; // "43.8"
  maxrate: number; // "44"
}

export interface DbBalanceType {
  acntno: string;
  atclcode: string;
  amnt: number;
  turndbt: number;
  turncdt: number;
  shop: string;
  tm: string;
}

export interface _DbBalanceType {
  acntno: string; // "3000"
  amnt: number; // "15100"
  chid: string; // "CZK"
  cuso: number; // "23" currency sort order
  id: string; // "203"
  scancode: string; // ""
  shop: string; // "CITY"
  shso: number; // "25" shop sort order
  tm: string; // "2026-04-23T17:59"
  turncdt: number; // "0"
  turndbt: number; // "0"
}

export interface DbCurrencyType {
  chid: string; // "USD"
  dmst: number; // "2"
  id: string; // "840"
  name: string; // "долар США"
  qty: number; // "1"
  so: number; // "10"
  symb: string; // "$"
  flag: string; // "🇺🇸"
  sub: { id: string; sname: string }[];
}

export interface DbCurrencySubType {
  atclcode: string; // "840"
  id: string; //""
  sname: string; //"$100 син"
}

export interface DbShopType {
  name: string;
  so: number;
}

// agregate document type
export interface DbDcmAgrType {
  period: string; // "2026-04-11"
  atclcode: string; // "840"
  dcmcode: string; // ""
  shop: string; // "FEYA"
  amnt: number; // ""
  eq: number; // ""
  dsc?: number; // ""
  bns?: number; // ""
}

export interface DbMnRsltType {
  period: string; // "2026-04-11"
  atclcode: string; // "840"
  shop: string; // "FEYA"
  amnt: number; // ""
  code: string; // ""
  acnt: string; // ""
  cashier?: string; // ""
}
