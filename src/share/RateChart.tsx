import React, { useEffect, useState } from 'react';
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
import { getData } from '../driver';
import type { DbArchRateType } from '../store/DbTypes';

interface RateChartPropsType extends React.ComponentPropsWithoutRef<
  typeof Box
> {
  cur?: string;
  period?: Date;
  showFilter?: boolean;
  showTable?: boolean;
}

interface CharDataType {
  x: string;
  period: string;
  bid: number;
  ask: number;
  [key: string]: any;
}

export const RateChart = ({
  cur,
  period,
  showFilter,
  showTable,
  ...other
}: RateChartPropsType) => {
  const [fltcur, setFltcur] = useState<string>(cur ?? '840'); // currency filter
  const [fltprd, setFltprd] = useState<Date>(period ?? new Date()); // period filter
  const [chartData, setChartData] = useState<CharDataType[]>([]);

  // const chartHeight: string = () => {
  //   return ((showTable ?? true) ? '250px' : '100%');
  // };
  const transformData = (data: DbArchRateType[]) => {
    let res: CharDataType[] = [];
    if (data.length == 0) {
      setChartData(res);
    }
    for (let i = 0; i < data.length; ++i) {
      res.push({
        x: data[i].period, //.slice(-2),
        period: data[i].period.slice(-4).replace('-', ''),
        bid: Number(data[i].beq) / Number(data[i].bamnt), //.toFixed(2)
        ask: Number(data[i].aeq) / Number(data[i].aamnt), //.toFixed(2)
      });
    }
    // return ret;
    setChartData(res);
  };

  useEffect(() => {
    (async () => {
      const dateStr = fltprd.toISOString().split('T')[0];
      const ratesData = await getData<DbArchRateType[]>(
        '/archive',
        `reqid=ratesAvrg&period=${dateStr}&cur=${fltcur}`,
      );
      transformData(ratesData);
    })();
  }, [fltprd, fltcur]);

  return (
    <Box {...other}>
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
              onChange={(v) =>
                setFltprd(
                  new Date(v ? v.toISOString() : new Date().toISOString()),
                )
              }
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
        height={250}
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
                {chartData.map((v) => {
                  return <Row id={v.period} key={v.period} itm={v} />;
                })}
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
