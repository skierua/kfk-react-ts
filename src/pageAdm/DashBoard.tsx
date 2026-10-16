import { useMemo, useState } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { BalanceComponent } from '../share/Balance';
import { RateTable_test } from '../share/Rate';
import { OfferComponent } from '../share/Offer';
// import { balanceDataset } from '../lib/balance';
import { VkToggle, type VkToggleDataType } from '../share/VkToggle';

import { APP_CONFIG } from '../const';

import { useInfoStore } from '../store/useInfoStore';
import { useUserStore } from '../store/useUserStore';
import { foreignDataset } from '../lib/currencies';

export const DashBoard = ({ ...other }: any) => {
  // const { lastShift, balance } = useUserStore();
  const appUser = useUserStore((state) => state.appUser);

  const cashAcnt: string = useMemo(() => {
    return String(appUser?.role || '') === 'owner' ? '30' : '3000';
  }, [appUser]);

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
            <BalanceComponent balAcnt={'35'} />
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
            <BalanceComponent balAcnt={cashAcnt} />
          </Box>
          {/* <Box
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
            <BalanceComponent balAcnt={'3003'} />
          </Box> */}
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
        <RateWrapper />
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

const RateWrapper = ({ ...other }: BoxProps) => {
  const kntInfo = useInfoStore((state) => state.shops);
  const crnInfo = useInfoStore((state) => state.currencies);
  const [bulk, setBulk] = useState(true);
  const [knt, setKnt] = useState('');

  const kntToggleList = useMemo((): VkToggleDataType[] => {
    return Object.values(kntInfo)
      .filter((v) =>
        bulk
          ? v.name === String(APP_CONFIG.BULK || '')
          : v.name !== String(APP_CONFIG.BULK || ''),
      )
      .sort((a, b) => Number(a.so) - Number(b.so))
      .map((v) => ({
        id: v.name,
        sname: v.name,
      }));
  }, [kntInfo, bulk]);

  const kntFilter = useMemo(() => {
    if (bulk) {
      return [APP_CONFIG.BULK];
    } else {
      return !!knt ? [knt] : kntToggleList.map((v) => v.id);
    }
    return [];
  }, [bulk, knt, kntToggleList]);

  const curList = useMemo((): string[] => {
    return foreignDataset(Object.values(crnInfo))
      .filter((v) => Number(v.so) < 30)
      .map((v) => v.id);
  }, [crnInfo]);

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
          data={kntToggleList}
          dflt={knt}
          label="Кантор"
          limit={3}
          fcb={(v) => setKnt(v)}
        />
        <FormControlLabel
          control={<Switch />}
          sx={{ size: 'small' }}
          label="ГУРТ"
          checked={bulk}
          onChange={(_e, checked) => {
            // setKnt(checked ? APP_CONFIG.BULK : '');
            setBulk(checked);
            setKnt('');
          }}
        />
      </Box>

      <RateTable_test
        curFilter={curList}
        kntFilter={kntFilter}
        showFlag={false}
      />
    </Box>
  );
};
