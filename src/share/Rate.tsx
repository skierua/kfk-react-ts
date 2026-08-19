import { useState, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box, { type BoxProps } from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer, {
  type TableContainerProps,
} from '@mui/material/TableContainer';
import TableCell, { type TableCellProps } from '@mui/material/TableCell';
import TableHead, { type TableHeadProps } from '@mui/material/TableHead';
import TableFooter, { type TableFooterProps } from '@mui/material/TableFooter';
import TableRow, { type TableRowProps } from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';

import { grey } from '@mui/material/colors';
const colorset = ['#f2f2f2', '#57ba98', grey[800]];

import { useDataStore } from '../store/useDataStore';
import type { DbRateType } from '../store/DbTypes';
import { VkToggle, type VkToggleDataType } from './VkToggle';
import { APP_CONFIG } from '../const';

interface iRateDataset {
  data: DbRateType[];
  kantFilter?: string;
  sortFilter?: number;
  typeFilter?: number;
}
const ratesDataset = ({
  data,
  kantFilter,
  sortFilter,
  typeFilter,
}: iRateDataset): DbRateType[] => {
  //   console.log(
  //     'kantF=',
  //     kantFilter,
  //     ' sortF=',
  //     sortFilter,
  //     ' typeF=',
  //     typeFilter,
  //   );
  return data.filter((v) => {
    const matchesSort = sortFilter ? v.sortorder < sortFilter : true;
    const matchesType = typeFilter ? v.domestic === typeFilter : true;

    if (!matchesSort || !matchesType) return false;

    if (kantFilter) {
      return v.shop === kantFilter;
    }

    return v.shop !== APP_CONFIG.BULK;
    //    if (kantFilter) {
    //       return (
    //         v.shop === kantFilter &&
    //         ((sortFilter && v.sortorder < sortFilter) ||
    //           (typeFilter && v.domestic === typeFilter))
    //       );
    //     }
    //     return (
    //       v.shop !== APP_CONFIG.BULK &&
    //       ((sortFilter && v.sortorder < sortFilter) ||
    //         (typeFilter && v.domestic === typeFilter))
    //     );
  });
};

const kantFromBalanceForToggle = (data: DbRateType[]): VkToggleDataType[] => {
  return data
    .filter(
      (value, index, array) =>
        array.findIndex((v) => v.shop === value.shop) === index,
    )
    .map((v) => {
      return { id: v.shop, sname: v.shop, name: v.shop };
    });
};

interface RateComponentProps extends BoxProps {
  showFlag?: boolean;
  curSortFilter?: number;
  kantFilter?: string;
  curTypeFilter?: number;
  showFilter?: boolean;
}

export const RateComponent = ({
  showFlag,
  curSortFilter,
  showFilter = true,
  kantFilter,
  curTypeFilter,
  ...other
}: RateComponentProps) => {
  const [knt, setKnt] = useState(kantFilter ?? '');
  const [bulk, setBulk] = useState(false);
  //   const [sortFilter, _setSortFilter] = useState(curSortFilter);
  const rawRates = useDataStore((state) => state.rates);

  const dataset: DbRateType[] = useMemo(() => {
    // const flt = viewMode === 'tiny' ? 30 : undefined; // include only main currencies
    // const sortFilter = knt === APP_CONFIG.BULK ? 1000 : curSortFilter;
    return ratesDataset({
      data: rawRates,
      kantFilter: knt,
      sortFilter: curSortFilter,
      typeFilter: curTypeFilter,
    });
  }, [rawRates, knt, curSortFilter, curTypeFilter]);

  const kantToggleList: VkToggleDataType[] = useMemo(() => {
    return kantFromBalanceForToggle(
      bulk
        ? rawRates.filter((v) => v.shop === APP_CONFIG.BULK)
        : rawRates.filter((v) => v.shop !== APP_CONFIG.BULK),
    );
  }, [rawRates, bulk]);

  return (
    <Box {...other}>
      {showFilter && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            paddingY: 1,
          }}
        >
          <VkToggle
            data={kantToggleList}
            dflt={knt}
            label="Кантор"
            limit={3}
            fcb={(v) => setKnt(v)}
          />
          <FormControlLabel
            control={<Switch />}
            sx={{ size: 'small' }}
            label="ГУРТ"
            checked={bulk}
            onChange={(_e, checked) => {
              setKnt(checked ? APP_CONFIG.BULK : '');
              setBulk(checked);
            }}
          />
        </Box>
      )}

      <RateTable
        data={dataset.filter((v) => !knt || v.shop === knt)}
        showCSub={knt === APP_CONFIG.BULK}
        showKant={kantToggleList.length > 1}
        showFlag={showFlag}
      />
    </Box>
  );
};

interface RateWrapperProps {
  data: DbRateType[];
  maxTime?: string;
  wtitle?: string;
  wfooter?: string;
  tblfooter?: string;
  showFlag?: boolean;
  funcPublish?: () => void;
}
export const RateWrapper = ({
  data,
  maxTime,
  wtitle,
  wfooter,
  tblfooter,
  showFlag,
  funcPublish,
  ...other
}: RateWrapperProps & BoxProps) => {
  const showKant = useMemo(() => {
    const uniqueKants = new Set(data.map((v) => v.shop));
    return uniqueKants.size > 1;
  }, [data]);

  return (
    <Box className="adm-dash-container" {...other}>
      {(wtitle || maxTime) && (
        <Box className="adm-dash-container-title-wrapper">
          <Box
            sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {funcPublish && !showKant && (
              <IconButton
                size="small"
                color="primary"
                // disabled={!share}
                onClick={funcPublish}
              >
                <ShareIcon />
              </IconButton>
            )}
            {wtitle && <div className="adm-dash-container-title">{wtitle}</div>}
          </Box>
          {maxTime && (
            <div className="adm-dash-container-title-tm">{maxTime}</div>
          )}
        </Box>
      )}

      <RateTable
        data={data}
        showCSub={true}
        footer={tblfooter}
        showFlag={showFlag}
        showKant={showKant}
      />
      {wfooter && <Alert severity="info">{wfooter}</Alert>}
    </Box>
  );
};

interface RateTableProps extends TableContainerProps {
  data: DbRateType[];
  showTitle?: boolean;
  footer?: string;
  showFlag?: boolean;
  showCSub?: boolean;
  showKant?: boolean;
}

export const RateTable = (props: RateTableProps) => {
  const {
    data,
    showTitle,
    footer,
    showFlag = true,
    showCSub = false,
    showKant = false,
    ...other
  } = props;
  return (
    <TableContainer
      component={Paper}
      // sx={{ overflowX: 'auto', width: '100%' }}
      {...other}
    >
      <Table
        size="small"
        aria-label="a dense table"
        sx={{
          // width: '100%',
          minWidth: 'auto', // скасовуємо стандартні 650px
          tableLayout: { xs: 'fixed', sm: 'auto' }, // (опційно) змушує колонки підлаштовуватися під 100%
        }}
      >
        {showTitle && <RateTableHead />}
        <TableBody>
          {data.map((v) => {
            return (
              (Number(v.bid) !== 0 || Number(v.ask) !== 0) && (
                <RateRow
                  // className="rates-table-row"
                  id={`${v.shop}-${v.atclcode}-${v.scode}`}
                  key={`${v.shop}-${v.atclcode}-${v.scode}`}
                  // sub={showCSub}
                  // rate={v}
                  code={v.atclcode}
                  chid={v.chid}
                  flag={(showFlag ?? true) ? v.atclcode : undefined}
                  sname={showCSub ? v.sname : undefined}
                  kant={showKant ? v.shop : undefined}
                  bid={Number(v.bid)}
                  ask={Number(v.ask)}
                />
              )
            );
          })}
        </TableBody>
        {footer && <RateTableFooter footer={footer} />}
      </Table>
    </TableContainer>
  );
};

const RateTableHead = ({ ...other }: TableHeadProps) => {
  return (
    <TableHead {...other}>
      <TableRow>
        <TableCell align="center" padding={'none'}>
          <Typography sx={{ fontSize: '0.9rem', color: grey[500] }}>
            назва
          </Typography>
        </TableCell>
        <TableCell
          align="center"
          padding={'none'}
          // width={"18%"}
          sx={{ bgcolor: colorset[0] }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: grey[500] }}>
            купівля
          </Typography>
        </TableCell>
        <TableCell
          align="center"
          padding={'none'}
          // width={"18%"}
          sx={{ bgcolor: colorset[0] }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: grey[500] }}>
            продаж
          </Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const RateTableFooter = ({
  footer,
  ...other
}: { footer?: string } & TableFooterProps) => {
  return (
    <TableFooter {...other}>
      <TableRow>
        <TableCell align="center" colSpan={3}>
          <Typography color={grey[600]}>{footer}</Typography>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

interface RateRowProps extends TableRowProps {
  code: string;
  chid: string;
  flag?: string;
  sname?: string;
  kant?: string;
  bid: number;
  ask: number;
}

export const RateRow = ({
  code,
  chid,
  flag,
  sname,
  kant,
  bid,
  ask,
  ...other
}: RateRowProps) => {
  return (
    <TableRow
      // "&:last-child td, &:last-child th": { border: 0 },
      sx={{
        '&:last-child td,  &:last-child th': { border: 0 },
      }}
      {...other}
    >
      <TableCell
        align="center"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '8px 4px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          {flag && (
            <Box
              component="img"
              sx={{
                height: '1.4rem', //{ xs: "1rem", sm: "3vmin" },
                // width: "32px",
                maxHeight: { xs: 233, sm: 167 },
                // maxWidth: { xs: 350, sm: 250 },
                border: 'solid lightgrey 1px',
                borderRadius: 1,
              }}
              alt={chid}
              src={`/flag/${flag}.svg`}
            />
          )}
          <div>{chid}</div>
          {kant && <div style={{ fontSize: '0.8rem' }}>{kant}</div>}
          {sname && <div style={{ fontSize: '0.7rem' }}>{sname}</div>}
        </Box>
      </TableCell>
      <RateCell amnt={bid} />
      <RateCell amnt={ask} />
    </TableRow>
  );
};

const RateCell = ({ amnt, ...other }: { amnt: number } & TableCellProps) => {
  return (
    <TableCell
      align="center"
      sx={{
        padding: { xs: '0', sm: '8px 4px' },
        width: { xs: '25%', sm: '80px' },
      }}
      // width="30%"
      {...other}
    >
      {/* <Typography color={grey[800]}> */}
      {amnt !== 0 ? amnt.toPrecision(4) : ''}
      {/* </Typography> */}
    </TableCell>
  );
};

export const Rate4Element = ({
  data,
  ...other
}: { data: DbRateType } & BoxProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.85rem',
      }}
      {...other}
    >
      <Avatar
        src={`/flag/${data.atclcode}.svg`}
        sx={{
          width: '1.2rem',
          height: '1.2rem',
          border: 'solid lightgrey 1px',
        }}
      />
      {data.chid}&nbsp; {data.bid.toPrecision(data.bid < 1 ? 3 : 4)}
    </Box>
  );
};

export interface CrossTableDataType {
  base: DbRateType;
  direct?: DbRateType[]; // direct conversion rates (base -> target)
  reverse?: DbRateType[]; // reverse conversion rates (target -> base)
}

interface CrossTableProps extends TableContainerProps {
  title?: string;
  data: CrossTableDataType;
}

export const CrossTable = ({ title, data, ...other }: CrossTableProps) => {
  return (
    <TableContainer
      component={Paper}
      // sx={{ overflowX: 'auto', width: '100%' }}
      {...other}
    >
      <Table
        size="small"
        aria-label="a dense table"
        sx={{
          // width: '100%',
          minWidth: 'auto', // скасовуємо стандартні 650px
          tableLayout: { xs: 'fixed', sm: 'auto' }, // (опційно) змушує колонки підлаштовуватися під 100%
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="center" padding={'none'}>
              <Typography variant="caption" color="text.secondary">
                {title ?? 'Назва'}
              </Typography>
            </TableCell>
            <TableCell align="center" padding={'none'}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <Typography variant="caption">bid/bid</Typography>
                <Typography variant="caption">bid/ask</Typography>
              </Box>
            </TableCell>
            <TableCell align="center" padding={'none'}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <Typography variant="caption">ask/bid</Typography>
                <Typography variant="caption">ask/ask</Typography>
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.reverse &&
            data.reverse.map((v) => {
              return (
                <TableRow key={`rev-${v.shop}-${v.atclcode}-${v.scode}`}>
                  <TableCell align="center" padding={'none'}>
                    {`${v.chid}>${data.base.chid}`}
                  </TableCell>
                  <TableCell align="center" padding={'none'}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <Typography variant="body2">
                        {(
                          (v.bid * data.base.rqty) /
                          (data.base.bid * v.rqty)
                        ).toFixed(4)}
                      </Typography>
                      <Typography variant="body2">
                        {(
                          (v.bid * data.base.rqty) /
                          (data.base.ask * v.rqty)
                        ).toFixed(4)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center" padding={'none'}>
                    <Typography variant="body2">
                      {(
                        (v.ask * data.base.rqty) /
                        (data.base.bid * v.rqty)
                      ).toFixed(4)}
                    </Typography>
                    <Typography variant="body2">
                      {(
                        (v.ask * data.base.rqty) /
                        (data.base.ask * v.rqty)
                      ).toFixed(4)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          {data.direct &&
            data.direct.map((v) => {
              return (
                <TableRow key={`rev-${v.shop}-${v.atclcode}-${v.scode}`}>
                  <TableCell align="center" padding={'none'}>
                    {`${data.base.chid}>${v.chid}`}
                  </TableCell>
                  <TableCell align="center" padding={'none'}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <Typography variant="body2">
                        {(
                          (data.base.bid * v.rqty) /
                          (v.bid * data.base.rqty)
                        ).toFixed(4)}
                      </Typography>
                      <Typography variant="body2">
                        {(
                          (data.base.bid * v.rqty) /
                          (v.ask * data.base.rqty)
                        ).toFixed(4)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center" padding={'none'}>
                    <Typography variant="body2">
                      {(
                        (data.base.ask * v.rqty) /
                        (v.bid * data.base.rqty)
                      ).toFixed(4)}
                    </Typography>
                    <Typography variant="body2">
                      {(
                        (data.base.ask * v.rqty) /
                        (v.ask * data.base.rqty)
                      ).toFixed(4)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
        {/* {footer && <RateTableFooter footer={footer} />} */}
      </Table>
    </TableContainer>
  );
};
