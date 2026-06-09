import { useState, useMemo, useEffect } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';

import {
  RateWrapper,
  CrossTable,
  type CrossTableDataType,
} from '../share/Rate';
import { RateEdit } from './RateEdit';
import { postData } from '../driver';
import { useDataStore } from '../store/useDataStore';
import { useUserStore } from '../store/useUserStore';
import { ratesDataset_v2 } from '../lib/rates';
import { VkToggle } from '../share/VkToggle';
import { type DbRateType } from '../store/DbTypes';
import { tgMessage } from '../lib/common';
import { APP_CONFIG } from '../const';

const KANT_LIST: Record<string, { id: string; name: string }[]> = {
  owner: [
    { id: 'BULK', name: 'BULK' },
    { id: 'CITY', name: 'CITY' },
    { id: 'FEYA', name: 'FEYA' },
  ],
  kant: [
    { id: 'CITY', name: 'CITY' },
    { id: 'FEYA', name: 'FEYA' },
  ],
};

export const RateView = ({ ...other }: BoxProps) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const rawRates = useDataStore((state) => state.rates);
  const showNotification = useUserStore((state) => state.showNotification);
  const fetchRates = useDataStore((state) => state.fetchRates);
  const [knt, setKnt] = useState<string>('');
  const [cross, setCross] = useState<CrossTableDataType[]>([]);
  const { appUser } = useUserStore();

  const baseList = useMemo(() => {
    return KANT_LIST[appUser?.role ?? ''] ?? [];
  }, [appUser?.role]);

  const kantDflt = useMemo(() => {
    return appUser?.term ?? baseList[0]?.id ?? '';
  }, [appUser?.role]);

  const kantList = useMemo(() => {
    if (!appUser) return [];
    if (appUser.role === 'owner') {
      return KANT_LIST['owner'];
    }
    return [{ id: appUser.term, name: appUser.term }];
  }, [appUser?.role]);

  const rates2Dataset = useMemo(() => {
    return ratesDataset_v2({
      data: rawRates,
      kantFilter: knt,
      typeFilter: 2,
    });
  }, [rawRates, knt]);

  const rates4Dataset = useMemo(() => {
    return ratesDataset_v2({
      data: rawRates,
      kantFilter: knt,
      typeFilter: 4,
    });
  }, [rawRates, knt]);

  const rates6Dataset = useMemo(() => {
    return ratesDataset_v2({
      data: rawRates,
      kantFilter: knt,
      typeFilter: 6,
    });
  }, [rawRates, knt]);

  useEffect(() => {
    let baseList: DbRateType[] = [];
    let directList: DbRateType[] = [];
    let reverseList: DbRateType[] = [];
    if (rates6Dataset.length === 0 || rates2Dataset.length === 0) {
      setCross([]);
      return;
    }
    [
      { id: '840', scode: '' },
      { id: '840', scode: '20' },
    ].forEach((v) => {
      const rate = rates2Dataset.find(
        (r) => r.atclcode === v.id && r.scode === v.scode,
      );
      if (rate) {
        baseList.push(rate);
      }
    });
    rates6Dataset.forEach((v) => {
      if (v.atclcode.slice(0, 3) === APP_CONFIG.CURID) {
        const rate = rates2Dataset.find(
          (r) => r.atclcode === v.atclcode.slice(-3),
        );
        if (rate) {
          directList.push(rate);
        }
      } else {
        const rate = rates2Dataset.find(
          (r) => r.atclcode === v.atclcode.slice(0, 3),
        );
        if (rate) {
          reverseList.push(rate);
        }
      }
    });
    const crossRates = baseList.map((v) => {
      return { base: v, direct: directList, reverse: reverseList };
    });
    setCross(crossRates.reverse());
  }, [rates6Dataset, rates2Dataset]);

  const handlePublish = async (datacode: string) => {
    let message: string = '';
    if (datacode === 'main') {
      message = tgMessage({
        data: rates2Dataset,
        title: knt === APP_CONFIG.BULK ? 'ГУРТ' : 'РОЗДРІБ',
      });
    } else if (datacode === 'conversion') {
      message = tgMessage({
        data: rates2Dataset,
        title: 'КОНВЕРТАЦІЯ',
      });
    }
    try {
      await postData<any>('/publish_tg', JSON.stringify({ message: message }));
      showNotification('Курси валют успішно опубліковано!', 'success');
    } catch (err: any) {
      console.error('Error publishing rates:', err.message);
      showNotification('Помилка при публікації курсу!', 'error');
      //   return;
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await postData<any>('/rates', JSON.stringify(data));
      showNotification('Курси валют успішно оновлено!', 'success');
      await fetchRates();
    } catch (err: any) {
      console.error('Error submitting rate update:', err.message);
      showNotification('Помилка при оновленні курсів валют!', 'error');
    }
  };

  return (
    <Box {...other}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {isEditorOpen && (
          <Box
            className="adm-dash-container"
            sx={{ width: { xs: '100%', sm: '360px' } }}
          >
            <RateEdit
              // offer={eoffer}
              baseKant={kantDflt}
              baseList={baseList}
              kantList={kantList}
              funcClose={setIsEditorOpen.bind(null, false)}
              funcSubmit={handleSubmit}
            />
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
              data={KANT_LIST['owner']}
              dflt={knt}
              label="Кантор"
              limit={5}
              fcb={(v: string) => setKnt(v)}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <RateWrapper
              data={rates2Dataset}
              showFlag={false}
              wtitle="Main"
              funcPublish={handlePublish.bind(null, 'main')}
            />
            {rates6Dataset.length > 0 && (
              <RateWrapper
                data={rates6Dataset}
                showFlag={false}
                wtitle="Конвертація"
                funcPublish={handlePublish.bind(null, 'conversion')}
              />
            )}
            {rates4Dataset.length > 0 && (
              <RateWrapper
                data={rates4Dataset}
                showFlag={false}
                wtitle="Other"
              />
            )}
            <Box
              className="adm-dash-container"
              sx={{ width: { xs: '100%', sm: '270px' } }}
            >
              <Box className="adm-dash-container-title-wrapper">
                <Box className="adm-dash-container-title">
                  КросКурси по ГУРТ
                </Box>
              </Box>
              {cross.map((v: CrossTableDataType) => (
                <CrossTable
                  key={`k-${v.base.atclcode}-${v.base.scode}`}
                  data={v}
                  title={v.base.sname}
                />
              ))}
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
