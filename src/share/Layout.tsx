import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import { VkHeader } from './VkHeader';
import { VkFooter } from './VkFooter';

export const Layout = () => (
  <Container sx={{ flex: 1 }}>
    <VkHeader />
    <main>
      <Outlet /> {/* Тут буде рендеритись Main або About */}
    </main>
    <VkFooter />
  </Container>
);
