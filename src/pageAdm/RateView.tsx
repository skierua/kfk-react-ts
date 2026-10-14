import { useState, useMemo, useEffect } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';

import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';

// import { type DbRateType } from '../store/DbTypes';
import type { RateType } from '../lib/types';
import {
  // RateWrapper,
  RateTable_test,
  CrossTable,
  // type CrossTableDataType,
} from '../share/Rate';
import { RateEdit } from './RateEdit';
import { postData } from '../driver';
import { maxTime } from '../lib/rates';
import { VkToggle } from '../share/VkToggle';
import { humanDate, tgMessage } from '../lib/common';
import { APP_CONFIG } from '../const';

import { useInfoStore } from '../store/useInfoStore';
import { useUserStore } from '../store/useUserStore';
// import { useRateStore } from '../store/useRateStore';

export const RateView = ({ ...other }: BoxProps) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const kntInfo = useInfoStore((state) => state.shops);
  // const showNotification = useUserStore((state) => state.showNotification);
  // const fetchRates = useRateStore((state) => state.fetchDataset);
  const [knt, setKnt] = useState<string>('');
  // const [cross, setCross] = useState<CrossTableDataType[]>([]);
  // const { appUser } = useUserStore();

  const kntToggleList = useMemo(() => {
    return Object.values(kntInfo)
      .sort((a, b) => a.so - b.so)
      .map((v) => ({ id: v.name, name: v.name }));
  }, [kntInfo]);

  return (
    <Box {...other}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {isEditorOpen && (
          <Box
            className="adm-dash-container"
            sx={{ width: { xs: '100%', sm: '360px' } }}
          >
            <RateEdit funcClose={setIsEditorOpen.bind(null, false)} />
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              paddingY: 1,
              border: '1px solid lightgrey',
              borderRadius: '15px',
              backgroundColor: '#f9f9f9', // 'info.light',
            }}
          >
            <VkToggle
              data={kntToggleList}
              dflt={knt}
              label="Кантор"
              limit={5}
              fcb={(v: string) => setKnt(v)}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <RateWrapper
              shop={knt}
              typeFilter={2}
              wtitle="Main"
              // funcPublish={handlePublish.bind(null, 'main')}
            />
            {/* {rates6Dataset.length > 0 && ( */}
            <RateWrapper
              shop={knt}
              typeFilter={6}
              wtitle="Конвертація"
              // funcPublish={handlePublish.bind(null, 'conversion')}
            />
            <RateWrapper shop={knt} typeFilter={4} wtitle="Other" />
            <Box
              className="adm-dash-container"
              sx={{ width: { xs: '100%', sm: '270px' } }}
            >
              <Box className="adm-dash-container-title-wrapper">
                <Box className="adm-dash-container-title">
                  КросКурси по ГУРТ
                </Box>
              </Box>
              <CrossTable subcode={'20'} />
              <CrossTable subcode={''} />
            </Box>
          </Box>
        </Box>
        <Fab
          color="primary"
          aria-label="add"
          onClick={setIsEditorOpen.bind(null, true)}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <EditIcon />
        </Fab>
      </Box>
    </Box>
  );
};

interface RateWrapperProps extends BoxProps {
  shop: string;
  typeFilter?: number;
  wtitle?: string;
}

const RateWrapper = ({
  shop,
  typeFilter,
  wtitle,
  ...other
}: RateWrapperProps) => {
  // const kntInfo = useInfoStore((state) => state.shops);
  const crnInfo = useInfoStore((state) => state.currencies);
  const [childData, setChildData] = useState<RateType[]>([]);
  const showNotification = useUserStore((state) => state.showNotification);
  // const [updated, setUpdated] = useState<string>('');
  // const [bulk, setBulk] = useState(true);
  // const [knt, setKnt] = useState('');

  const shopList = useMemo((): string[] => {
    return !!shop ? [shop] : [];
  }, [shop]);

  const curList = useMemo((): string[] => {
    return Object.values(crnInfo)
      .filter((v) => Number(typeFilter) === Number(v.dmst))
      .map((v) => v.id);
  }, [crnInfo, typeFilter]);

  const handleChildDataChanged = (data: RateType[]) => {
    setChildData(data);
  };

  const lastUpdated = useMemo(() => {
    const latestUpdate = maxTime(childData);
    return humanDate((latestUpdate || '') as string);
  }, [childData]);

  const share = useMemo(() => {
    return (
      childData.length > 0 &&
      shopList.length > 0 &&
      (typeFilter === 2 || typeFilter === 6)
    );
  }, [childData]);

  const handlePublish = async () => {
    const title =
      typeFilter === 6
        ? 'КОНВЕРТАЦІЯ'
        : shop === APP_CONFIG.BULK
          ? 'ГУРТ'
          : 'РОЗДРІБ';
    const message = tgMessage({ data: childData, title: title });
    // console.log('handlePublish message:\n', message);
    // return
    try {
      await postData<any>('/publish_tg', JSON.stringify({ message: message }));
      showNotification('Курси валют успішно опубліковано!', 'success');
    } catch (err: any) {
      console.error('Error publishing rates:', err.message);
      showNotification('Помилка при публікації курсу!', 'error');
      //   return;
    }
  };

  return (
    <Box className="adm-dash-container" {...other}>
      <Box className="adm-dash-container-title-wrapper">
        <Box
          sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <IconButton
            size="small"
            color="primary"
            disabled={!share}
            onClick={handlePublish}
          >
            <ShareIcon />
          </IconButton>
          {wtitle && <div className="adm-dash-container-title">{wtitle}</div>}
        </Box>
        <div className="adm-dash-container-title-tm">{lastUpdated}</div>
      </Box>

      <RateTable_test
        curFilter={curList}
        kntFilter={shopList}
        showFlag={false}
        onDataChange={handleChildDataChanged}
      />
    </Box>
  );
};
