import React, { useEffect, useState, useMemo } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { FormControl, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { VkToggle, type VkToggleDataType } from '../share/VkToggle';
import { foreignDataset } from '../lib/currencies';
import { APP_CONFIG } from '../const';

import { useInfoStore } from '../store/useInfoStore';
import { useUserStore } from '../store/useUserStore';
import { useRateStore, type DbRateRecord } from '../store/useRateStore';

interface RateEditProps extends BoxProps {
  funcClose: () => void;
}

export const RateEdit = ({ funcClose, ...other }: RateEditProps) => {
  const isLoading = useRateStore((state) => state.isLoading);
  //   console.log('RateEdit DATA rendered ');
  const appUser = useUserStore((state) => state.appUser);
  const showNotification = useUserStore((state) => state.showNotification);
  const rawRates = useRateStore((state) => state.dataset);
  const kntInfo = useInfoStore((state) => state.shops);
  const crnInfo = useInfoStore((state) => state.currencies);
  const crnInfoSub = useInfoStore((state) => state.cursubmap);
  const submit = useRateStore((state) => state.submit);
  const error = useRateStore((state) => state.error);

  const [base, setBase] = useState<string>(
    appUser?.role === 'owner' ? (APP_CONFIG.BULK ?? '') : (appUser?.term ?? ''),
  );
  const [edknt, setEdknt] = useState<string[]>([
    appUser?.role === 'owner' ? (APP_CONFIG.BULK ?? '') : (appUser?.term ?? ''),
  ]);
  const [edcur, setEdcur] = useState('840');
  const [edcursub, setEdcursub] = useState('');
  const [edqty, setEdqty] = useState(1);
  const [edbid, setEdbid] = useState('');
  const [edask, setEdask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Прапорець відправки

  useEffect(() => {
    if (isEditing || isLoading) return;
    // console.log('base, edcur, edcursub', base, edcur, edcursub);

    const currentRate = rawRates.find((v) => {
      return v.shop === base && v.atclcode === edcur && v.scode === edcursub;
    });
    if (currentRate) {
      setEdqty(currentRate.qty || 1);
      setEdbid(String(currentRate.bid) || '');
      setEdask(String(currentRate.ask) || '');
    } else {
      setEdqty(1);
      setEdbid('');
      setEdask('');
    }
    return () => {
      // cleanup if needed
    };
  }, [rawRates, base, edcur, edcursub]);

  const baseToggleList = useMemo(() => {
    return Object.values(kntInfo)
      .sort((a, b) => a.so - b.so)
      .map((v) => ({ id: v.name, name: v.name }));
  }, [kntInfo]);

  const kntToggleList = useMemo(() => {
    if (!appUser) return [];
    if (appUser.role === 'owner') {
      return baseToggleList;
    } else return [{ id: appUser.term, name: appUser.term }];
  }, [appUser?.role, baseToggleList]);

  const curToggleList = useMemo((): VkToggleDataType[] => {
    return foreignDataset(Object.values(crnInfo)).map((v) => ({
      id: v.id,
      sname: v.chid,
      name: `${v.chid} - ${v.name}`,
    }));
  }, [crnInfo]);

  const cursubToggleList = useMemo((): VkToggleDataType[] => {
    return Object.values(crnInfoSub)
      .filter((v) => v.atclcode === edcur)
      .map((v) => ({
        id: v.id,
        sname: v.sname,
        // name: `${v.id} - ${v.sname}`,
      }));
  }, [crnInfoSub, edcur]);

  const handleKantorToggle = (
    _: React.MouseEvent<HTMLElement>,
    newValues: string[],
  ) => {
    if (!newValues.length) return;

    const lastSelected = newValues[newValues.length - 1];

    if (lastSelected === APP_CONFIG.BULK) {
      setEdknt([APP_CONFIG.BULK]);
    } else {
      setEdknt(newValues.filter((v) => v !== APP_CONFIG.BULK));
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    // Валідація перед відправкою
    if (!edbid || !edask) {
      showNotification('Заповніть поля Купівлі та Продажу', 'warning');
      return;
    }

    setIsSubmitting(true); // Вмикаємо лоадер

    const rateList: DbRateRecord[] = edknt.map((shopId) => ({
      shop: shopId,
      atclcode: edcur,
      scode: edcursub,
      pricecode: '',
      qty: edqty,
      bid: edbid,
      ask: edask,
      // Замінюємо + на кодований символ для безпеки API
      //   bid: edbid.replace(/\+/g, "%2B"),
      //   ask: edask.replace(/\+/g, "%2B"),
      tm: new Date().toISOString(),
    }));
    const success = submit(rateList);
    if (!!success) {
      showNotification('Курс успішно збережено!', 'success');
    } else {
      showNotification(error ?? 'Помилка при збереженні курсу!', 'error');
    }
    setIsEditing(false);
    setIsSubmitting(false);
  };

  return (
    <Box sx={{ maxWidth: { md: 360 }, p: 1 }} {...other}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <VkToggle
              data={baseToggleList}
              dflt={base}
              label="База"
              limit={0}
              allowAll={false}
              fcb={(v) => setBase(v)}
            />
            <FormControl size="small">
              <ToggleButtonGroup
                value={edknt}
                onChange={handleKantorToggle}
                size="small"
                color="primary"
              >
                {kntToggleList.map((v) => (
                  <ToggleButton key={v.id} value={v.id}>
                    {v.name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </FormControl>
          </Stack>

          {/* Валюта та Тип (SCode) */}
          <Box
            // direction="row"
            // spacing={1}
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <VkToggle
              data={curToggleList}
              dflt={edcur}
              allowAll={false}
              label="Валюта"
              fcb={(v) => {
                setEdcursub('');
                setEdcur(v);
              }}
            />
            {cursubToggleList.length > 0 && (
              <VkToggle
                data={cursubToggleList}
                dflt={edcursub}
                allowAll={false}
                limit={1}
                // label="Тип"
                fcb={(v) => {
                  setEdcursub(v);
                }}
              />
            )}
          </Box>

          {/* Поля вводу курсу */}
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              label="Купівля"
              type="number"
              size="small"
              value={edbid}
              onChange={(e) => {
                setIsEditing(true);
                setEdbid(e.target.value);
              }}
              //   slotProps={{ inputLabel: { shrink: true } }}
              slotProps={{
                htmlInput: {
                  type: 'number',
                  step: Number(edbid) < 10 ? '0.001' : '0.01',
                  min: '0',
                },
              }}
            />
            <TextField
              fullWidth
              label="Продаж"
              type="number"
              size="small"
              value={edask}
              onChange={(e) => {
                setIsEditing(true);
                setEdask(e.target.value);
              }}
              slotProps={{
                htmlInput: {
                  type: 'number',
                  step: Number(edask) < 10 ? '0.001' : '0.01',
                  min: '0',
                },
              }}
              //  slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          {/* Кнопки */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={funcClose}
              disabled={isSubmitting} // Блокуємо кнопку закриття під час запису
            >
              Закрити
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={!edknt.length || edcur === '' || isSubmitting}
              startIcon={<CheckIcon />}
            >
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};
