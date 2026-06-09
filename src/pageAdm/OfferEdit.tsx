import React, { useState, useMemo, useEffect } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import type { DbOfferType } from '../store/DbTypes';
import { VkToggle, type VkToggleDataType } from '../share/VkToggle';
import { foreignDataset } from '../lib/currencies';
import { useUserStore } from '../store/useUserStore';
import { APP_CONFIG } from '../const';

interface OfferUpdatePayload {
  reqid: 'upd';
  ofid: string;
  shop: string;
  cur: string;
  ba: 'bid' | 'ask';
  amnt: string | number;
  price: string | number;
  tel: string;
  note: string;
  tm: string;
}

interface OfferEditProps extends BoxProps {
  offer?: DbOfferType;
  kantList?: VkToggleDataType[]; // Додаємо пропс для списку кас
  funcClose: () => void;
  funcSubmit: (data: OfferUpdatePayload) => void;
}

export const OfferEdit = ({
  offer,
  kantList = [],
  funcClose,
  funcSubmit,
  ...other
}: OfferEditProps) => {
  //   console.log('OfferEdit:', offer);
  const [oid, setOid] = useState(offer?.oid ?? '');
  const [knt, setKnt] = useState(offer?.shop ?? 'CITY');
  const [cur, setCur] = useState(offer?.chid ?? APP_CONFIG.CHID);
  const [ba, setBa] = useState<'bid' | 'ask'>(offer?.bidask ?? 'bid');
  const [amnt, setAmnt] = useState(offer?.amnt ?? '');
  const [rate, setRate] = useState(offer?.price ?? '');
  const [tel, setTel] = useState(offer?.tel ?? APP_CONFIG.PHONE);
  const [note, setNote] = useState(offer?.onote ?? '');
  const { currencies, fetchCurrencies } = useUserStore();

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  useEffect(() => {
    if (offer) {
      setOid(offer.oid ?? '');
      setKnt(offer.shop ?? 'CITY');
      setCur(offer.chid ?? APP_CONFIG.CHID);
      setBa(offer.bidask ?? 'bid');
      setAmnt(offer.amnt ?? '');
      setRate(offer.price ?? '');
      setTel(offer.tel ?? APP_CONFIG.PHONE);
      setNote(offer.onote ?? '');
    } else {
      setOid('');
      setKnt('CITY');
      setCur(APP_CONFIG.CHID);
      setBa('bid');
      setAmnt('');
      setRate('');
      setTel(APP_CONFIG.PHONE);
      setNote('');
    }
  }, [offer]);
  const foreignToggleList = useMemo((): VkToggleDataType[] => {
    return foreignDataset(currencies).map((v) => ({
      id: v.chid,
      sname: v.chid,
      name: `${v.chid} - ${v.name}`,
    }));
  }, [currencies]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    if (Number(amnt) < 0) {
      alert('Сума повинна бути більшою за нуль');
      return;
    }

    if (Number(rate) < 0) {
      alert('Курс повинен бути позитивним');
      return;
    }

    const submitData: OfferUpdatePayload = {
      reqid: 'upd',
      ofid: oid,
      shop: knt,
      cur: cur,
      ba: ba,
      amnt: amnt,
      price: rate,
      tel: tel,
      note: note,
      tm: new Date().toISOString(),
    };
    // console.log('Submitting offer update:', submitData);
    e.preventDefault();
    funcSubmit(submitData);
  };

  return (
    <Box {...other}>
      <form onSubmit={handleSubmit}>
        {/* Приховане поле ID */}
        <input type="hidden" value={oid} />

        <Stack spacing={2} sx={{ py: 1 }}>
          {/* Рядок 1: Каса та Телефон */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <VkToggle
              data={kantList}
              dflt={knt}
              allowAll={false}
              fcb={(v) => setKnt(v)}
            />
            <TextField
              fullWidth
              label="Телефон"
              size="small"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              name="tel"
              // Для MUI v6+:
              slotProps={{
                input: {
                  inputComponent: TextMaskTel as any,
                },
              }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <VkToggle
              data={[
                { id: 'bid', name: 'Куп' },
                { id: 'ask', name: 'Прод' },
              ]}
              dflt={ba}
              allowAll={false}
              fcb={(v) => setBa(v as 'bid' | 'ask')}
            />
            <VkToggle
              data={foreignToggleList}
              dflt={cur}
              allowAll={false}
              label="Валюта"
              fcb={(v) => setCur(v)}
            />
          </Stack>

          {/* Рядок 3: Сума та Курс */}
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              label="Сума"
              type="number"
              size="small"
              value={amnt}
              onChange={(e) => setAmnt(e.target.value)}
              error={Number(amnt) <= 0 && amnt !== ''}
              helperText={
                Number(amnt) <= 0 && amnt !== '' ? 'Введіть число від 0' : ''
              }
              slotProps={{
                htmlInput: {
                  type: 'number',
                  min: '0',
                },
              }}
            />
            <TextField
              fullWidth
              label="Курс"
              size="small"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              slotProps={{
                htmlInput: {
                  type: 'number',
                  step: Number(rate) < 10 ? '0.001' : '0.01',
                  min: '0',
                },
              }}
            />
          </Stack>

          <TextField
            fullWidth
            label="Примітка"
            size="small"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* Кнопки дії */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ pt: 1, justifyContent: 'flex-end' }}
          >
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CloseIcon />}
              onClick={funcClose}
            >
              Закрити
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
            >
              Зберегти
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

import { IMaskInput } from 'react-imask';

interface TelProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TextMaskTel = React.forwardRef<HTMLInputElement, TelProps>(
  function TextMaskTel(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="(000) 000-0000" // Ваша маска
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  },
);
