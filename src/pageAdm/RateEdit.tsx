import React, { useEffect, useState, useMemo } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { FormControl, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { VkToggle, type VkToggleDataType } from '../share/VkToggle';
import { useDataStore } from '../store/useDataStore';
import { useUserStore } from '../store/useUserStore';
import { foreignDataset } from '../lib/currencies';
import { ratesDataset, type iRateDataset } from '../lib/rates';
import { APP_CONFIG } from '../const';

// --- Типи даних ---
interface RateRecord {
  shop: string;
  atclcode: string;
  scode: string;
  pricecode: string;
  qty: string | number;
  bid: string;
  ask: string;
  tm: string;
}

interface RateEditProps extends BoxProps {
  //   sqldata: DbRateType[]; // Ваші сирі дані з БД
  //   role: 'admin' | 'kant' | string;
  //   kantor: VkToggleDataType[];
  //   currency: VkToggleDataType[];
  //   cursub: any[];
  //   kntBulk?: string;
  baseKant: string;
  baseList?: VkToggleDataType[];
  kantList?: VkToggleDataType[];
  funcClose: () => void;
  funcSubmit: (data: { reqid: string; rates: RateRecord[] }) => void;
}

export const RateEdit = ({
  //   sqldata,
  //   role,
  //   kantor,
  //   currency,
  //   cursub,
  //   kntBulk = "BULK",
  baseKant,
  baseList = [],
  kantList = [],
  funcClose,
  funcSubmit,
  ...other
}: RateEditProps) => {
  //   console.log('RateEdit DATA rendered ');
  // --- Стан форми ---
  const [base, setBase] = useState<string>(baseKant);
  const [edknt, setEdknt] = useState<string[]>([baseKant]);
  const [edcur, setEdcur] = useState('840');
  const [edcursub, setEdcursub] = useState('');
  const [edqty, setEdqty] = useState(1);
  const [edbid, setEdbid] = useState('');
  const [edask, setEdask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Прапорець відправки
  const { currencies, cursub, fetchCurrencies, fetchCursub } = useUserStore();
  const rawRates = useDataStore((state) => state.rates);

  useEffect(() => {
    fetchCurrencies();
    fetchCursub();
  }, [fetchCurrencies, fetchCursub]);

  useEffect(() => {
    // refresh rate data
    if (isEditing) return;
    const rate = ratesDataset({
      data: rawRates,
      curFilter: edcur,
      kantFilter: base,
      cursubFilter: edcursub,
    } as iRateDataset);

    if (rate.length > 0) {
      setEdqty(rate[0].cqty || 1);
      setEdbid(String(rate[0].bid) || '');
      setEdask(String(rate[0].ask) || '');
    } else {
      setEdqty(1);
      setEdbid('');
      setEdask('');
    }
  }, [rawRates, base, edcur, edcursub]);

  const foreignToggleList = useMemo((): VkToggleDataType[] => {
    return foreignDataset(currencies).map((v) => ({
      id: v.id,
      sname: v.chid,
      name: `${v.chid} - ${v.name}`,
    }));
  }, [currencies]);

  const filteredSubCur = useMemo(() => {
    return cursub.filter((v) => v.atclcode === edcur);
  }, [cursub, edcur]);

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
      useUserStore
        .getState()
        .showNotification('Заповніть поля Купівлі та Продажу', 'warning');
      return;
    }

    setIsSubmitting(true); // Вмикаємо лоадер

    const rateList: RateRecord[] = edknt.map((shopId) => ({
      shop: shopId,
      atclcode: edcur,
      scode: edcursub,
      pricecode: '',
      qty: edqty,
      // Замінюємо + на кодований символ для безпеки API
      bid: edbid,
      ask: edask,
      //   bid: edbid.replace(/\+/g, "%2B"),
      //   ask: edask.replace(/\+/g, "%2B"),
      tm: new Date().toISOString(),
    }));

    funcSubmit({
      reqid: 'upd',
      rates: rateList,
    });
    setIsEditing(false);
    setIsSubmitting(false);
  };

  return (
    <Box sx={{ maxWidth: { md: 360 }, p: 1 }} {...other}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <VkToggle
              data={baseList}
              dflt={baseKant}
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
                {kantList.map((v) => (
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
              data={foreignToggleList}
              dflt={edcur}
              allowAll={false}
              label="Валюта"
              fcb={(v) => {
                setEdcursub('');
                setEdcur(v);
              }}
            />
            {filteredSubCur.length > 0 && (
              <VkToggle
                data={filteredSubCur}
                dflt={edcursub}
                allowAll={false}
                limit={1}
                // label="Тип"
                fcb={(v) => {
                  // setEdcursub('');
                  console.log('Selected cursub=', v);
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
