import { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box, { type BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';
// import { grey } from '@mui/material/colors';

import { RateWrapper, Rate4Element } from '../share/Rate';
// import { RateTable } from '../share/RateTable';

import { useDataStore } from '../store/useDataStore';
import { APP_CONFIG } from '../const';
import { ratesDataset, maxTime } from '../lib/rates';
import { humanDate } from '../lib/common';

export const RateView = ({ ...other }: BoxProps) => {
  const rawRates = useDataStore((state) => state.rates);
  const bulk2Dataset = useMemo(() => {
    return ratesDataset({
      data: rawRates,
      kantFilter: APP_CONFIG.BULK,
      typeFilter: 2,
    });
  }, [rawRates]);

  const bulk2Changed = useMemo(() => {
    return humanDate(maxTime(bulk2Dataset));
  }, [bulk2Dataset]);

  const bulk6Dataset = useMemo(() => {
    return ratesDataset({
      data: rawRates,
      kantFilter: APP_CONFIG.BULK,
      typeFilter: 6,
    });
  }, [rawRates]);

  const bulk6Changed = useMemo(() => {
    return humanDate(maxTime(bulk6Dataset));
  }, [bulk6Dataset]);

  const kant2Dataset = useMemo(() => {
    return ratesDataset({
      data: rawRates,
      kantFilter: APP_CONFIG.KANT,
      typeFilter: 2,
    });
  }, [rawRates]);

  const kant2Changed = useMemo(() => {
    return humanDate(maxTime(kant2Dataset));
  }, [kant2Dataset]);

  const kant4Dataset = useMemo(() => {
    return ratesDataset({
      data: rawRates,
      kantFilter: APP_CONFIG.KANT,
      typeFilter: 4,
    }).filter((v) => Number(v.bid) !== 0 || Number(v.ask) !== 0);
  }, [rawRates]);

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
            // p: 1,
            // gap: '0.5rem',
          }}
        >
          <RateWrapper
            data={bulk2Dataset}
            maxTime={bulk2Changed}
            wtitle="ГУРТ"
            wfooter="працюємо з пошкодженими купюрами"
            // sx={{ backgroundColor: '#13b17a' }}
            // sx={{ width: '100%' }}
          />
          <RateWrapper
            data={bulk6Dataset}
            maxTime={bulk6Changed}
            wtitle="КОНВЕРТАЦІЯ"
            // wfooter="test"
            wfooter="кроскурси вказано для білого долара"
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: { xs: 1, sm: 3 },
            // gap: '0.5rem'
          }}
        >
          <RateWrapper
            data={kant2Dataset}
            maxTime={kant2Changed}
            wtitle="РОЗДРІБ"
          />

          <Box className="adm-dash-container" {...other}>
            <Box className="adm-dash-container-title-wrapper">
              <Box className="adm-dash-container-title">РОЗДРІБ. купівля</Box>
            </Box>
            <Box
              component={Paper}
              sx={{
                width: { xs: 'auto', sm: '360px' },
                display: 'flex',
                padding: '5px',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              {kant4Dataset.map((v) => {
                return (
                  <Rate4Element
                    id={v.shop + '-' + v.atclcode}
                    key={v.shop + '-' + v.atclcode}
                    data={v}
                  />
                );
              })}
            </Box>
          </Box>
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
