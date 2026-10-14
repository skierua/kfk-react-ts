import { useState, useEffect, useRef } from 'react';

import '../style.css';

// import { useNavigate, useLocation } from 'react-router-dom';
// import { Container } from '@mui/material';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import PriceChangeIcon from '@mui/icons-material/PriceChange';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArchiveIcon from '@mui/icons-material/Archive';

import { VkHeader } from '../share/VkHeader';
import { VkFooter } from '../share/VkFooter';
import { RateView } from './RateView';
import { OfferComponent } from '../share/Offer';
// import { RateComponent } from '../share/Rate';
import { RateChart } from '../share/RateChart';

// import { useDataStore } from '../store/useDataStore';
import { APP_CONFIG } from '../const';
import { useInfoStore } from '../store/useInfoStore';
import { useRateStore } from '../store/useRateStore';
import { useOfferStore } from '../store/useOfferStore';

export const Main = ({ ...other }: any) => {
  const { offers, error } = useOfferStore(); // fetchPubData, startAutoRefresh,
  // const navigate = useNavigate(); // Ініціалізуємо функцію навігації
  // const location = useLocation(); // (Опційно) для відстеження поточного шляху
  const [page, setPage] = useState(0);
  const prevOfferCount = useRef(0);
  // const fetchPubData = useDataStore((state) => state.fetchPubData);
  // const startAutoRefresh = useDataStore((state) => state.startAutoRefresh);
  // if (isPubDataLoading) return <CircularProgress />;
  const currency = useInfoStore((state) => state.fetchCurrencies);

  const rateData = useRateStore((state) => state.fetchDataset);
  const ratesRefresh = useRateStore((state) => state.autoRefresh);

  const offersData = useOfferStore((state) => state.fetchOffers);
  const offersRefresh = useOfferStore((state) => state.autoRefresh);

  if (error) return <Alert severity="error">{error}</Alert>;

  useEffect(() => {
    currency();
    return () => {};
    // return () => {};
  }, [currency]);

  useEffect(() => {
    rateData();

    const stopRefresh = ratesRefresh(APP_CONFIG.PUB_REFRESH);

    return () => stopRefresh();
    // return () => {};
  }, []);

  useEffect(() => {
    // console.log('useEffect offersData STARTED');
    offersData();

    const stopRefresh = offersRefresh(APP_CONFIG.PUB_REFRESH);

    return () => stopRefresh();
    // return () => {};
  }, [offersData, offersRefresh]);

  return (
    <Box {...other}>
      <Container sx={{ flex: 1 }}>
        {/*sx={{ minHeight: '100vh' }} */}
        <VkHeader />
        <Box sx={{ width: '100%', mb: '10px' }}>
          <BottomNavigation
            showLabels
            sx={{ backgroundColor: '#ebf2f0', padding: '8px 0 0 0' }}
            value={page}
            onChange={(_event, newValue) => {
              setPage(newValue);
              if (newValue === 1) {
                prevOfferCount.current = offers.length;
              }
            }}
            // value={location.pathname}
            // onChange={(_event, newValue) => navigate(newValue)}
          >
            <BottomNavigationAction
              label="Курси"
              icon={<PriceChangeIcon />}
              //   disabled={!rates.filter((v) => v.shop === APP_CONFIG.BULK).length}
            />
            <BottomNavigationAction
              label="Заявки"
              icon={
                <Badge
                  badgeContent={offers.length > 0 ? offers.length : null}
                  color={
                    page === 1 || prevOfferCount.current === offers.length
                      ? 'info'
                      : 'warning'
                  }
                >
                  <FavoriteIcon />
                </Badge>
              }
            />
            <BottomNavigationAction label="Архів" icon={<ArchiveIcon />} />
          </BottomNavigation>
        </Box>
        {page === 0 && <RateView />}
        {page === 1 && <OfferComponent showFilter={true} />}
        {page === 2 && <RateChart />}
        <VkFooter />
      </Container>
    </Box>
  );
};
