import React, { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
} from '@mui/material';

import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { LineChart } from '@mui/x-charts/LineChart';
import { grey } from '@mui/material/colors';

import { VkToggle } from './VkToggle';
import type { DbDayCurRsltType } from '../store/DbTypes';
import { useRepoStore } from '../store/useRepoStore';

interface RateChartPropsType extends React.ComponentPropsWithoutRef<
  typeof Box
> {
  chartPrefHeight?: number;
  cur?: string;
  period?: Date;
  showFilter?: boolean;
  showTable?: boolean;
  style?: React.CSSProperties;
}

interface CharDataType {
  x: string;
  // period: string;
  bid: number;
  ask: number;
  [key: string]: any;
}

interface DbArchRateTransformedType {
  period: string; // "2026-04-11"
  bamnt: number; // "26000"
  beq: number; // "1137890"
  bmin: number; // "43.4"
  bmax: number; // "43.8"
  aamnt: number; // "-43340"
  aeq: number; // "-1903000"
  amin: number; // "43.8"
  amax: number; // "44"
}

const transformData = (data: DbDayCurRsltType[]): CharDataType[] => {
  if (data.length == 0) {
    return [];
  }
  const map = new Map<string, DbArchRateTransformedType>();
  for (let r of data) {
    const periodKey = r.period;
    if (!map.has(periodKey)) {
      map.set(periodKey, {
        period: r.period,
        bamnt: 0,
        beq: 0,
        bmin: 0,
        bmax: 0,
        aamnt: 0,
        aeq: 0,
        amin: 0,
        amax: 0,
      });
    }
    const existingData = map.get(periodKey);
    if (existingData) {
      if (r.ba === 'buy') {
        existingData.bamnt += Number(r.amnt);
        existingData.beq += Number(r.eq);
        existingData.bmin = Number(r.minrate);
        existingData.bmax = Number(r.maxrate);
      } else if (r.ba === 'sell') {
        existingData.aamnt += Number(r.amnt);
        existingData.aeq += Number(r.eq);
        existingData.amin = Number(r.minrate);
        existingData.amax = Number(r.maxrate);
      }
    }
  }
  const tmpRes: CharDataType[] = [];
  for (let r of map.values()) {
    tmpRes.push({
      x: r.period,
      // period: periodKey.slice(-4).replace('-', ''),
      bid: r.beq / r.bamnt,
      ask: r.aeq / r.aamnt,
    });
  }
  const res: CharDataType[] = tmpRes.sort((a, b) => a.x.localeCompare(b.x));
  // console.log('res', res);
  return res;
};

export const RateChart = ({
  chartPrefHeight = 250,
  cur,
  period,
  showFilter,
  showTable,
  style,
  ...other
}: RateChartPropsType) => {
  const [fltcur, setFltcur] = useState<string>(cur ?? '840'); // currency filter
  const [fltprd, setFltprd] = useState<string>(
    new Date().toISOString().split('T')[0],
  ); // period filter
  // const [chartData, setChartData] = useState<CharDataType[]>([]);
  const rawData = useRepoStore((state) => state.dayCurRslt);
  const fetchData = useRepoStore((state) => state.fetchDayCurRslt);

  useEffect(() => {
    fetchData(fltprd);
  }, [fetchData, fltprd]);
  // console.log('rawData', rawData);

  const chartData = useMemo(() => {
    const filteredData = rawData.filter((item) => item.atclcode === fltcur);
    const transformedData = transformData(filteredData);
    return transformedData;
  }, [rawData, fltcur]);

  const tableData = useMemo(() => {
    const rev = [...chartData].reverse();
    return rev;
  }, [chartData]);

  return (
    <Box {...other} style={style}>
      {/* <React.Fragment {...other}> */}
      <CssBaseline />
      {/* <Container maxWidth="sm"> */}
      {(showFilter ?? true) && (
        <Stack direction={'row'} spacing={2} sx={{ justifyContent: 'center' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* <DemoContainer components={["DatePicker"]}> */}
            <DatePicker
              label="Місяць до"
              views={['day', 'month', 'year']}
              slotProps={{ textField: { size: 'small' } }}
              value={dayjs(fltprd)}
              // value={dayjs(period)}
              onChange={(v) => {
                const formattedDate = v
                  ? v.format('YYYY-MM-DD')
                  : dayjs().format('YYYY-MM-DD');
                setFltprd(formattedDate);
                // setFltprd(
                //   new Date(v ? v.toISOString() : new Date().toISOString()),
                // )
              }}
              format="DD-MM-YY"
              // minDate="01-01-2024"
              closeOnSelect={true}
              disableFuture={true}
              sx={{ maxWidth: '140px' }}
            />
            {/* </DemoContainer> */}
          </LocalizationProvider>
          <VkToggle
            data={[
              { id: '840', sname: 'USD' },
              { id: '978', sname: 'EUR' },
              { id: '985', sname: 'PLN' },
            ]}
            dflt={fltcur}
            limit={3}
            label="Валюта"
            allowAll={false}
            fcb={(v) => setFltcur(v)}
          />
        </Stack>
      )}
      <LineChart
        // width="100%"
        height={chartPrefHeight}
        series={
          (showTable ?? true)
            ? [
                {
                  id: 'bid-line',
                  dataKey: 'bid',
                  label: 'куп',
                  showMark: false, //({ index }) => index % 4 === 0,
                },
                {
                  id: 'ask-line',
                  dataKey: 'ask',
                  label: 'прод',
                  showMark: false, //({ index }) => index % 4 === 0,
                },
              ]
            : [
                {
                  id: 'bid-line',
                  dataKey: 'bid',
                  showMark: false, //({ index }) => index % 4 === 0,
                },
                {
                  id: 'ask-line',
                  dataKey: 'ask',
                  showMark: false, //({ index }) => index % 4 === 0,
                },
              ]
        }
        // xAxis={[{ scaleType: "band", dataKey: "month" }]}
        xAxis={[
          {
            dataKey: 'x',
            scaleType: 'point',
            valueFormatter: (value) => value.slice(-2),
            // max: 31,
          },
        ]}
        dataset={chartData}
        sx={{
          // Звертаємося до конкретної лінії за класом та ID
          '& .MuiLineElement-series-bid-line': {
            strokeWidth: 2,
          },
          '& .MuiLineElement-series-ask-line': {
            strokeWidth: 2,
          },
        }}
      />
      {(showTable ?? true) && (
        <Box>
          <TableContainer>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '0.9rem', color: grey[500] }}>
                      день
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '0.9rem', color: grey[500] }}>
                      купівля
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '0.9rem', color: grey[500] }}>
                      продаж
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((v) => {
                  return <Row id={v.x} key={v.x} itm={v} />;
                })}
                {/* {(() => {
                  const rev = [...chartData].reverse();
                  return rev.map((v) => {
                    return <Row id={v.period} key={v.period} itm={v} />;
                  });
                })()} */}
              </TableBody>
            </Table>
          </TableContainer>
          <Alert
            icon={false}
            severity="warning"
            sx={{ justifyContent: 'center' }}
          >
            <Typography variant="caption">
              Вказано середній курс операцій за період
            </Typography>
          </Alert>
        </Box>
      )}
      {/* </Container> */}
      {/* </React.Fragment> */}
    </Box>
  );
};

interface RateChartRowPropsType extends React.ComponentPropsWithoutRef<
  typeof TableRow
> {
  itm: CharDataType;
}

const Row = ({ itm, ...other }: RateChartRowPropsType) => {
  return (
    <TableRow
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
      }}
      {...other}
    >
      <TableCell align="center">
        <Typography>
          {Intl.DateTimeFormat('uk-UA', {
            day: 'numeric',
            month: 'short',
          }).format(new Date(itm.x))}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography>{itm.bid.toFixed(2)}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography>{itm.ask.toFixed(2)}</Typography>
      </TableCell>
    </TableRow>
  );
};
