import { useState, useMemo } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer, {
  type TableContainerProps,
} from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableRow, { type TableRowProps } from '@mui/material/TableRow';

import CircleIcon from '@mui/icons-material/Circle';
import CallIcon from '@mui/icons-material/Call';
import EditIcon from '@mui/icons-material/Edit';

import { VkToggle, type VkToggleDataType } from './VkToggle';
import type { DbOfferType } from '../store/DbTypes';
import { useDataStore } from '../store/useDataStore';
import { useUserStore } from '../store/useUserStore';

import { humanDate } from '../lib/common';
import {
  offersDataset,
  kantToggleList,
  curToggleList,
  baToggleList,
} from '../lib/offers';

interface OfferComponentProps extends BoxProps {
  mode?: 'card' | 'table';
  allowEdit?: boolean;
  showFilter?: boolean;
  funcEdit?: (offer?: DbOfferType) => void;
}

export const OfferComponent = ({
  mode = 'card',
  showFilter = false,
  funcEdit,
  ...other
}: OfferComponentProps) => {
  const rawOffers = useDataStore((state) => state.offers);
  const [knt, setKnt] = useState('');
  const [cur, setCur] = useState('');
  const [baf, setBaf] = useState(''); // bid | ask filter

  const dataset: DbOfferType[] = useMemo(() => {
    return offersDataset({
      data: rawOffers,
      kantFilter: knt,
      curFilter: cur,
      typeFilter: baf,
    });
  }, [rawOffers, knt, cur, baf]);

  const kantList: VkToggleDataType[] = useMemo(() => {
    return kantToggleList(rawOffers);
  }, [rawOffers]);

  const curList: VkToggleDataType[] = useMemo(() => {
    return curToggleList(rawOffers);
  }, [rawOffers]);

  const baList: VkToggleDataType[] = useMemo(() => {
    return baToggleList(rawOffers);
  }, [rawOffers]);

  return (
    <Box {...other}>
      {showFilter && (
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 3 } }}>
          {kantList.length > 1 && (
            <VkToggle
              data={kantList}
              dflt={knt}
              label="Кантор"
              limit={3}
              fcb={(v) => setKnt(v)}
            />
          )}
          {curList.length > 1 && (
            <VkToggle
              data={curList}
              dflt={cur}
              label="Валюта"
              limit={3}
              fcb={(v) => setCur(v)}
            />
          )}
          {baList.length > 1 && (
            <VkToggle
              data={baList}
              dflt={baf}
              label=""
              limit={2}
              fcb={(v) => setBaf(v)}
            />
          )}
        </Box>
      )}
      {mode === 'card' ? (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            // width: { xs: '100%', sm: '300px' },
          }}
        >
          {dataset.map((v) => {
            return (
              <OfferCard
                id={v.oid}
                key={v.oid}
                data={v}
                sx={{
                  //   flex: '1 1 300px',
                  padding: 1.5,
                  gap: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  width: { xs: '100%', sm: '270px' },
                }}
              />
            );
          })}
        </Box>
      ) : (
        <OfferTable data={dataset} funcEdit={funcEdit} />
      )}
      {/* <Alert severity="info">{wfooter}</Alert> */}
    </Box>
  );
};

interface OfferTableProps extends TableContainerProps {
  data: DbOfferType[];
  funcEdit?: (offer?: DbOfferType) => void;
}

export const OfferTable = ({ data, funcEdit, ...other }: OfferTableProps) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', width: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          Немає актуальних пропозицій
        </Typography>
      </Box>
    );
  }
  return (
    <TableContainer component={Paper} {...other}>
      <Table size="small" aria-label="a dense table">
        <TableBody>
          {data.map((v) => {
            return (
              <OfferTableRow
                id={v.oid}
                key={v.oid}
                row={v}
                funcEdit={funcEdit}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface OfferTableRowProps extends TableRowProps {
  row: DbOfferType;
  funcEdit?: (offer?: DbOfferType) => void;
}

const OfferTableRow = ({ row, funcEdit, ...other }: OfferTableRowProps) => {
  const { appUser } = useUserStore();
  const isBid = row.bidask === 'bid';
  const canEdit =
    appUser && (appUser.role === 'owner' || appUser.term === row.shop);
  const isDisable = !appUser || !canEdit;
  return (
    <TableRow {...other}>
      <TableCell align="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontWeight: 'bold',
          }}
        >
          <CircleIcon
            sx={{ fontSize: 12 }}
            color={isBid ? 'success' : 'info'}
          />
          <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>
            {isBid ? 'куп' : 'прод'}
          </Typography>
        </Box>
        <Typography variant="subtitle2">{row.chid}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle2">
          {Number(row.price).toLocaleString('uk-UA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {humanDate(row.tm)}
        </Typography>
        <Typography variant="body2">
          {Math.abs(Number(row.amnt)).toLocaleString('uk-UA')}
        </Typography>
      </TableCell>
      <TableCell>
        {!funcEdit && <Typography variant="caption">{row.shop}</Typography>}
        {!!funcEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            disabled={isDisable}
            size="small"
            onClick={() => funcEdit?.(row)} // Безпечний виклик
          >
            {row.shop}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

interface OfferCardProps extends BoxProps {
  data: DbOfferType;
  //   allowEdit?: boolean;
  //   funcEdit?: (item: DbOfferType) => void;
}
export const OfferCard = ({ data, ...other }: OfferCardProps) => {
  //   const { appUser } = useUserStore();
  const isBid = data.bidask === 'bid';

  return (
    <Box
      component={Paper}
      elevation={2}
      sx={{
        //   flex: '1 1 300px',
        padding: 1.5,
        gap: 1,
        display: 'flex',
        flexDirection: 'column',
        width: { xs: '100%', sm: '300px' },
      }}
      {...other}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontWeight: 'bold',
          }}
        >
          <CircleIcon
            sx={{ fontSize: 12 }}
            color={isBid ? 'success' : 'info'}
          />
          <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>
            {isBid ? 'куплю' : 'продам'}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {humanDate(data.tm)}
        </Typography>
      </Box>

      {/* Основна інформація: Валюта та Ціна */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          alt={data.curid}
          src={`/flag/${data.curid}.svg`}
          sx={{ width: 32, height: 32, border: '1px solid #eee' }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>
            {data.chid}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data.name}
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            // color: isBid ? 'success.main' : 'info.main',
          }}
        >
          {Number(data.price).toLocaleString('uk-UA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}
        </Typography>
      </Box>

      {/* Сума та Телефон */}
      <Divider />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">
          {`до ${Math.abs(Number(data.amnt)).toLocaleString('uk-UA')}`}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            // color: 'primary.main',
          }}
        >
          <CallIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2">{data.tel}</Typography>
        </Box>
      </Box>

      {/* Примітка */}
      {data.onote && (
        <Box
          sx={{
            backgroundColor: 'action.hover',
            padding: '4px 8px',
            borderRadius: 1,
            fontSize: '0.8rem',
            fontStyle: 'italic',
            borderLeft: '3px solid lightgrey',
          }}
        >
          {data.onote}
        </Box>
      )}
    </Box>
  );
};
