import { useMemo } from 'react';
import { Alert } from '@mui/material';
import Box, { type BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { RateTable, Rate4Element } from '../share/Rate';

import { useDataStore } from '../store/useDataStore';
import { useUserStore } from '../store/useUserStore';

import { APP_CONFIG } from '../const';
import { ratesDataset, maxTime } from '../lib/rates';
import { humanDate } from '../lib/common';

export const RateView = ({ ...other }: BoxProps) => {
  const { appUser } = useUserStore();
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
      kantFilter: appUser?.term ?? APP_CONFIG.KANT,
      typeFilter: 2,
    });
  }, [rawRates]);

  const kant2Changed = useMemo(() => {
    return humanDate(maxTime(kant2Dataset));
  }, [kant2Dataset]);

  const kant4Dataset = useMemo(() => {
    return ratesDataset({
      data: rawRates,
      kantFilter: appUser?.term ?? APP_CONFIG.KANT,
      typeFilter: 4,
    }).filter((v) => Number(v.bid) !== 0 || Number(v.ask) !== 0);
  }, [rawRates]);

  return (
    <Box {...other}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: '1vw',
          flexWrap: 'wrap',
          // border: '1px solid red',
        }}
      >
        <Box
          sx={{
            width: {
              xs: '100%', // на мобільних
              sm: '50%', // на планшетах
              md: '500px', // на десктопах
            },
            // padding: '0.5rem',
            rowGap: { xs: 1, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'success.light', //'#13b17a', //
            p: 2,
            borderRadius: '15px',
          }}
        >
          <Box className="brd-dash-container-title-wrapper">
            <div className="brd-dash-container-title">ГУРТ</div>
            <div className="brd-dash-container-title-tm">{bulk2Changed}</div>
          </Box>

          <RateTable
            data={bulk2Dataset}
            footer={'працюємо з пошкодженими купюрами'}
            showCSub={true}
          />
          <Box className="brd-dash-container-title-wrapper">
            <div className="brd-dash-container-title">Конвертація</div>
            <div className="brd-dash-container-title-tm">{bulk6Changed}</div>
          </Box>
          <RateTable
            data={bulk6Dataset}
            title={'Конвертація'}
            footer={'кроскурси вказано для білого долара'}
            showCSub={true}
          />
        </Box>

        <Box
          sx={{
            width: {
              xs: '100%', // на мобільних
              sm: '50%', // на планшетах
              md: '500px', // на десктопах
            },
            padding: '0.5rem',
            // gap: '1',
            rowGap: { xs: 1, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box className="brd-dash-container-title-wrapper">
            <div className="brd-dash-container-title">РОЗДРІБ</div>
            <div className="brd-dash-container-title-tm">{kant2Changed}</div>
          </Box>

          <RateTable data={kant2Dataset} showCSub={false} />

          <Box>
            <Box className="brd-dash-container-title-wrapper">
              <div className="brd-dash-container-title">РОЗДРІБ, купівля</div>
            </Box>
            <Box
              component={Paper}
              sx={{
                display: 'flex',
                padding: '5px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
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
        // icon={false}
        severity="info"
        sx={{ justifyContent: 'center', marginTop: '0.5rem' }}
      >
        Курси мають виключно інформативний характер. тел. 096 001 3600
      </Alert>
    </Box>
  );
};
