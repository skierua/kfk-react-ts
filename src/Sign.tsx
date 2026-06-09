import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { publish } from './events';

export function Sign() {
  // Типізуємо подію як React.FormEvent
  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const login = data.get('login')?.toString() || '';
    const password = data.get('password')?.toString() || '';

    if (login && password) {
      const vstr = JSON.stringify({
        usr: login,
        psw: password,
      });

      // window.btoa кодує рядок у base64
      publish('userChanged', window.btoa(vstr));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          bgcolor: 'whitesmoke',
          padding: '20px',
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '2px solid lightgrey',
          borderRadius: '25px',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Авторизація
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="login"
            label="Login"
            name="login"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Вхід
          </Button>
        </Box>
      </Box>
      <Copyright sx={{ mt: 4, mb: 4 }} />
    </Container>
  );
}

// Типізація для Copyright
function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {'Copyright © '}
      {new Date().getFullYear()}.
    </Typography>
  );
}
