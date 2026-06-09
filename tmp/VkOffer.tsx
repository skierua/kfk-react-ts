import React, { useState } from 'react';
import { Alert, Box, Container, Stack } from '@mui/material';
// import Typography from '@mui/material/Typography';

import { OfferCard } from '../share/Offer';
import { VkToggle } from '../share/VkToggle';

import type { VkToggleDataType } from '../share/VkToggle';
import type { DataState } from '../store/useDataStore';
import { useDataStore } from '../store/useDataStore';

interface VkOfferPropsType extends React.ComponentPropsWithoutRef<typeof Box> {}

const selectActiveOffers = (state: DataState, fltba: string, fltcur: string) =>
  state.offers.filter(
    (offer) =>
      (fltba === '' || fltba === offer.bidask) &&
      (fltcur === '' || fltcur === offer.chid),
  );

const selectCurOffers = (state: DataState): VkToggleDataType[] => {
  if (state.offers.length == 0) {
    return [];
  }
  let lst: VkToggleDataType[] = [];
  state.offers.forEach((v) => {
    if (!lst.some((l) => l.id === v.chid)) {
      lst.push({
        id: v.chid,
        sname: v.chid,
        name: v.name,
      });
    }
  });
  return lst;
};

export const VkOffer = ({ ...other }: VkOfferPropsType) => {
  // console.log(offers);
  const [fltba, setFltba] = useState('');
  const [fltcur, setFltcur] = useState('');

  const activeOffers = selectActiveOffers(useDataStore(), fltba, fltcur);
  const curForToggle = selectCurOffers(useDataStore());

  return (
    // offers.length !== 0 && (
    <Box {...other}>
      <Stack spacing={1} sx={{ width: '100%' }}>
        <Stack
          direction={'row'}
          spacing={1}
          useFlexGap
          sx={{
            // alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <VkToggle
            data={[
              { id: 'bid', name: 'куп' },
              { id: 'ask', name: 'прод' },
            ]}
            dflt={fltba}
            fcb={(v) => setFltba(v)}
          />
          <VkToggle
            data={curForToggle}
            dflt={fltcur}
            limit={3}
            label="Валюта"
            fcb={(v) => setFltcur(v)}
          />
        </Stack>
        {/* <Container sx={{ textAlign: 'center' }}> */}
        <Stack
          direction="row"
          useFlexGap
          spacing={1}
          sx={{
            // alignItems: 'center',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {activeOffers.map((v) => {
            return (
              // (fltba === '' || fltba === v.bidask) &&
              // (fltcur === '' || fltcur === v.chid) && (
              <OfferCard id={'ppid_' + v.oid} key={'ppkey_' + v.oid} row={v} />
              // )
            );
          })}
        </Stack>
        {/* </Container> */}
        <Alert
          icon={false}
          severity="warning"
          sx={{ justifyContent: 'center' }}
        >
          {/* <Typography variant="caption"> */}
          Сайт не несе відповідальності за зміст оголошень.
          {/* </Typography> */}
        </Alert>
      </Stack>
    </Box>
    // )
  );
};
