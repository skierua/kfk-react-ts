import { useEffect, useMemo } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer, {
  type TableContainerProps,
} from '@mui/material/TableContainer';
import TableCell, { type TableCellProps } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableFooter, { type TableFooterProps } from '@mui/material/TableFooter';
import TableRow, { type TableRowProps } from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { grey } from '@mui/material/colors';

import { APP_CONFIG } from '../const';
import type { RateType } from '../lib/types';
import { ratesDataset } from '../lib/rates';

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

interface RateTable_testProps extends TableContainerProps {
  footer?: string;
  showFlag?: boolean;
  curFilter?: string[];
  kntFilter?: string[];
  tgPublish?: (data: RateType[]) => void;
  onDataChange?: (data: any) => void;
}

export const RateTable_test = (props: RateTable_testProps) => {
  const {
    footer,
    showFlag = true,
    curFilter,
    kntFilter,
    onDataChange,
    tgPublish = false,
    ...other
  } = props;
  const rawRates = useRateStore((state) => state.dataset);
  const crnInfo = useInfoStore((state) => state.currencies);
  const subInfo = useInfoStore((state) => state.cursubmap);
  const subvalue = useInfoStore((state) => state.subvalue);
  const shopInfo = useInfoStore((state) => state.shops);
  // console.log(
  //   'RateTable_test: curFilter=',
  //   curFilter,
  //   ' kntFilter=',
  //   kntFilter,
  //   // 'rawRates=',
  //   // rawRates,
  // );

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

  const showKant = useMemo(() => {
    const uniqueKants = new Set(dataset.map((v) => v.shop));
    return uniqueKants.size > 1;
  }, [dataset]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(dataset);
    }
  }, [dataset, onDataChange]);

  if (!dataset || dataset.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', width: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          Немає актуальних курсів
        </Typography>
      </Box>
    );
  }
  return (
    <TableContainer
      component={Paper}
      // sx={{ overflowX: 'auto', width: '100%' }}
      {...other}
    >
      <Table
        size="small"
        aria-label="a dense table"
        sx={{
          // width: '100%',
          minWidth: 'auto', // скасовуємо стандартні 650px
          tableLayout: { xs: 'fixed', sm: 'auto' }, // (опційно) змушує колонки підлаштовуватися під 100%
        }}
      >
        {/* {showTitle && <RateTableHead />} */}
        <TableBody>
          {dataset.map((v) => {
            return (
              (Number(v.bid) !== 0 || Number(v.ask) !== 0) && (
                <RateRow
                  // className="rates-table-row"
                  id={`${v.shop}-${v.atclcode}-${v.scode}`}
                  key={`${v.shop}-${v.atclcode}-${v.scode}`}
                  rate={v}
                  dispFlag={showFlag}
                  dispKant={showKant}
                />
              )
            );
          })}
        </TableBody>
        {footer && <RateTableFooter footer={footer} />}
      </Table>
    </TableContainer>
  );
};

const RateTableFooter = ({
  footer,
  ...other
}: { footer?: string } & TableFooterProps) => {
  return (
    <TableFooter {...other}>
      <TableRow>
        <TableCell align="center" colSpan={3}>
          <Typography color={grey[600]}>{footer}</Typography>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

interface RateRowProps extends TableRowProps {
  rate: RateType;
  dispFlag?: boolean;
  dispKant?: boolean;
}

export const RateRow = ({
  rate,
  dispFlag = true,
  dispKant = true,
  ...other
}: RateRowProps) => {
  return (
    <TableRow
      // "&:last-child td, &:last-child th": { border: 0 },
      sx={{
        '&:last-child td,  &:last-child th': { border: 0 },
      }}
      {...other}
    >
      <TableCell
        align="center"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '8px 4px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {dispFlag && (
            <Typography variant="h5" sx={{ lineHeight: 1 }}>
              {rate.flag}
            </Typography>
          )}
          <div>{rate.chid}</div>
          {dispKant && <div style={{ fontSize: '0.8rem' }}>{rate.shop}</div>}
          <div style={{ fontSize: '0.7rem' }}>{rate.sname}</div>
        </Box>
      </TableCell>
      <RateCell amnt={rate.bid} />
      <RateCell amnt={rate.ask} />
    </TableRow>
  );
};

const RateCell = ({ amnt, ...other }: { amnt: number } & TableCellProps) => {
  return (
    <TableCell
      align="center"
      sx={{
        padding: { xs: '0', sm: '8px 4px' },
        width: { xs: '25%', sm: '80px' },
      }}
      // width="30%"
      {...other}
    >
      {/* <Typography color={grey[800]}> */}
      {amnt !== 0 ? amnt.toPrecision(4) : ''}
      {/* </Typography> */}
    </TableCell>
  );
};

interface RatePoolProps extends BoxProps {
  kantFilter?: string;
  curFilter?: string;
  cursubFilter?: string;
  sortFilter?: number;
  typeFilter?: number;
  wtitle?: string;
}

export const RatePool = ({
  kantFilter,
  curFilter,
  cursubFilter,
  sortFilter,
  typeFilter,
  wtitle,
  ...other
}: RatePoolProps) => {
  const rawRates = useRateStore((state) => state.dataset);
  const crnInfo = useInfoStore((state) => state.currencies);
  const subInfo = useInfoStore((state) => state.cursubmap);
  const subvalue = useInfoStore((state) => state.subvalue);

  const transformedData: RateType[] = useMemo(() => {
    const res = rawRates
      .filter((v) => {
        return Number(v.bid || 0) !== 0;
      })
      .map((v): RateType => {
        const cur = crnInfo[v.atclcode];
        const sub = subvalue(v.atclcode, String(v.scode || ''));
        return transformFromDb(v, cur, sub);
      })
      .sort((a, b) => {
        return (
          Number(a.sortorder) - Number(b.sortorder) ||
          Number(a.scode) - Number(b.scode)
        );
      });
    return ratesDataset({
      data: res,
      kantFilter: kantFilter,
      typeFilter: typeFilter,
    });
  }, [rawRates, crnInfo, subInfo, subvalue, kantFilter, typeFilter]);
  return (
    <Box className="adm-dash-container" {...other}>
      <Box className="adm-dash-container-title-wrapper">
        <Box className="adm-dash-container-title">
          {wtitle ?? 'РОЗДРІБ. купівля'}
        </Box>
      </Box>
      <Box
        component={Paper}
        sx={{
          width: { xs: 'auto', sm: '360px' },
          display: 'flex',
          padding: '5px',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        {transformedData.map((v) => {
          return (
            <Box
              id={v.shop + '-' + v.atclcode}
              key={v.shop + '-' + v.atclcode}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem',
              }}
              {...other}
            >
              <Typography variant="h6" sx={{ lineHeight: 1 }}>
                {v.flag}
              </Typography>
              {` ${v.chid} ${v.bid.toPrecision(v.bid < 1 ? 3 : 4)}`}
              {/* {v.chid}&nbsp; {v.bid.toPrecision(v.bid < 1 ? 3 : 4)} */}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const CrossTable = ({ subcode, ...other }: { subcode: string }) => {
  const rawRates = useRateStore((state) => state.dataset);
  const crnInfo = useInfoStore((state) => state.currencies);
  const subInfo = useInfoStore((state) => state.cursubmap);
  const subvalue = useInfoStore((state) => state.subvalue);

  const title = useMemo(() => {
    const sub = subvalue(APP_CONFIG.CURID, String(subcode || ''));
    return sub?.sname || '';
  }, [subInfo]);

  const rateUSD = useMemo(() => {
    return rawRates.find(
      (v) =>
        v.shop === APP_CONFIG.BULK &&
        v.atclcode === APP_CONFIG.CURID &&
        v.scode === subcode,
    );
  }, [rawRates]);

  const rateEUR = useMemo(() => {
    return rawRates.find(
      (v) => v.shop === APP_CONFIG.BULK && v.atclcode === '978' && !v.scode,
    );
  }, [rawRates]);

  const ratePLN = useMemo(() => {
    return rawRates.find(
      (v) => v.shop === APP_CONFIG.BULK && v.atclcode === '985' && !v.scode,
    );
  }, [rawRates]);

  const dataset_0 = useMemo(() => {
    return [
      [rateEUR, rateUSD],
      [rateUSD, ratePLN],
    ].map((v) => {
      const bidbid =
        (v[1]?.bid ?? 0) !== 0 ? (v[0]?.bid ?? 0) / (v[1]?.bid ?? 1) : 0;
      const askbid =
        (v[1]?.bid ?? 0) !== 0 ? (v[0]?.ask ?? 0) / (v[1]?.bid ?? 1) : 0;
      const bidask =
        (v[1]?.ask ?? 0) !== 0 ? (v[0]?.bid ?? 0) / (v[1]?.ask ?? 1) : 0;
      const askask =
        (v[1]?.ask ?? 0) !== 0 ? (v[0]?.ask ?? 0) / (v[1]?.ask ?? 1) : 0;
      const curid = String(v[0]?.atclcode ?? '') + String(v[1]?.atclcode ?? '');
      const cur = crnInfo[curid];
      return {
        id: curid,
        chid: cur?.chid ?? '',
        scode: '',
        name: cur?.name ?? '',
        flag: cur?.flag ?? '🏳️',
        domestic: Number(cur?.dmst || 0),
        bidbid: bidbid,
        bidask: bidask,
        askbid: askbid,
        askask: askask,
      };
    });
  }, [rateUSD, rateEUR, ratePLN]);
  // console.log('dataset_0', dataset_0);
  return (
    <TableContainer
      component={Paper}
      // sx={{ overflowX: 'auto', width: '100%' }}
      {...other}
    >
      <Table
        size="small"
        aria-label="a dense table"
        sx={{
          // width: '100%',
          minWidth: 'auto', // скасовуємо стандартні 650px
          tableLayout: { xs: 'fixed', sm: 'auto' }, // (опційно) змушує колонки підлаштовуватися під 100%
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="center" padding={'none'}>
              <Typography variant="caption" color="text.secondary">
                {title ?? 'Назва'}
              </Typography>
            </TableCell>
            <TableCell></TableCell>
            <TableCell align="center" padding={'none'}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <Typography variant="caption">bid/?</Typography>
                {/* <Typography variant="caption">ask</Typography> */}
              </Box>
            </TableCell>
            <TableCell align="center" padding={'none'}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <Typography variant="caption">ask/?</Typography>
                {/* <Typography variant="caption">ask/ask</Typography> */}
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataset_0.map((v) => {
            return (
              <TableRow key={`rev-${v.id}-${v.scode}`}>
                <TableCell align="center" padding={'none'}>
                  {`${v.chid}`}
                </TableCell>
                <TableCell>
                  <div>?/bid</div>
                  <div>?/ask</div>
                </TableCell>
                <TableCell align="center" padding={'none'}>
                  <div>{v.bidbid.toPrecision(5)}</div>
                  <div>{v.bidask.toPrecision(5)}</div>
                </TableCell>
                <TableCell align="center" padding={'none'}>
                  <div>{v.askbid.toPrecision(5)}</div>
                  <div>{v.askask.toPrecision(5)}</div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
