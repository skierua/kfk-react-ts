// import { useMemo } from 'react';
import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box, { type BoxProps } from '@mui/material/Box';

import type { RateType } from '../lib/types';
import { APP_CONFIG } from '../const';
import { maxTime } from '../lib/rates';
import { RateTable_test, RatePool } from '../share/Rate';
import { humanDate } from '../lib/common';

import { useInfoStore } from '../store/useInfoStore';

export const RateView = ({ ...other }: BoxProps) => {
  return (
    <Box
      // sx={{
      //   width: { xs: '100%', sm: 'auto' },
      // }}
      {...other}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 3 },
          //  gap: '0.5rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: { xs: 1, sm: 3 },
          }}
        >
          <RateWrapper
            shop={APP_CONFIG.BULK}
            typeFilter={2}
            wtitle="ГУРТ"
            wfooter="працюємо з пошкодженими купюрами"
          />
          <RateWrapper
            shop={APP_CONFIG.BULK}
            typeFilter={6}
            wtitle="КОНВЕРТАЦІЯ"
            wfooter="кроскурси вказано для білого долара"
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: { xs: 1, sm: 3 },
          }}
        >
          <RateWrapper shop={APP_CONFIG.KANT} typeFilter={2} wtitle="РОЗДРІБ" />
          <RatePool
            kantFilter={APP_CONFIG.KANT}
            typeFilter={4}
            wtitle="РОЗДРІБ. купівля"
          />
        </Box>
      </Box>
      <Alert
        icon={false}
        severity="warning"
        sx={{ justifyContent: 'center', marginTop: { xs: 1, sm: 3 } }}
      >
        Курси мають виключно інформативний характер.
      </Alert>
    </Box>
  );
};

interface RateWrapperProps extends BoxProps {
  shop: string;
  typeFilter?: number | number[];
  wtitle?: string;
  wfooter?: string;
}

const RateWrapper = ({
  shop,
  typeFilter,
  wtitle,
  wfooter,
  ...other
}: RateWrapperProps) => {
  const crnInfo = useInfoStore((state) => state.currencies);
  const [childData, setChildData] = useState<RateType[]>([]);

  const shopList = useMemo((): string[] => {
    return !!shop ? [shop] : [];
  }, [shop]);

  const curList = useMemo((): string[] => {
    return Object.values(crnInfo)
      .filter((v) => Number(typeFilter) === Number(v.dmst))
      .map((v) => v.id);
  }, [crnInfo, typeFilter]);

  const handleChildDataChanged = (data: RateType[]) => {
    setChildData(data);
  };

  const lastUpdated = useMemo(() => {
    const latestUpdate = maxTime(childData);
    return humanDate((latestUpdate || '') as string);
  }, [childData]);

  return (
    <Box className="adm-dash-container" {...other}>
      <Box className="adm-dash-container-title-wrapper">
        <Box
          sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {wtitle && <div className="adm-dash-container-title">{wtitle}</div>}
        </Box>
        <div className="adm-dash-container-title-tm">{lastUpdated}</div>
      </Box>

      <RateTable_test
        curFilter={curList}
        kntFilter={shopList}
        showFlag={true}
        onDataChange={handleChildDataChanged}
      />
      {wfooter && <Alert severity="info">{wfooter}</Alert>}
    </Box>
  );
};
