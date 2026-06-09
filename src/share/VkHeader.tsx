// import React from 'react';
import { AppBar, Box, Stack, Toolbar, Typography } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import CallIcon from '@mui/icons-material/Call';
// import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';

import logo from '../assets/logo-kfk.png';
import logo48 from '../assets/logo-kfk-s-48.png';

export const VkHeader = () => {
  const trigger = useScrollTrigger({
    // target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 70,
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* <Container> */}
      <Toolbar
        sx={{
          display: 'flex',
          // width: '100%',
          justifyContent: 'space-between',
          padding: '0.5rem 0',
        }}
      >
        <Box
          component="img"
          sx={{
            // height: 233,
            width: { xs: '50%', md: 250 },
            // maxHeight: { xs: 233, md: 167 },
            // maxWidth: { xs: 160, md: 240 },
          }}
          alt="Logo."
          src={logo}
        />
        <Box>
          <Box
            sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <CallIcon fontSize="small" />
            <Typography>09 600 13 600</Typography>
          </Box>
          {/* </Stack> */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'flex-end' }}
          >
            <a href="https://www.t.me/kantorfk" className="telegram social">
              <TelegramIcon />
            </a>
            {/* <a
                href="https://www.instagram.com/kantorfk"
                className="instagram social"
              >
                <InstagramIcon />
              </a> */}
          </Stack>
        </Box>
      </Toolbar>
      {/* </Container> */}
      {trigger && (
        <Collapse in={trigger}>
          <AppBar
            sx={{
              position: 'fixed',
              width: '100%',
              top: 0,
              padding: '5px',
              backgroundColor: 'whitesmoke',
              opacity: 0.95, //[0.5, 0.5, 0.5],
            }}
          >
            <Stack
              direction={'row'}
              spacing={3}
              sx={{ justifyContent: 'center' }}
            >
              <Box
                component="img"
                sx={{
                  height: 24,
                  // width: 200,
                  // maxHeight: { xs: 233, md: 167 },
                  // maxWidth: { xs: 240, md: 160 },
                }}
                alt="Logo small."
                src={logo48}
              />
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'flex-end' }}
              >
                <a href="https://www.t.me/kantorfk" className="telegram social">
                  <TelegramIcon />
                </a>
                {/* <a
                  href="https://www.instagram.com/kantorfk"
                  className="instagram social"
                >
                  <InstagramIcon />
                </a> */}
              </Stack>
            </Stack>
          </AppBar>
        </Collapse>
      )}
    </Box>
  );
};
