import { useEffect, useMemo, useState } from 'react';
import { Box, type BoxProps } from '@mui/material';
// import { CssBaseline } from '@mui/material';

import type { RateType } from '../lib/types';
import { Sign } from '../Sign';
import { RateChart } from '../share/RateChart';

import { useInfoStore } from '../store/useInfoStore';
import { useUserStore } from '../store/useUserStore';
import { useRateStore } from '../store/useRateStore';

import { RateTableBoard, RatePoolBoard } from './RateTable';

import '../style.css';

import { APP_CONFIG } from '../const';
import logo from '../assets/logo-kfk.png';
import HomeIcon from '@mui/icons-material/Home';
import TelegramIcon from '@mui/icons-material/Telegram';
import { maxTime } from '../lib/rates';
import { humanDate } from '../lib/common';

export function Main() {
  const appUser = useUserStore((state) => state.appUser);
  const isAuthorized = useUserStore((state) => state.isAuthorized);
  const currency = useInfoStore((state) => state.fetchCurrencies);
  const ratesData = useRateStore((state) => state.fetchDataset);
  const ratesRefresh = useRateStore((state) => state.autoRefresh);

  const footerRight = `v${__APP_VERSION__}  ${new Date().getFullYear()}©`;
  const chartHeight = window.innerHeight * 0.15;

  useEffect(() => {
    currency();

    return () => {};
    // return () => {};
  }, [currency]);

  useEffect(() => {
    ratesData();

    const stopRefresh = ratesRefresh(APP_CONFIG.PUB_REFRESH);

    return () => stopRefresh();
    // return () => {};
  }, [ratesData, ratesRefresh]);

  const crntTerm = useMemo(() => {
    return appUser?.term ?? '';
  }, [appUser]);

  const bulkTerm = useMemo(() => {
    return APP_CONFIG?.BULK ?? '';
  }, [APP_CONFIG]);

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
                        <RateWrapper
                          shop={bulkTerm}
                          typeFilter={2}
                          wtitle={'ГУРТ'}
                        />
                        <RateWrapper
                          shop={bulkTerm}
                          typeFilter={6}
                          wtitle={'КОНВЕРТАЦІЯ'}
                        />
                      </div>
                    </div>
                    <div className="brd-rate-wrapper">
                      <div className="brd-rate-component">
                        <RateWrapper
                          shop={crntTerm}
                          typeFilter={2}
                          wtitle={'РОЗДРІБ'}
                        />
                        <RatePoolBoard shop={crntTerm} />
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

interface RateWrapperProps extends BoxProps {
  shop: string;
  typeFilter?: number | number[];
  wtitle?: string;
  // wfooter?: string;
}

const RateWrapper = ({
  shop,
  typeFilter,
  wtitle,
  // wfooter,
  // ...other
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
    <div>
      <div className="brd-table-title">
        {/* <div>ГУРТ</div> */}
        {wtitle && <div className="adm-dash-container-title">{wtitle}</div>}
        <div>{lastUpdated}</div>
      </div>
      <RateTableBoard
        curFilter={curList}
        kntFilter={shopList}
        onDataChange={handleChildDataChanged}
        // showCSub={true}
        // style={{ width: '100%' }}
      />
    </div>
  );
};
