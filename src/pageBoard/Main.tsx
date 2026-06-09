import { useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
// import { CssBaseline } from '@mui/material';

// import { VkHeader } from '../share/VkHeader';
import { VkFooter } from '../share/VkFooter';
import { Sign } from '../Sign';
import { RateChart } from '../share/RateChart';
import { useDataStore } from '../store/useDataStore';
import { useUserStore } from '../store/useUserStore';
// import { OfferView } from './OfferView';
import { RateView } from './RateView';

import '../style.css';

import { APP_CONFIG } from '../const';
import logo from '../assets/logo-kfk.png';
import HomeIcon from '@mui/icons-material/Home';
import TelegramIcon from '@mui/icons-material/Telegram';

export function Main() {
  const pubData = useDataStore((state) => state.fetchPubData);
  const pubRefresh = useDataStore((state) => state.startAutoRefresh);
  const { isAuthorized } = useUserStore();

  useEffect(() => {
    pubData();

    const stopRefresh = pubRefresh(APP_CONFIG.PUB_REFRESH);

    return () => stopRefresh();
  }, [pubData, pubRefresh]);

  return (
    <Box
      sx={{
        width: '1080px',
        height: '1960px',
      }}
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
      {/* <CssBaseline /> */}
      <Container sx={{ padding: '10px 0', height: '97%' }}>
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
          // <React.Fragment>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              className="main-area-container"
              sx={{
                height: '7%',
              }}
            >
              <Box
                className="main-area-box"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  component="img"
                  sx={{
                    // height: 233,
                    width: { xs: '50%', md: 360 },
                    // maxHeight: { xs: 233, md: 167 },
                    // maxWidth: { xs: 160, md: 240 },
                  }}
                  alt="Logo."
                  src={logo}
                />
                <Box sx={{ display: 'flex', gap: '1rem' }}>
                  <Box className="main-socials-container">
                    <HomeIcon fontSize={'small'} />
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
                  <Box className="main-socials-container">
                    <TelegramIcon
                      fontSize={'small'}
                      sx={{ color: '#49a1eb;' }}
                    />
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
            <Box
              className="main-area-container"
              sx={{
                height: '40%',
              }}
            >
              <Box className="main-area-box">
                <RateView />
                {/* <OfferView /> */}
              </Box>
            </Box>
            <Box className="main-area-container" sx={{ height: '25%' }}></Box>
            <Box
              sx={{
                height: '28%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: '0.5rem',
              }}
            >
              <Box className="main-area-box">
                <Typography>Динаміка курсів за місяць</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: 2,
                  }}
                >
                  <Box sx={{ width: '32%', color: 'dimgray' }}>
                    <Typography>USD / UAH</Typography>
                    <RateChart cur="840" showFilter={false} showTable={false} />
                  </Box>
                  <Box sx={{ width: '32%', color: 'dimgray' }}>
                    <Typography>EUR / UAH</Typography>
                    <RateChart cur="978" showFilter={false} showTable={false} />
                  </Box>
                  <Box sx={{ width: '32%', color: 'dimgray' }}>
                    <Typography>PLN / UAH</Typography>
                    <RateChart cur="985" showFilter={false} showTable={false} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
      <VkFooter />
    </Box>
  );
}
