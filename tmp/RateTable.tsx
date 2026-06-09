import React from 'react';
import {
  //   Avatar,
  //   Box,
  //   Grid,
  Stack,
  TableFooter,
  Typography,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { grey } from '@mui/material/colors';
const colorset = ['#f2f2f2', '#57ba98', grey[800]];

import { RateRow } from '../share/RateRow';
import type { DbRateType } from '../store/DbTypes';

interface TablePropsType extends React.ComponentPropsWithoutRef<
  typeof TableContainer
> {
  data: DbRateType[];
  title?: string | undefined;
  footer?: string | undefined;
  showFlag?: boolean | undefined;
  showCSub?: boolean | false;
  showKant?: boolean | false;
  bgcolor?: string;
  tm?: string | undefined;
  // children: React.ReactNode;
}

export const RateTable = (props: TablePropsType) => {
  const {
    data,
    title,
    footer,
    showFlag,
    showCSub,
    showKant,
    bgcolor,
    tm,
    ...other
  } = props;
  return (
    <TableContainer component={Paper} {...other}>
      <Table size="small" aria-label="a dense table">
        {title && <Head title={title} bgcolor={bgcolor} tm={tm} />}
        <TableBody>
          {data.map((v) => {
            return (
              (Number(v.bid) !== 0 || Number(v.ask) !== 0) && (
                <RateRow
                  className="rates-table-row"
                  id={`${v.shop}-${v.atclcode}-${v.scode}`}
                  key={`${v.shop}-${v.atclcode}-${v.scode}`}
                  // sub={showCSub}
                  // rate={v}
                  code={v.atclcode}
                  chid={v.chid}
                  flag={(showFlag ?? true) ? v.atclcode : undefined}
                  sname={showCSub ? v.sname : undefined}
                  kant={showKant ? v.shop : undefined}
                  bid={v.bid}
                  ask={v.ask}
                />
              )
            );
          })}
        </TableBody>
        {footer !== undefined && footer !== '' && <Footer footer={footer} />}
      </Table>
    </TableContainer>
  );
};

interface HeadPropsType extends React.ComponentPropsWithoutRef<
  typeof TableHead
> {
  title: string;
  bgcolor?: string;
  tm?: string | undefined;
}

const Head = ({ title, bgcolor, tm, ...other }: HeadPropsType) => {
  return (
    <TableHead {...other}>
      <TableRow>
        <TableCell align="left" colSpan={3} sx={{ bgcolor }}>
          <Stack
            direction={'row'}
            sx={{ width: '100%', justifyContent: 'space-between' }}
          >
            <Typography sx={{ color: grey[800] }}>{title}</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: grey[900] }}>
              {tm ?? ''}
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="center" padding={'none'}>
          <Typography sx={{ fontSize: '0.9rem', color: grey[500] }}>
            назва
          </Typography>
        </TableCell>
        <TableCell
          align="center"
          padding={'none'}
          // width={"18%"}
          sx={{ bgcolor: colorset[0] }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: grey[500] }}>
            купівля
          </Typography>
        </TableCell>
        <TableCell
          align="center"
          padding={'none'}
          // width={"18%"}
          sx={{ bgcolor: colorset[0] }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: grey[500] }}>
            продаж
          </Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

interface FooterPropsType extends React.ComponentPropsWithoutRef<
  typeof TableFooter
> {
  footer: string;
  bgcolor?: string;
}

const Footer = ({ footer, bgcolor, ...other }: FooterPropsType) => {
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
