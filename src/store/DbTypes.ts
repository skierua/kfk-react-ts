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

export interface DbArchRateType {
  period: string; // "2026-04-11"
  bamnt: string; // "26000"
  beq: string; // "1137890"
  bmin: string; // "43.4"
  bmax: string; // "43.8"
  aamnt: string; // "-43340"
  aeq: string; // "-1903000"
  amin: string; // "43.8"
  amax: string; // "44"
}

export interface DbBalanceType {
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
}

export interface DbCurrencySubType {
  atclcode: string; // "840"
  id: string; //""
  sname: string; //"$100 син"
}
