import { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
// import { CssBaseline } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import BarChartIcon from '@mui/icons-material/BarChart';
// import MailIcon from "@mui/icons-material/Mail";

// import { VkHeader } from '../share/VkHeader';
import { VkFooter } from '../share/VkFooter';
import { Sign } from '../Sign';
// import { RateChart } from '../share/RateChart';
import { DashBoard } from './DashBoard';
import { BalanceView } from './BalanceView';
import { OfferView } from './OfferView';

import { useDataStore } from '../store/useDataStore';
import { useUserStore } from '../store/useUserStore';
// import { OfferView } from './OfferView';
// import { RateView } from './RateView';
// import './Main.css';

import { APP_CONFIG } from '../const';
import { RateView } from './RateView';
// import { ProfitTable } from '../share/Profit';
import { ProfitView } from './ProfitView';
// import { ChartView } from './ChartView';
const drawerWidth = 180;

const DrawerMenuIcon = ({ route }: { route: string }) => {
  // console.log(props.icon);
  if (route == 'home') {
    return <HomeIcon />;
  } else if (route == 'profit') {
    return <ListAltIcon />;
  } else if (route == 'rate') {
    return <PriceChangeIcon />;
  } else if (route == 'vwbalance') {
    return <InboxIcon />;
  } else if (route == 'vwrate') {
    return <PriceChangeIcon />;
  } else if (route == 'chart') {
    return <BarChartIcon />;
  } else {
    return <InboxIcon />;
  }
};

const MENU1 = [
  { route: 'home', text: 'Home' },
  { route: 'rate', text: 'Rates' },
  { route: 'offer', text: 'Offers' },
];

const MENU2 = [
  { route: 'vwbalance', text: 'Balance' },
  // { route: 'vwrate', text: 'AvrgRates' },
  { route: 'vwprofit', text: 'Profit' },
  // { route: 'vwchart', text: 'Chart' },
  // { route: "sse", text: "SSE test" },
];

export function Main({ window }: { window?: () => Window }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const ratesData = useDataStore((state) => state.fetchRates);
  const ratesRefresh = useDataStore((state) => state.ratesAutoRefresh);

  const offersData = useDataStore((state) => state.fetchOffers);
  const offersRefresh = useDataStore((state) => state.offersAutoRefresh);

  const balance = useUserStore((state) => state.fetchBalance);
  const refreshBalance = useUserStore((state) => state.refreshBalance);
  // const usr = useUserStore((state) => state.appUser);

  const authorized = useUserStore((state) => state.isAuthorized);
  const [route, setRoute] = useState<string>('home');

  useEffect(() => {
    ratesData();

    const stopRefresh = ratesRefresh(APP_CONFIG.PUB_REFRESH);

    return () => stopRefresh();
    // return () => {};
  }, [ratesData, ratesRefresh]);

  useEffect(() => {
    offersData();

    const stopRefresh = offersRefresh(APP_CONFIG.PUB_REFRESH);

    return () => stopRefresh();
    // return () => {};
  }, [offersData, offersRefresh]);

  useEffect(() => {
    // console.log('useEffect STARTED');
    if (!authorized) return () => {};
    balance();

    const stopRefresh = refreshBalance(APP_CONFIG.BALANCE_REFRESH);

    return () => stopRefresh();
    // return () => {};
  }, [authorized, balance, refreshBalance]);

  //   const drawer = useMemo(() => {
  // return (
  const drawer = (
    <div>
      <Toolbar>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => {
            // load();
          }}
        >
          Refresh
        </Button>
      </Toolbar>
      <Divider />
      <List>
        {MENU1.map((v) => (
          <ListItem key={v.text} disablePadding>
            <ListItemButton
              onClick={() => {
                //   console.log("#2d8j onListItem_click route=" + v.route);
                setRoute(v.route);
                handleDrawerClose();
              }}
            >
              <ListItemIcon>
                <DrawerMenuIcon route={v.route} />
                {/* {i % 2 === 0 ? <InboxIcon /> : <MailIcon />} */}
              </ListItemIcon>
              <ListItemText primary={v.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {MENU2.map((v) => (
          <ListItem key={v.text} disablePadding>
            <ListItemButton
              onClick={() => {
                //   console.log("#2d8j onListItem_click route=" + v.route);
                setRoute(v.route);
                handleDrawerClose();
              }}
            >
              <ListItemIcon>
                <DrawerMenuIcon route={v.route} />
                {/* {i % 2 === 0 ? <InboxIcon /> : <MailIcon />} */}
              </ListItemIcon>
              <ListItemText primary={v.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
  //   }, []);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };
  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box
    //   sx={{
    //     width: '1080px',
    //     height: '1960px',
    //   }}
    >
      {/* <CssBaseline /> */}
      <Container>
        {!authorized && <Sign />}
        {authorized && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* <CssBaseline /> */}
            <Box
              sx={{
                // position: 'fixed', // Фіксоване позиціювання
                width: { sm: `calc(100% - ${drawerWidth}px)` }, // ширина для десктопів
                ml: { sm: `${drawerWidth}px` }, // margin-left для десктопів
                // bgcolor: 'red',
              }}
            >
              <Toolbar
                sx={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { sm: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
                <Box
                  component="img"
                  sx={{
                    // height: 233,
                    width: 200,
                    // maxHeight: { xs: 233, md: 167 },
                    maxWidth: { xs: 160, md: 240 },
                  }}
                  alt="Logo."
                  src={`/img/logo-kfk.png`}
                />
              </Toolbar>
            </Box>
            <Box
              component="nav"
              sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
              aria-label="mailbox folders"
            >
              <Drawer
                container={container}
                variant="temporary"
                open={mobileOpen}
                onTransitionEnd={handleDrawerTransitionEnd}
                onClose={handleDrawerClose}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                  display: { xs: 'block', sm: 'none' },
                  '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    // bgcolor: "red",
                  },
                }}
              >
                {drawer}
              </Drawer>
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                  },
                }}
                open
              >
                {drawer}
              </Drawer>
            </Box>
            <Box
              component="main"
              sx={{
                // display: 'flex',
                // position: 'fixed',
                flexGrow: 1,
                p: 1,
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` }, // margin-left для десктопів
                // bgcolor: 'lightblue',
              }}
            >
              {route == 'home' && <DashBoard />}

              {route == 'offer' && <OfferView />}
              {route == 'rate' && <RateView />}

              {route == 'vwbalance' && <BalanceView />}
              {route == 'vwprofit' && <ProfitView />}
              {/* {route == 'vwchart' && <ChartView />} */}
            </Box>
          </Box>
        )}
      </Container>
      <VkFooter sx={{ ml: { sm: `${drawerWidth}px` } }} />
    </Box>
  );
}
