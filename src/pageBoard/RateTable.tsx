import { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
// import type BoxProps from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import type { RateType } from '../lib/types';
import { APP_CONFIG } from '../const';
import { maxTime } from '../lib/rates';
import { humanDate } from '../lib/common';

import { useInfoStore } from '../store/useInfoStore';
import { useRateStore } from '../store/useRateStore';

const transformFromDb = (v: any, cur: any, sub?: any, shop?: any): RateType => {
  return {
    ...v,
    bid: Number(v.bid),
    ask: Number(v.ask),
    chid: cur?.chid ?? '',
    name: cur?.name ?? '',
    cqty: Number(cur?.qty ?? 1),
    rqty: Number(v.qty ?? 1),
    symb: cur?.symb ?? '',
    flag: cur?.flag ?? '🏳️',
    sortorder: Number(cur?.so || 999),
    domestic: Number(cur?.dmst || 0),
    sname: APP_CONFIG.BULK === v.shop ? (sub?.sname ?? '') : '',
    prc: String(v.prc ?? ''),
    shopSortOrder: Number(shop?.so ?? 99),
  };
};

interface RateTableBoardProps {
  curFilter?: string[];
  kntFilter?: string[];
  onDataChange?: (data: any) => void;
}

export const RateTableBoard = (props: RateTableBoardProps) => {
  const { curFilter, kntFilter, onDataChange } = props;
  const rawRates = useRateStore((state) => state.dataset);
  const crnInfo = useInfoStore((state) => state.currencies);
  const subInfo = useInfoStore((state) => state.cursubmap);
  const subvalue = useInfoStore((state) => state.subvalue);
  const shopInfo = useInfoStore((state) => state.shops);

  const dataset: RateType[] = useMemo(() => {
    const res = rawRates
      .filter((v) => {
        const matchesCur =
          curFilter && curFilter.length > 0
            ? curFilter.includes(v.atclcode)
            : true;
        const matchesKnt =
          kntFilter && kntFilter.length > 0 ? kntFilter.includes(v.shop) : true;
        const matchesBidAsk =
          Number(v.bid || 0) !== 0 || Number(v.ask || 0) !== 0;
        return matchesCur && matchesKnt && matchesBidAsk;
      })
      .map((v): RateType => {
        const cur = crnInfo[v.atclcode];
        const sub = subvalue(v.atclcode, String(v.scode || ''));
        const shop = shopInfo[v.shop] || { name: v.shop, so: 99 };
        return transformFromDb(v, cur, sub, shop);
      })
      .sort((a, b) => {
        return (
          Number(a.sortorder) - Number(b.sortorder) ||
          Number(a.scode) - Number(b.scode) ||
          Number(a.shopSortOrder) - Number(b.shopSortOrder)
        );
      });
    return res;
  }, [rawRates, crnInfo, subInfo, subvalue, shopInfo, curFilter, kntFilter]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(dataset);
    }
  }, [dataset, onDataChange]); // Спрацює ТІЛЬКИ коли масив реально змінився

  return (
    <Paper>
      <table
        className="brd-table-component"
        // size="small"
        aria-label="a dense table"
      >
        <thead>
          <tr>
            <th align="center">назва</th>
            <th align="center">купівля</th>
            <th align="center">продаж</th>
          </tr>
        </thead>
        <tbody>
          {dataset.map((v) => {
            return (
              (Number(v.bid) !== 0 || Number(v.ask) !== 0) && (
                <tr
                  id={`${v.shop}-${v.atclcode}-${v.scode}`}
                  key={`${v.shop}-${v.atclcode}-${v.scode}`}
                >
                  <td align="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '0.5rem',
                      }}
                    >
                      {/* <Box
                        component="img"
                        alt={v.chid}
                        src={`/flag/${v.atclcode}.svg`}
                      /> */}
                      <div style={{ fontSize: '120%' }}>{v.flag}</div>
                      <div>{` ${v.chid}`}</div>
                      <div style={{ fontSize: '70%' }}>{v.sname}</div>
                    </Box>
                  </td>
                  <td>{v.bid !== 0 ? v.bid.toPrecision(4) : ''}</td>
                  <td>{v.ask !== 0 ? v.ask.toPrecision(4) : ''}</td>
                  {/* <td align="center"> {Number(v.bid).toPrecision(4)} </td> */}
                  {/* <td align="center"> {Number(v.ask).toPrecision(4)} </td> */}
                </tr>
              )
            );
          })}
        </tbody>
        {/* {footer && <RateTableFooter footer={footer} />} */}
      </table>
    </Paper>
  );
};

interface RatePoolBoardProps {
  shop: string;
}

export const RatePoolBoard = (props: RatePoolBoardProps) => {
  const { shop } = props;

  const rawRates = useRateStore((state) => state.dataset);
  const crnInfo = useInfoStore((state) => state.currencies);
  const subInfo = useInfoStore((state) => state.cursubmap);
  const subvalue = useInfoStore((state) => state.subvalue);
  const shopInfo = useInfoStore((state) => state.shops);

  const curFilter = useMemo((): string[] => {
    return Object.values(crnInfo)
      .filter((v) => Number(v.dmst) === 4)
      .map((v) => v.id);
  }, [crnInfo]);

  const dataset: RateType[] = useMemo(() => {
    const res = rawRates
      .filter((v) => {
        const matchesCur =
          curFilter && curFilter.length > 0
            ? curFilter.includes(v.atclcode)
            : true;
        const matchesKnt = shop === v.shop;
        // kntFilter && kntFilter.length > 0 ? kntFilter.includes(v.shop) : true;
        const matchesBidAsk =
          Number(v.bid || 0) !== 0 || Number(v.ask || 0) !== 0;
        return matchesCur && matchesKnt && matchesBidAsk;
      })
      .map((v): RateType => {
        const cur = crnInfo[v.atclcode];
        const sub = subvalue(v.atclcode, String(v.scode || ''));
        const shop = shopInfo[v.shop] || { name: v.shop, so: 99 };
        return transformFromDb(v, cur, sub, shop);
      })
      .sort((a, b) => {
        return (
          Number(a.sortorder) - Number(b.sortorder) ||
          Number(a.scode) - Number(b.scode) ||
          Number(a.shopSortOrder) - Number(b.shopSortOrder)
        );
      });
    return res;
  }, [rawRates, crnInfo, subInfo, subvalue, shopInfo, curFilter, shop]);

  const lastUpdated = useMemo(() => {
    const latestUpdate = maxTime(dataset);
    return humanDate((latestUpdate || '') as string);
  }, [dataset]);

  return (
    <div>
      <div className="brd-table-title">
        <div>РОЗДРІБ==, купівля</div>
        <div>{lastUpdated}</div>
      </div>
      <div className="brd-other-component">
        {dataset.map((v) => {
          return (
            <div
              style={{ display: 'inline-flex' }}
              id={v.shop + '-' + v.atclcode}
              key={v.shop + '-' + v.atclcode}
            >
              {`${v.flag} ${v.chid} ${v.bid.toPrecision(v.bid < 1 ? 3 : 4)}`}
            </div>
          );
        })}
      </div>
    </div>
  );
};
