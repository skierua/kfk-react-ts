import { useMemo, useState } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import { OfferComponent } from '../share/Offer';
import { OfferEdit } from './OfferEdit';
import type { DbOfferType } from '../store/DbTypes';
import { postData } from '../driver';
import { useDataStore } from '../store/useDataStore';
import { useUserStore } from '../store/useUserStore';

const KANT_LIST = [
  { id: 'BULK', name: 'BULK' },
  { id: 'CITY', name: 'CITY' },
  { id: 'FEYA', name: 'FEYA' },
];

export const OfferView = ({ ...other }: BoxProps) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [eoffer, setEoffer] = useState<DbOfferType | undefined>(undefined);
  const { fetchOffers } = useDataStore();
  const { appUser, showNotification } = useUserStore(); // << Беремо метод з Zustand

  const kantList = useMemo(() => {
    if (!appUser) return [];
    if (appUser.role === 'owner') {
      return KANT_LIST;
    }
    return [{ id: appUser.term, name: appUser.term }];
  }, [appUser?.role]);

  const handleCreateNew = () => {
    console.log('Creating new offer');
    setEoffer(undefined); // Скидаємо вибрану пропозицію
    // setSelectedOffer(emptyOffer); // Встановлюємо порожній шаблон
    setIsEditorOpen(true); // Відкриваємо форму
  };

  const handleClose = () => {
    setEoffer(undefined);
    setIsEditorOpen(false);
  };

  const handleSubmit = async (data: any) => {
    try {
      await postData<any>(
        '/offers',
        // get().token ?? '',
        JSON.stringify(data),
      );
      showNotification('Пропозицію успішно збережено!', 'success');
      await fetchOffers();
      handleClose();
    } catch (err: any) {
      console.error('Error submitting offer update:', err.message);
      showNotification('Помилка при збереженні пропозиції!', 'error');
      //   alert('Помилка при збереженні пропозиції: ' + err.message);
      return;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }} {...other}>
      {isEditorOpen && (
        <Box
          className="adm-dash-container"
          sx={{ width: { xs: '100%', sm: '360px' } }}
        >
          <OfferEdit
            offer={eoffer}
            kantList={kantList}
            funcClose={handleClose}
            funcSubmit={handleSubmit}
          />
        </Box>
      )}
      <Box
        className="adm-dash-container"
        sx={{
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <Box className="adm-dash-container-title-wrapper">
          <Box className="adm-dash-container-title">Offers</Box>
        </Box>
        <OfferComponent
          mode={'table'}
          funcEdit={(offer: DbOfferType | undefined) => {
            // console.log('OfferView funcEdit called with offer:', offer);
            setEoffer(offer);
            setIsEditorOpen(true);
          }}
        />
      </Box>
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreateNew}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};
