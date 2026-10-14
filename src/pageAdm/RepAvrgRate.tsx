import { useMemo, useState, useEffect } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';

import { useUserStore } from '../store/useUserStore';
import { useInfoStore } from '../store/useInfoStore';
import { useRepoStore } from '../store/useRepoStore';
import type { DbDcmAgrType } from '../store/DbTypes';

import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Typography from '@mui/material/Typography';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import Stack from '@mui/material/Stack';

interface AvrgRateType {
  period: string; // "2026-04-11"
  atclcode: string; // "840"
  chid: string; // "USD"
  shop: string; // "FEYA"
  qty: number; // "1"
  crnso: number; // "10"
  shopso: number; // "10"
  symb: string; // "$"
  flag?: string; // "🇺🇸"
  bidamnt: number;
  bidrate: number;
  askamnt: number;
  askrate: number;
}

const transformData = (
  data: DbDcmAgrType[],
  crnInfo: any,
  shopInfo: any,
): AvrgRateType[] => {
  if (data.length == 0) {
    return [];
  }
  const map = new Map<string, AvrgRateType>();
  for (let r of data) {
    const key = `${r.atclcode}-${r.shop}`;
    if (!map.has(key)) {
      const cur = crnInfo[r.atclcode];
      const shop = shopInfo[r.shop];
      map.set(key, {
        period: key,
        atclcode: r.atclcode,
        chid: cur?.chid ?? '',
        shop: r.shop,
        qty: cur?.qty ?? 1,
        crnso: cur?.so ?? 99,
        shopso: shop?.so ?? 99,
        symb: cur?.symb ?? '',
        flag: cur?.flag ?? '🏳️',
        bidamnt: 0,
        bidrate: 0,
        askamnt: 0,
        askrate: 0,
      });
    }
    const existingData = map.get(key);
    if (existingData) {
      if (r.dcmcode === 'trade:buy') {
        existingData.bidamnt = Number(r.amnt);
        existingData.bidrate =
          Number(r.amnt) !== 0
            ? (existingData.qty * Number(r.eq)) / Number(r.amnt)
            : 0;
      } else if (r.dcmcode === 'trade:sell') {
        existingData.askamnt = -1 * Number(r.amnt);
        existingData.askrate =
          Number(r.amnt) !== 0
            ? (existingData.qty * Number(r.eq)) / Number(r.amnt)
            : 0;
      }
    }
  }
  const tmp = Array.from(map.values());
  const res = tmp.sort((a, b) => a.crnso - b.crnso || a.shopso - b.shopso);
  return res;
};

export const RepAvrgRate = ({ ...other }: BoxProps) => {
  const { appUser } = useUserStore();
  const [fltprd, setFltprd] = useState<string>(
    new Date().toISOString().split('T')[0],
  ); // period filter
  const crnInfo = useInfoStore((state) => state.currencies);
  const shopInfo = useInfoStore((state) => state.shops);
  const isOwner = appUser?.role === 'owner';
  const { dcmAgrRslt, fetchDcmAgrRslt } = useRepoStore();
  // console.info('RepAvrgRate: role=', appUser?.role, isOwner);
  // console.info('RepAvrgRate: crnInfo=', crnInfo);

  useEffect(() => {
    fetchDcmAgrRslt(fltprd);
  }, [fetchDcmAgrRslt, fltprd]);

  const transformedData = useMemo(() => {
    if (dcmAgrRslt.length === 0) {
      return [];
    }
    return transformData(dcmAgrRslt, crnInfo, shopInfo);
  }, [dcmAgrRslt]);
  // console.info('transformedData=', transformedData);
  return (
    <Box
      className="adm-dash-container"
      sx={{
        width: { xs: 'auto', sm: '360px' },
      }}
      {...other}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Місяць до"
          views={['day', 'month', 'year']}
          slotProps={{ textField: { size: 'small' } }}
          value={dayjs(fltprd)} // Якщо fltprd це рядок 'YYYY-MM-DD', dayjs його чудово зчитає
          onChange={(v) => {
            // Якщо дата вибрана — форматуємо її як YYYY-MM-DD без зсуву UTC.
            // Якщо поле очищено (null) — ставимо сьогоднішню дату в тому ж форматі.
            const formattedDate = v
              ? v.format('YYYY-MM-DD')
              : dayjs().format('YYYY-MM-DD');
            setFltprd(formattedDate);
          }}
          format="DD-MM-YY"
          closeOnSelect={true}
          disableFuture={true}
          sx={{ maxWidth: '140px' }}
        />
      </LocalizationProvider>
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{ maxWidth: '100%', overflowX: 'auto' }}
      >
        <Table size="small" sx={{ tableLayout: { xs: 'fixed', sm: 'auto' } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                ВАЛ
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                КАНТ
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                BID
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                ASK
              </TableCell>
              {/* {columns.map((colName, idx) => (
                <TableCell key={idx} align="right" sx={{ fontWeight: 'bold' }}>
                  {colName || `Період ${idx + 1}`}
                </TableCell>
              ))} */}
            </TableRow>
          </TableHead>
          <TableBody>
            {transformedData.map((v) => (
              <TableRow
                key={`${v.atclcode}-${v.shop}`}
                // totalRow={totalRow}
                // forceOpen={isAllExpanded}
              >
                <TableCell>
                  {v.qty === 1 ? '' : v.qty} {v.chid}
                </TableCell>
                <TableCell>{v.shop}</TableCell>
                <TableCell align="center">
                  <Stack>
                    <Typography>
                      {v.bidrate !== 0 ? v.bidrate.toFixed(3) : ''}
                    </Typography>
                    {isOwner && (
                      <Typography variant="body2">
                        {v.bidamnt !== 0 ? v.bidamnt.toLocaleString() : ''}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack>
                    <Typography>
                      {v.askrate !== 0 ? v.askrate.toFixed(3) : ''}
                    </Typography>
                    {isOwner && (
                      <Typography variant="body2">
                        {v.askamnt !== 0 ? v.askamnt.toLocaleString() : ''}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter></TableFooter>
          <TableFooter>
            <TableRow>
              <TableCell align="center" colSpan={4}>
                <Typography color="grey.600">
                  Лише стандартні торгові операції (макс.затримка 15хв)
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};
