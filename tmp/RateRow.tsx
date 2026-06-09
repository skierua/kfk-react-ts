import React from 'react';
import { Box, Typography } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { grey } from '@mui/material/colors';

// import type { DbRateType } from '../store/DbTypes';

interface RateRowPropsType extends React.ComponentPropsWithoutRef<
  typeof TableRow
> {
  code: string;
  chid: string;
  flag?: string;
  sname?: string | undefined;
  kant?: string | undefined;
  bid: string;
  ask: string;
}

export const RateRow = ({
  // rate,
  // sub,
  // showKant,
  code,
  chid,
  flag,
  sname,
  kant,
  bid,
  ask,
  ...other
}: RateRowPropsType) => {
  return (
    <TableRow
      // "&:last-child td, &:last-child th": { border: 0 },
      sx={{
        '&:last-child td,  &:last-child th': { border: 0 },
      }}
      {...other}
    >
      <TableCell align="center">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {flag && (
            <Box
              component="img"
              sx={{
                height: '1.4rem', //{ xs: "1rem", md: "3vmin" },
                // width: "32px",
                maxHeight: { xs: 233, md: 167 },
                // maxWidth: { xs: 350, md: 250 },
                border: 'solid lightgrey 1px',
                borderRadius: 1,
              }}
              alt={chid}
              src={`/flag/${flag}.svg`}
            />
          )}
          {kant && <Typography sx={{ fontSize: '80%' }}>{kant}</Typography>}
          <Typography>{chid}</Typography>
          {sname && (
            <Typography color={grey[800]} variant="caption">
              {sname}
            </Typography>
          )}
        </Box>
      </TableCell>
      <RateCell className="rates-table-cell-amnt" amnt={bid} />
      <RateCell className="rates-table-cell-amnt" amnt={ask} />
    </TableRow>
  );
};

interface RateCellPropsType extends React.ComponentPropsWithoutRef<
  typeof TableCell
> {
  amnt: string;
}

const RateCell = ({ amnt, ...other }: RateCellPropsType) => {
  return (
    <TableCell align="center" {...other}>
      <Typography color={grey[800]}>
        {Number(amnt) !== 0 ? Number(amnt).toPrecision(4) : ''}
      </Typography>
    </TableCell>
  );
};
