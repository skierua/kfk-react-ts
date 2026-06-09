import { useMemo } from 'react';
import Box from '@mui/material/Box';

import { BalanceComponent } from '../share/Balance';
import { RateComponent } from '../share/Rate';
import { OfferComponent } from '../share/Offer';
import { useUserStore } from '../store/useUserStore';
import { balanceDataset } from '../lib/balance';

export const DashBoard = ({ ...other }: any) => {
  const { lastShift, balance } = useUserStore();
  const { appUser } = useUserStore();

  const cashDataset = useMemo(() => {
    if (!appUser) return [];
    if (appUser.role === 'owner') {
      return balanceDataset({
        data: balance,
        bal: '30',
        sortFilter: 30,
        shft: lastShift,
      });
    } else if (appUser.role === 'kant') {
      return balanceDataset({
        data: balance,
        bal: '3000',
        sortFilter: 30,
        shft: lastShift,
      }).filter((v) => v.shop === appUser.term);
    }
    return [];
  }, [balance, lastShift]);

  const inkasDataset = useMemo(() => {
    if (!appUser) return [];
    return balanceDataset({
      data: balance,
      bal: '3003',
      sortFilter: 30,
      shft: lastShift,
    });
  }, [balance, lastShift]);

  const tradeDataset = useMemo(() => {
    if (!appUser) return [];
    return balanceDataset({
      data: balance,
      bal: '35',
      sortFilter: 30,
      shft: lastShift,
    });
  }, [balance, lastShift]);

  return (
    // <Box sx={{ display: "flex", flexWrap: "wrap" }} {...other}>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }} {...other}>
      {!!appUser && (
        <>
          <Box
            className="adm-dash-container"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              // borderWidth: { xs: '0', sm: '1px' },
            }}
          >
            <Box className="adm-dash-container-title-wrapper">
              <Box className="adm-dash-container-title">TRADE</Box>
            </Box>
            <BalanceComponent data={tradeDataset} />
          </Box>
          <Box
            className="adm-dash-container"
            sx={{
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Box className="adm-dash-container-title-wrapper">
              <Box className="adm-dash-container-title">Cash</Box>
            </Box>
            <BalanceComponent data={cashDataset} />
          </Box>
          <Box
            className="adm-dash-container"
            sx={{
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Box className="adm-dash-container-title-wrapper">
              <Box className="adm-dash-container-title">
                Внутрішня інкасація
              </Box>
            </Box>
            <BalanceComponent data={inkasDataset} />
          </Box>
        </>
      )}
      <Box
        className="adm-dash-container"
        sx={{
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <Box className="adm-dash-container-title-wrapper">
          <Box className="adm-dash-container-title">Rates</Box>
        </Box>
        <RateComponent showFlag={false} curSortFilter={30} />
      </Box>
      <Box
        className="adm-dash-container"
        sx={{
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <Box className="adm-dash-container-title-wrapper">
          <Box className="adm-dash-container-title">Offers</Box>
        </Box>
        <OfferComponent mode="table" showFilter={true} />
      </Box>
    </Box>
  );
};
