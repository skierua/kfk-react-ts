import { useState, useEffect } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import KeyboardArrowMoreIcon from '@mui/icons-material/KeyboardArrowMore';
interface PivotRow {
  id: string;
  code: string;
  amnt: number[];
  chld?: PivotRow[];
}
interface PivotTableProps {
  columns: string[]; // Масив назв колонок з функції (tcolumn)
  grandTotal: number[]; // Масив загальних сум (grandTotal)
  dataset: PivotRow[]; // Ієрархічні дані (dataset)
}

export const ProfitTable = ({
  columns,
  grandTotal,
  dataset,
}: PivotTableProps) => {
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Кнопки керування над таблицею */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 1, justifyContent: 'flex-end' }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={isAllExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
          onClick={() => setIsAllExpanded(!isAllExpanded)}
          sx={{ borderRadius: '15px', textTransform: 'none' }}
        >
          {isAllExpanded ? 'Згорнути всі' : 'Розгорнути всі'}
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        elevation={2}
        sx={{ maxWidth: '100%', overflowX: 'auto' }}
      >
        <Table size="small" sx={{ tableLayout: { xs: 'fixed', sm: 'auto' } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Місяць</TableCell>
              {columns.map((colName, idx) => (
                <TableCell key={idx} align="right" sx={{ fontWeight: 'bold' }}>
                  {colName || `Період ${idx + 1}`}
                </TableCell>
              ))}
            </TableRow>
            <TableRow sx={{ bgcolor: 'grey.200' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                ВСЬОГО
              </TableCell>
              {grandTotal.map((val, idx) => (
                <TableCell
                  key={idx}
                  align="right"
                  sx={{
                    fontWeight: 'bold',
                    color: val < 0 ? 'error.main' : 'text.primary',
                  }}
                >
                  {val.toLocaleString('uk-UA')}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {dataset.map((totalRow) => (
              <TotalRowGroup
                key={totalRow.id}
                totalRow={totalRow}
                forceOpen={isAllExpanded}
              />
            ))}
          </TableBody>

          <TableFooter></TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};

const SubTotalRowGroup = ({
  subRow,
  forceOpen,
}: {
  subRow: PivotRow;
  forceOpen: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const hasChildren = !!subRow.chld?.length;

  // Синхронізуємо стан, коли користувач тисне кнопку "Розгорнути всі"
  useEffect(() => {
    setOpen(forceOpen);
  }, [forceOpen]);

  return (
    <>
      <TableRow
        // sx={{ bgcolor: 'action.hover' }}
        sx={{
          '& > *': { borderBottom: 'unset' },
          '&:last-child td, &:last-child th': { border: 0 },
          // bgcolor: 'action.hover',
          // bgcolor: open ? 'action.hover' : 'inherit',
          '& .MuiTableCell-root': {
            padding: '4px 8px',
            tableLayout: 'fixed',
          },
        }}
      >
        <TableCell sx={{ pl: 4 }}>
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => setOpen(!open)}
              sx={{ p: 0, mr: 1 }}
            >
              <ExpandMoreIcon
                sx={{
                  transition: 'transform 0.2s',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </IconButton>
          )}
          <i>{subRow.code}</i>
        </TableCell>
        {subRow.amnt.map((val, idx) => (
          <TableCell key={idx} align="right">
            <Typography
              variant="body2"
              color={val < 0 ? 'error.main' : 'text.primary'}
            >
              {val.toLocaleString('uk-UA')}
            </Typography>
          </TableCell>
        ))}
      </TableRow>

      {/* Рівень 3: Data */}
      {hasChildren && (
        <TableRow
          sx={{
            '& > *': { borderBottom: 'unset' },
            '&:last-child td, &:last-child th': { border: 0 },
            // bgcolor: 'action.hover',
            // bgcolor: open ? 'action.hover' : 'inherit',
            '& .MuiTableCell-root': {
              padding: '4px 8px',
              tableLayout: 'fixed',
            },
          }}
        >
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={subRow.amnt.length + 1}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ py: 0.5 }}>
                {subRow.chld!.map((dataRow) => (
                  <Box
                    key={dataRow.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `1fr repeat(${dataRow.amnt.length}, 1fr)`,
                      alignItems: 'center',
                      py: 0.8,
                      borderBottom: '1px dashed #eee',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <Box
                      sx={{
                        pl: 8,
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    >
                      {dataRow.code}
                    </Box>
                    {dataRow.amnt.map((val, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          textAlign: 'right',
                          pr: 2,
                          fontSize: '0.875rem',
                          color: val < 0 ? 'error.main' : 'text.primary',
                        }}
                      >
                        {val.toLocaleString('uk-UA')}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const TotalRowGroup = ({
  totalRow,
  forceOpen,
}: {
  totalRow: PivotRow;
  forceOpen: boolean;
}) => {
  const [open, setOpen] = useState(true);
  const hasChildren = !!totalRow.chld?.length;

  useEffect(() => {
    setOpen(forceOpen);
  }, [forceOpen]);

  return (
    <>
      <TableRow
        sx={{
          '& > *': { borderBottom: 'unset' },
          '&:last-child td, &:last-child th': { border: 0 },
          bgcolor: open ? 'action.hover' : 'inherit',
          '& .MuiTableCell-root': {
            padding: '4px 8px',
            tableLayout: 'fixed',
          },
        }}
      >
        <TableCell sx={{ fontWeight: 'bold' }}>
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => setOpen(!open)}
              sx={{ p: 0, mr: 1 }}
            >
              <ExpandMoreIcon
                sx={{
                  transition: 'transform 0.2s',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </IconButton>
          )}
          {totalRow.code}
        </TableCell>
        {totalRow.amnt.map((val, idx) => (
          <TableCell
            key={idx}
            align="right"
            sx={{
              fontWeight: 'bold',
              color: val < 0 ? 'error.main' : 'text.primary',
            }}
          >
            {val.toLocaleString('uk-UA')}
          </TableCell>
        ))}
      </TableRow>

      {hasChildren && (
        <TableRow
          sx={{
            '& > *': { borderBottom: 'unset' },
            '&:last-child td, &:last-child th': { border: 0 },
            // bgcolor: open ? 'action.hover' : 'inherit',
            '& .MuiTableCell-root': {
              padding: '4px 8px',
              tableLayout: 'fixed',
            },
          }}
        >
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={totalRow.amnt.length + 1}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              {totalRow.chld!.map((subRow) => (
                <SubTotalRowGroup
                  key={subRow.id}
                  subRow={subRow}
                  forceOpen={forceOpen}
                />
              ))}
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
