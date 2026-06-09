import React from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useUserStore } from '../store/useUserStore';

export const GlobalSnackbar = () => {
  const { snackbar, closeNotification } = useUserStore();

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    closeNotification();
  };

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={snackbar.severity}
        sx={{ width: '100%', borderRadius: '8px', variant: 'contained' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};
