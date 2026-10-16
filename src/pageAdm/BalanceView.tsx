import { useMemo, useState, useEffect } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';

import { BalanceComponent } from '../share/Balance';
import { VkToggle } from '../share/VkToggle';
import { useUserStore } from '../store/useUserStore';
// import { balanceDataset } from '../lib/balance';

const ROLE_MENUS: Record<string, { name: string; id: string }[]> = {
  owner: [
    { name: 'Каса', id: '30' },
    { name: 'Trade', id: '35' },
    { name: 'Борг', id: '36' },
    { name: 'Кап', id: '42' },
  ],
  kant: [
    { name: 'Каса', id: '3000' },
    { name: 'ДепКом', id: '3002' },
    { name: 'Інкас', id: '3003' },
    { name: 'Trade', id: '35' },
    { name: 'Борг', id: '36' },
    { name: 'Капітал', id: '42' },
  ],
};

export const BalanceView = ({ ...other }: BoxProps) => {
  const { appUser } = useUserStore();
  const [bal, setBal] = useState('');

  const balToggleList = useMemo(() => {
    return ROLE_MENUS[appUser?.role ?? ''] ?? [];
  }, [appUser?.role]);

  useEffect(() => {
    if (balToggleList.length > 0 && !bal) {
      setBal(balToggleList[0].id);
    }
  }, [balToggleList, bal]);

  return (
    <Box
      className="adm-dash-container"
      sx={{
        width: { xs: 'auto', sm: '360px' },
      }}
      {...other}
    >
      <VkToggle
        data={balToggleList}
        dflt={bal}
        limit={5}
        allowAll={false}
        fcb={(v) => setBal(v)}
      />
      <Box className="adm-dash-container-title-wrapper">
        <Box className="adm-dash-container-title">Balance</Box>
      </Box>
      <BalanceComponent balAcnt={bal} activeOnly={false} />
    </Box>
  );
};
