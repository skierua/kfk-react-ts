import React, { useEffect, useMemo, useState } from 'react';

import Box, { type BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableContainer, {
  type TableContainerProps,
} from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { grey } from '@mui/material/colors';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import ExpandLessIcon from '@mui/icons-material/ExpandMore';

import { VkToggle } from './VkToggle';
import { useUserStore } from '../store/useUserStore';
import { humanDate } from '../lib/common';
import {
  kantFromBalanceForToggle,
  acntFromBalanceForToggle,
} from '../lib/balance';

import type { DbBalanceType } from '../store/DbTypes';

// Описуємо структуру для групи
interface BalanceRowType {
  name: string;
  totalAmount: number;
  income: number;
  outcome: number;
  maxTime: string;
  details: DbBalanceType[];
}

const transformBalanceForTable = (data: DbBalanceType[]): BalanceRowType[] => {
  const groups: { [key: string]: BalanceRowType } = {};
  data
    .map((v): DbBalanceType => {
      if (!v.acntno.startsWith('30')) {
        return {
          ...v,
          amnt: 0 - v.amnt,
          turndbt: v.turncdt,
          turncdt: v.turndbt,
        };
      }
      return v;
    })
    .forEach((v) => {
      const key = v.cuso; // або інше поле, за яким групуєте
      if (!groups[key]) {
        groups[key] = {
          name: v.chid,
          totalAmount: 0,
          income: 0,
          outcome: 0,
          maxTime: '',
          details: [],
        };
      }
      groups[key].totalAmount += v.amnt;
      groups[key].income += v.turndbt;
      groups[key].outcome += v.turncdt;
      if (v.tm > groups[key].maxTime) groups[key].maxTime = v.tm;
      groups[key].details.push(v);
    });

  return Object.values(groups);
};

interface BalanceComponentProps extends BoxProps {
  data: DbBalanceType[];
  allowFilter?: boolean;
}

export const BalanceComponent = ({
  data,
  allowFilter = true,
  ...other
}: BalanceComponentProps) => {
  const [knt, setKnt] = useState('');
  const [acnt, setAcnt] = useState('');
  const [sourceData, setSourceData] = useState<DbBalanceType[]>(data);

  useEffect(() => {
    setSourceData(data);
    // console.log('BalanceComponent useEffect: data=', data);
  }, [data]);
  const dataset = useMemo(() => {
    return sourceData.filter(
      (v) => (!knt || knt === v.shop) && (!acnt || v.acntno.startsWith(acnt)),
    );
  }, [knt, acnt, sourceData]);

  const kantToggleList = () => kantFromBalanceForToggle(sourceData);
  const acntToggleList = () => acntFromBalanceForToggle(sourceData);

  return (
    <Box {...other}>
      {allowFilter && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            paddingY: 1,
          }}
        >
          <VkToggle
            data={kantToggleList()}
            dflt={knt}
            label="Кантор"
            limit={3}
            fcb={(v) => setKnt(v)}
          />
          <VkToggle
            data={acntToggleList()}
            dflt={acnt}
            label="Рахунок"
            limit={3}
            fcb={(v) => setAcnt(v)}
          />
        </Box>
      )}

      <BalanceTable data={dataset} />
    </Box>
  );
};

export const BalanceTable = ({
  data,
  showHeader = false,
  ...other
}: {
  data: DbBalanceType[];
  showHeader?: boolean;
} & TableContainerProps) => {
  const dataset = transformBalanceForTable(data);
  return (
    <TableContainer component={Paper} {...other}>
      <Table
        size="small"
        aria-label="a dense table"
        sx={{
          width: '100%',
          minWidth: '200px', // скасовуємо стандартні 650px
          //   tableLayout: 'fixed', // (опційно) змушує колонки підлаштовуватися під 100%
        }}
      >
        {showHeader && (
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography color={grey[500]}></Typography>
              </TableCell>
              <TableCell align="center">
                <Typography color={grey[500]}></Typography>
              </TableCell>
              <TableCell align="right">
                <Typography color={grey[500]}></Typography>
              </TableCell>
              <TableCell align="right">
                <Typography color={grey[500]}></Typography>
              </TableCell>
              <TableCell align="right">
                <Typography color={grey[500]}></Typography>
              </TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {dataset.map((v) => (
            <BalanceRow key={v.name} row={v} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const BalanceRow = ({ row }: { row: BalanceRowType }) => {
  const [open, setOpen] = useState(false);
  const shft = useUserStore((state) => state.lastShift);
  return (
    <React.Fragment>
      {/* Головний агрегований рядок */}
      <TableRow
        sx={{
          '& > *': { borderBottom: 'unset' },
          '&:last-child td, &:last-child th': { border: 0 },
          bgcolor: open ? 'action.hover' : 'inherit',
          '& .MuiTableCell-root': {
            padding: '4px 8px',
          },
        }}
      >
        <TableCell>
          <Box sx={{ display: 'flex', gap: '5px' }}>
            <IconButton
              size="small"
              sx={{ padding: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              <ExpandMoreIcon
                sx={{
                  // transition: 'transform 0.2s',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
              {/* {open ? (
                <ExpandLessIcon key="less" />
              ) : (
                <ExpandMoreIcon key="more" />
              )} */}
            </IconButton>
            {row.name}
          </Box>
        </TableCell>
        <TableCell
          align="right"
          sx={{ color: hue(row.maxTime, shft, row.totalAmount) }}
        >
          {Math.abs(row.totalAmount).toLocaleString()}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            lineHeight: 1.1,
            color: hue(row.maxTime, shft),
          }}
        >
          <div style={{ fontSize: '90%' }}>
            <div>{row.income.toLocaleString()}</div>
            <div>{row.outcome.toLocaleString()}</div>
          </div>
        </TableCell>
        <TableCell
          align="right"
          sx={{ fontSize: '90%', color: hue(row.maxTime, shft) }}
        >
          {humanDate(row.maxTime)}
        </TableCell>
      </TableRow>

      {/* Вкладений рядок з деталями */}
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {/* <Box sx={{ margin: 1, mb: 2 }}> */}
            <Table
              size="small"
              sx={{
                width: '100%',
                minWidth: 'auto', // скасовуємо стандартні 650px
                //   tableLayout: 'fixed', // (опційно) змушує колонки підлаштовуватися під 100%
              }}
            >
              <TableBody>
                {row.details.map((detail, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      // '& > *': { borderBottom: 'unset' },
                      '&:last-child td, &:last-child th': { border: 0 },
                      '& .MuiTableCell-root': {
                        //   color: hue(detail.tm, shft),
                        fontSize: '90%',
                        padding: '4px 8px',
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: hue(detail.tm, shft),
                      }}
                    >
                      {detail.shop}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: hue(detail.tm, shft, detail.amnt),
                      }}
                    >
                      {Math.abs(detail.amnt).toLocaleString('uk-UA', {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        lineHeight: 1.1,
                        color: hue(detail.tm, shft),
                      }}
                    >
                      <div style={{ fontSize: '90%' }}>
                        <div>{detail.turndbt.toLocaleString()}</div>
                        <div>{detail.turncdt.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        lineHeight: 1.1,
                        color: hue(detail.tm, shft),
                      }}
                    >
                      <div style={{ fontSize: '90%' }}>
                        <div>{humanDate(detail.tm)}</div>
                        <div>{detail.acntno}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* </Box> */}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

/**
 *
 * @param {string} amnt
 * @param {string} d date
 * @param {string} l lastShift date
 * @returns
 */
const hue = (d: string, l: string, amnt: number = 1) => {
  // console.log(`tm=${d.substring(0, 10)} shift=${l}`);
  if (d.startsWith(l)) {
    return Number(amnt) < 0 ? 'error.main' : 'text.primary';
    //   return Number(amnt) < 0 ? red[900] : grey[900];
  } else {
    return Number(amnt) < 0 ? 'error.light' : 'text.disabled';
    //    return Number(amnt) < 0 ? red[300] : grey[500];
  }
};
