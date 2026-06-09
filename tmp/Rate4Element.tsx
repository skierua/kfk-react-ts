import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';

import type { DbRateType } from '../store/DbTypes';

interface PropsType extends React.ComponentPropsWithoutRef<typeof Box> {
  id: string;
  key: string;
  data: DbRateType;
}

export const Rate4Element = ({ data, ...other }: PropsType) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      {...other}
    >
      <Avatar
        src={`/flag/${data.atclcode}.svg`}
        sx={{
          width: '1.2rem',
          height: '1.2rem',
          border: 'solid lightgrey 1px',
        }}
      />
      <Typography sx={{ fontSize: '0.85rem' }}>
        {data.chid}&nbsp; {Number(data.bid).toPrecision(4)}
      </Typography>
    </Box>
  );
};
