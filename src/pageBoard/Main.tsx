import { useEffect, useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import { Box } from '@mui/material';
// import { CssBaseline } from '@mui/material';

import { Sign } from '../Sign';
import { RateChart } from '../share/RateChart';
import { useDataStore } from '../store/useDataStore';
import { useUserStore } from '../store/useUserStore';
// import { OfferView } from './OfferView';
import { RateTable } from './RateTable';

import '../style.css';

import { APP_CONFIG } from '../const';
import logo from '../assets/logo-kfk.png';
import HomeIcon from '@mui/icons-material/Home';
import TelegramIcon from '@mui/icons-material/Telegram';
import { maxTime, ratesDataset } from '../lib/rates';
import { humanDate } from '../lib/common';

export function Main() {
  const pubData = useDataStore((state) => state.fetchPubData);
  const pubRefresh = useDataStore((state) => state.startAutoRefresh);
  const { appUser } = useUserStore();
  const { isAuthorized } = useUserStore();
  const footerRight = `v${__APP_VERSION__}  ${new Date().getFullYear()}©`;
  const chartHeight = window.innerHeight * 0.15;
  const avatarSide = `${window.innerHeight * 0.015}px`;
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

  const bulk6Changed = useMemo(() => {
    return humanDate(maxTime(bulk6Dataset));
  }, [bulk6Dataset]);

  useEffect(() => {
    pubData();

    const stopRefresh = pubRefresh(APP_CONFIG.PUB_REFRESH);

    return () => stopRefresh();
  }, [pubData, pubRefresh]);

  return (
    <Box
      className="brd-dash-container"
      style={{
        //   backgroundImage: `url(/img/${bgtheme}/bg${bgno}.jpg)`,
        // backgroundImage: `url(/img/bg1.jpg)`,
        backgroundImage: `url(/img/bg-spring-1.jpg)`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        // backgroundColor: "sandybrown", //"gold", //"#646cffaa",
      }}
    >
      <div className="brd-main-area">
        {/* <CssBaseline /> */}
        <div style={{ height: '100%' }}>
          {!isAuthorized && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Sign />
            </Box>
          )}
          {isAuthorized && (
            <div className="brd-main-area-container  brd-font">
              <div className="brd-main-area-container-top">
                <Box className="brd-component-wrapper">
                  <Box className="brd-component-content">
                    <Box
                      component="img"
                      sx={{
                        width: '60%',
                      }}
                      alt="Logo."
                      src={logo}
                    />
                    <Box sx={{ display: 'flex', gap: '1rem' }}>
                      <Box className="brd-main-socials-container">
                        <HomeIcon />
                        <Box
                          component="img"
                          alt={'web home social'}
                          src={`/img/kantorfk_qr_home.png`}
                          sx={{
                            // height: 50,
                            width: '100%',
                          }}
                        />
                      </Box>
                      <Box className="brd-main-socials-container">
                        <TelegramIcon sx={{ color: '#49a1eb;' }} />
                        <Box
                          component="img"
                          alt={'web tg social'}
                          src={`/img/kantorfk_qr_tg.png`}
                          sx={{
                            // height: 50,
                            width: '100%',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Box className="brd-component-wrapper">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div className="brd-rate-wrapper">
                      <div
                        className="brd-rate-component"
                        style={{ backgroundColor: 'SkyBlue' }}
                      >
                        <div>
                          <div className="brd-table-title">
                            <div>ГУРТ</div>
                            <div>{bulk2Changed}</div>
                          </div>
                          <RateTable
                            data={bulk2Dataset}
                            showCSub={true}
                            // style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <div
                            className="brd-table-title"
                            style={{ fontSize: '80%' }}
                          >
                            <div>КОНВЕРТАЦІЯ</div>
                            <div>{bulk6Changed}</div>
                          </div>
                          <RateTable data={bulk6Dataset} />
                        </div>
                      </div>
                    </div>
                    <div className="brd-rate-wrapper">
                      <div className="brd-rate-component">
                        <div>
                          <div className="brd-table-title">
                            <div>РОЗДРІБ</div>
                            <div>{kant2Changed}</div>
                          </div>
                          <RateTable
                            data={kant2Dataset}
                            showCSub={false}
                            // style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <div className="brd-table-title">
                            <div>РОЗДРІБ, купівля</div>
                          </div>
                          <div className="brd-other-component">
                            {kant4Dataset.map((v) => {
                              return (
                                <div
                                  style={{ display: 'inline-flex' }}
                                  id={v.shop + '-' + v.atclcode}
                                  key={v.shop + '-' + v.atclcode}
                                >
                                  <Avatar
                                    src={`/flag/${v.atclcode}.svg`}
                                    sx={{
                                      width: avatarSide,
                                      height: avatarSide,
                                      border: 'solid lightgrey 1px',
                                    }}
                                  />
                                  &nbsp;{v.chid}&nbsp;
                                  {v.bid.toPrecision(v.bid < 1 ? 3 : 4)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Box>
              </div>
              <div className="brd-component-wrapper">
                <div style={{ fontSize: '100%', color: 'dimgray' }}>
                  Динаміка курсів за місяць
                  <div className="brd-component-content brd-font ">
                    <div style={{ width: '32%', color: 'dimgray' }}>
                      USD / UAH
                      <RateChart
                        chartPrefHeight={chartHeight}
                        cur="840"
                        showFilter={false}
                        showTable={false}
                      />
                    </div>
                    <div style={{ width: '32%', color: 'dimgray' }}>
                      EUR / UAH
                      <RateChart
                        chartPrefHeight={chartHeight}
                        cur="978"
                        showFilter={false}
                        showTable={false}
                      />
                    </div>
                    <div style={{ width: '32%', color: 'dimgray' }}>
                      PLN / UAH
                      <RateChart
                        chartPrefHeight={chartHeight}
                        cur="985"
                        showFilter={false}
                        showTable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="brd-footer-wrapper brd-font">
          <div className="brd-footer-content">
            <div>Курси валют Самбірщини</div>
            <div>{footerRight}</div>
          </div>
        </div>
      </div>
    </Box>
  );
}
