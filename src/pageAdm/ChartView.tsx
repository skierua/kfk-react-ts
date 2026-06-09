import { useState } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';

import { ChartProfit, type DbChartProfitRow } from '../share/ChartProfit';
import { postData } from '../driver';
// import { useDataStore } from '../store/useDataStore';
import { useUserStore } from '../store/useUserStore';

export const ChartView = ({ ...other }: BoxProps) => {
  const [dataset, setDataset] = useState<DbChartProfitRow[]>([]);
  const showNotification = useUserStore((state) => state.showNotification);

  const handleSubmit = async (data: any) => {
    try {
      const dbData = await postData<any>('/reports', JSON.stringify(data));
      const chartData: DbChartProfitRow[] = dbData.map((item: any) => ({
        acnt: item.acnt,
        shop: item.shop,
        cashier: item.cashier,
        period: item.period,
        total: Number(item.total),
        wage: Number(item.wage),
        cso: Number(item.cso),
        sso: Number(item.sso),
      }));
      setDataset(chartData);
    } catch (err: any) {
      console.error('Error loading reports/profit data:', err.message);
      showNotification('Error loading reports/profit data!', 'error');
      return;
    }
  };

  return (
    <Box {...other}>
      <h2>Графіки та аналітика</h2>
      <p>Тут буде відображатися графік прибутковості та інша аналітика.</p>
      <ChartProfit sqldata={dataset} fsubmit={handleSubmit} />
    </Box>
  );
};
