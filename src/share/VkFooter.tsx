import Box, { type BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const VkFooter = ({ ...other }: BoxProps) => {
  return (
    <Box className="layout-footer" {...other}>
      <Typography variant="body2">Курси валют Самбірщини</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Box
          sx={{
            bgcolor: 'dimgrey',
            borderRadius: '0.25rem',
            px: '0.5rem',
            py: '0.125rem',
          }}
        >
          <Typography variant="body2">v{__APP_VERSION__}</Typography>
        </Box>
        <Typography variant="body2">{new Date().getFullYear()}©</Typography>
      </Box>
    </Box>
  );
};
