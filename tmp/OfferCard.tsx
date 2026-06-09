import { Box, Stack } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import CircleIcon from '@mui/icons-material/Circle';
import CallIcon from '@mui/icons-material/Call';

import type { DbOfferType } from '../store/DbTypes';
import { humanDate } from '../lib/common';

interface VkOfferCardPropsType extends React.ComponentPropsWithoutRef<
  typeof Box
> {
  id: string;
  key: string;
  row: DbOfferType;
}

export const OfferCard = ({ row, ...other }: VkOfferCardPropsType) => {
  return (
    <Box component={Paper} sx={{ padding: 1, minWidth: 300 }} {...other}>
      <Stack
        direction={'row'}
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {row.bidask === 'bid' ? (
          <CircleIcon fontSize="small" color="success" />
        ) : (
          <CircleIcon fontSize="small" color="info" />
        )}
        <Typography>{row.bidask === 'bid' ? 'куплю' : 'продам'}</Typography>
        <Avatar
          alt={row.chid}
          src={`./flag/${row.curid}.svg`}
          sx={{
            width: 24,
            height: 24,
            border: 'solid lightgrey 1px',
          }}
        />
        <Typography>{row.chid}</Typography>
        <Typography variant="button" sx={{ fontSize: '125%' }}>
          {Number(row.price).toPrecision(4)}
        </Typography>
        <Typography variant="caption">{humanDate(row.tm)}</Typography>
      </Stack>
      <Stack
        direction={'row'}
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        // justifyContent={'space-between'}
        // alignItems={'center'}
      >
        <Typography>{row.name}</Typography>
        <Typography>{`до ${Math.abs(Number(row.amnt)).toLocaleString(
          'uk-UA',
        )}`}</Typography>
      </Stack>
      {/* <Typography>{`від ${
        Math.abs(row.amnt) < 1500 ? "500" : "1 000"`}
        } до ${Math.abs(row.amnt).toLocaleString("uk-UA")}`}</Typography> */}
      <Stack direction={'row'} spacing={0.5}>
        <CallIcon fontSize="small" />
        {row.tel}
      </Stack>
      {row.onote !== undefined && row.onote !== '' && (
        <Box
          sx={{
            backgroundColor: 'whitesmoke',
            color: 'whitesmoke.contrastText',
            padding: '2px',
          }}
        >
          <Typography>{row.onote}</Typography>
        </Box>
      )}
    </Box>
  );
};
