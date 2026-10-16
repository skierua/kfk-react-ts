import React, { useEffect, useMemo, useState } from 'react';

import Box, { type BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableContainer, {
  type TableContainerProps,
} from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { grey } from '@mui/material/colors';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import ExpandLessIcon from '@mui/icons-material/ExpandMore';

import { VkToggle } from './VkToggle';
import { humanDate } from '../lib/common';
import {
  kantFromBalanceForToggle,
  acntFromBalanceForToggle,
} from '../lib/balance';

import { useUserStore } from '../store/useUserStore';
import { useInfoStore } from '../store/useInfoStore';

import type {
  DbBalanceType,
  DbCurrencyType,
  DbShopType,
} from '../store/DbTypes';

// Описуємо структуру для групи
interface BalanceObjRowType {
  name: string;
  totalAmount: number;
  income: number;
  outcome: number;
  maxTime: string;
  details: BalanceRowType[];
}

interface BalanceRowType {
  acntno: string;
  atclcode: string;
  amnt: number;
  chid: string; // "USD"
  curName?: string; //
  cuso: number; // currency sort order
  curType: number; // "2"
  scancode?: string; //
  shso: number; // shop sort order
  turndbt: number;
  turncdt: number;
  shop: string;
  tm: string;
}

const transformBalanceForTable = (
  data: BalanceRowType[],
): BalanceObjRowType[] => {
  const lastShift = useUserStore((state) => state.lastShift);
  const groups: { [key: string]: BalanceObjRowType } = {};
  data
    .map((v): BalanceRowType => {
      if (!v.acntno.startsWith('30')) {
        return {
          ...v,
          amnt: 0 - v.amnt,
          turndbt: v.turncdt,
          turncdt: v.turndbt,
        };
      }
      return v;
    })
    .forEach((v) => {
      const key = v.chid; // або інше поле, за яким групуєте
      if (!groups[key]) {
        groups[key] = {
          name: v.chid,
          totalAmount: 0,
          income: 0,
          outcome: 0,
          maxTime: '',
          details: [],
        };
      }
      groups[key].totalAmount += v.amnt;
      if (v.tm.startsWith(lastShift)) {
        groups[key].income += v.turndbt;
        groups[key].outcome += v.turncdt;
      }
      if (v.tm > groups[key].maxTime) groups[key].maxTime = v.tm;
      groups[key].details.push(v);
    });

  return Object.values(groups);
};

const buildBalanceRow = (
  v: DbBalanceType,
  cur: DbCurrencyType,
  shop?: DbShopType,
): BalanceRowType => {
  return {
    ...v,
    chid: cur?.chid ?? '',
    curName: cur?.name ?? '',
    curType: cur?.dmst ?? 0,
    scancode: '',
    cuso: Number(cur?.so || 999), // currency sort order
    shso: Number(shop?.so ?? 99), // shop sort order
  };
};

export const BalanceComponent = ({
  balAcnt,
  activeOnly = true,
  ...other
}: { balAcnt: string; activeOnly?: boolean } & BoxProps) => {
  const appUser = useUserStore((state) => state.appUser);
  const rawData = useUserStore((state) => state.balance);
  const crnInfo = useInfoStore((state) => state.currencies);
  const shopInfo = useInfoStore((state) => state.shops);
  const lastShift = useUserStore((state) => state.lastShift);
  // const [balAcnt, setBalAcnt] = useState(String(balAcnt));
  const [knt, setKnt] = useState('');
  const [acnt, setAcnt] = useState('');
  // const [sourceData, setSourceData] = useState<DbBalanceType[]>(data);

  useEffect(() => {
    setKnt('');
    setAcnt('');
    // console.log('BalanceComponent useEffect: data=', data);
  }, [balAcnt]);

  const balData: BalanceRowType[] = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    const curSet = !!activeOnly
      ? new Set(
          Object.values(crnInfo)
            .filter((c) => (c.dmst & 3) !== 0)
            .map((c) => c.id),
        )
      : null;

    if (!!curSet) {
      rawData.forEach((v) => {
        if (v.tm.startsWith(lastShift)) curSet.add(v.atclcode);
      });
    }

    const res = rawData
      .filter((v) => {
        const matchesBal = !balAcnt || v.acntno.startsWith(balAcnt);

        const matchesZero = v.amnt !== 0 || v.turndbt !== 0 || v.turncdt !== 0;

        const matchesCur = curSet ? curSet.has(v.atclcode) : true;

        const userRole = appUser?.role || '';
        const userTerm = appUser?.term || '';
        const matcheShop =
          userRole === 'owner' ||
          userTerm === v.shop ||
          v.acntno.startsWith('3003') ||
          v.acntno.startsWith('35');

        return matchesBal && matchesZero && matchesCur && matcheShop;
      })
      .map((v): BalanceRowType => {
        const cur = crnInfo[v.atclcode];
        const shop = shopInfo[v.shop] || { name: v.shop, so: 99 };
        return buildBalanceRow(v, cur, shop);
      })
      .sort((a, b) => {
        // Якщо cuso, shso є числами, Number() можна прибрати для швидкості
        return (
          Number(a.curType) - Number(b.curType) ||
          Number(a.cuso) - Number(b.cuso) ||
          Number(a.shso) - Number(b.shso) ||
          a.acntno.localeCompare(b.acntno)
        );
      });

    return res;
  }, [rawData, balAcnt, crnInfo, shopInfo, appUser, lastShift, activeOnly]);

  // console.log(balData);

  const dataset = useMemo(() => {
    return balData.filter(
      (v) => (!knt || knt === v.shop) && (!acnt || v.acntno.startsWith(acnt)),
    );
  }, [balData, knt, acnt]);

  const kantToggleList = () => kantFromBalanceForToggle(balData);
  const acntToggleList = () => acntFromBalanceForToggle(balData);

  return (
    <Box {...other}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          paddingY: 1,
        }}
      >
        <VkToggle
          data={kantToggleList()}
          dflt={knt}
          label="Кантор"
          limit={4}
          fcb={(v) => setKnt(v)}
        />
        <VkToggle
          data={acntToggleList()}
          dflt={acnt}
          label="Рахунок"
          limit={4}
          fcb={(v) => setAcnt(v)}
        />
      </Box>

      <BalanceTable data={dataset} />
    </Box>
  );
};

export const BalanceTable = ({
  data,
  // showHeader = false,
  ...other
}: {
  data: BalanceRowType[];
  // showHeader?: boolean;
} & TableContainerProps) => {
  const dataset = transformBalanceForTable(data);
  return (
    <TableContainer component={Paper} {...other}>
      <Table
        size="small"
        aria-label="a dense table"
        sx={{
          width: '100%',
          minWidth: '200px', // скасовуємо стандартні 650px
          //   tableLayout: 'fixed', // (опційно) змушує колонки підлаштовуватися під 100%
        }}
      >
        {false && (
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography color={grey[500]}></Typography>
              </TableCell>
              <TableCell align="center">
                <Typography color={grey[500]}></Typography>
              </TableCell>
              <TableCell align="right">
                <Typography color={grey[500]}></Typography>
              </TableCell>
              <TableCell align="right">
                <Typography color={grey[500]}></Typography>
              </TableCell>
              <TableCell align="right">
                <Typography color={grey[500]}></Typography>
              </TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {dataset.map((v) => (
            <BalanceRow key={v.name} row={v} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const BalanceRow = ({ row }: { row: BalanceObjRowType }) => {
  const [open, setOpen] = useState(false);
  const shft = useUserStore((state) => state.lastShift);
  return (
    <React.Fragment>
      {/* Головний агрегований рядок */}
      <TableRow
        sx={{
          '& > *': { borderBottom: 'unset' },
          '&:last-child td, &:last-child th': { border: 0 },
          bgcolor: open ? 'action.hover' : 'inherit',
          '& .MuiTableCell-root': {
            padding: '8px 4px',
          },
        }}
      >
        <TableCell>
          <Box sx={{ display: 'flex', gap: '5px' }}>
            <IconButton
              size="small"
              sx={{ padding: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              <ExpandMoreIcon
                sx={{
                  // transition: 'transform 0.2s',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
              {/* {open ? (
                <ExpandLessIcon key="less" />
              ) : (
                <ExpandMoreIcon key="more" />
              )} */}
            </IconButton>
            {row.name}
          </Box>
        </TableCell>
        <TableCell
          align="right"
          sx={{ color: hue(row.maxTime, shft, row.totalAmount) }}
        >
          {Math.round(Math.abs(row.totalAmount)).toLocaleString()}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            lineHeight: 1.1,
            color: hue(row.maxTime, shft),
          }}
        >
          <div style={{ fontSize: '90%' }}>
            <div>{Math.round(row.income).toLocaleString()}</div>
            <div>{Math.round(row.outcome).toLocaleString()}</div>
          </div>
        </TableCell>
        <TableCell
          align="right"
          sx={{ fontSize: '90%', color: hue(row.maxTime, shft) }}
        >
          {humanDate(row.maxTime)}
        </TableCell>
      </TableRow>

      {/* Вкладений рядок з деталями */}
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {/* <Box sx={{ margin: 1, mb: 2 }}> */}
            <Table
              size="small"
              sx={{
                width: '100%',
                minWidth: 'auto', // скасовуємо стандартні 650px
                //   tableLayout: 'fixed', // (опційно) змушує колонки підлаштовуватися під 100%
              }}
            >
              <TableBody>
                {row.details.map((detail, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      // '& > *': { borderBottom: 'unset' },
                      '&:last-child td, &:last-child th': { border: 0 },
                      '& .MuiTableCell-root': {
                        //   color: hue(detail.tm, shft),
                        fontSize: '90%',
                        padding: '8px 4px',
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: hue(detail.tm, shft),
                      }}
                    >
                      {detail.shop}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: hue(detail.tm, shft, detail.amnt),
                      }}
                    >
                      {Math.round(Math.abs(detail.amnt)).toLocaleString(
                        'uk-UA',
                        {
                          maximumFractionDigits: 0,
                        },
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        lineHeight: 1.1,
                        color: hue(detail.tm, shft),
                      }}
                    >
                      <div style={{ fontSize: '90%' }}>
                        <div>{Math.round(detail.turndbt).toLocaleString()}</div>
                        <div>{Math.round(detail.turncdt).toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        lineHeight: 1.1,
                        color: hue(detail.tm, shft),
                      }}
                    >
                      <div style={{ fontSize: '90%' }}>
                        <div>{humanDate(detail.tm)}</div>
                        <div>{detail.acntno}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* </Box> */}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

/**
 *
 * @param {string} amnt
 * @param {string} d date
 * @param {string} l lastShift date
 * @returns
 */
const hue = (d: string, l: string, amnt: number = 1) => {
  // console.log(`tm=${d.substring(0, 10)} shift=${l}`);
  if (d.startsWith(l)) {
    return Number(amnt) < 0 ? 'error.main' : 'text.primary';
    //   return Number(amnt) < 0 ? red[900] : grey[900];
  } else {
    return Number(amnt) < 0 ? 'error.light' : 'text.disabled';
    //    return Number(amnt) < 0 ? red[300] : grey[500];
  }
};
