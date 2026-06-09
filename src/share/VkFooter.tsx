import Box, { type BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const VkFooter = ({ ...other }: BoxProps) => {
  return (
    <Box className="layout-footer" {...other}>
      <Typography variant="body2">Курси валют Самбірщини</Typography>
      <Typography variant="body2">{new Date().getFullYear()}©</Typography>
    </Box>
  );
};
