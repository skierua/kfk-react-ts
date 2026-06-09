import { useMemo, useState, useEffect } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

import { VkToggle } from '../share/VkToggle';
import { postData } from '../driver';
import { useUserStore } from '../store/useUserStore';
import { ProfitTable } from '../share/Profit';

const REPO_LIST = [
  { name: 'КНТ дохід', id: 'kntprofit' },
  { name: 'ВАЛ дохід', id: 'curprofit' },
  { name: 'Касир дохід', id: 'cshprofit' },
];

interface DbProfitType {
  gr0: string; //"3500",
  gr1: string; // "FEYA",
  code: string; // "CZK",
  period: string; // "2026-05",
  so: string; // "\/3500\/15\/23",
  amnt: number; // "120"
}
interface PivotRow {
  id: string;
  code: string;
  amnt: number[];
  chld?: PivotRow[];
}

// --- Функція трансформації в Pivot (3 рівні) ---
const buildThreeLevelPivot = (
  sqldata: DbProfitType[],
  targetPeriod: string,
) => {
  const tcolumn: string[] = [];
  const ttotal: number[] = [0, 0, 0]; // Ініціалізація під 3 місяці (поточний + 2 попередні)
  const rootMap: Record<string, PivotRow> = {};
  const subMap: Record<string, PivotRow> = {};

  // Заповнюємо назви колонок у зворотному порядку (хронологічному)
  const baseDate = dayjs(targetPeriod);
  for (let i = 2; i >= 0; i--) {
    tcolumn[i] = baseDate.subtract(i, 'month').format('MM');
  }

  sqldata.forEach((v) => {
    // Рахуємо різницю в місяцях між обраним періодом та періодом запису
    const diff = baseDate.diff(dayjs(v.period), 'month');

    // Перевіряємо, чи входить місяць у наш 3-місячний діапазон (від 0 до 2)
    if (diff < 0 || diff > 2) return;

    const colIdx = diff;

    const amount = Number(v.amnt || 0);
    ttotal[colIdx] += amount;

    if (!rootMap[v.gr0]) {
      rootMap[v.gr0] = {
        id: `${v.so}/${v.gr0}`,
        code: v.gr0,
        amnt: [0, 0, 0],
        chld: [],
      };
    }
    rootMap[v.gr0].amnt[colIdx] += amount;

    const subKey = `${v.gr0}-${v.gr1}`;
    if (!subMap[subKey]) {
      subMap[subKey] = {
        id: `${v.so}/${v.gr1}`,
        code: v.gr1,
        amnt: [0, 0, 0],
        chld: [],
      };
      rootMap[v.gr0].chld!.push(subMap[subKey]);
    }
    subMap[subKey].amnt[colIdx] += amount;

    const dataKey = `${subKey}-${v.code}`;
    if (!subMap[dataKey]) {
      subMap[dataKey] = {
        id: `${v.so}/${v.code}`,
        code: v.code,
        amnt: [0, 0, 0],
      };
      subMap[subKey].chld!.push(subMap[dataKey]);
    }
    subMap[dataKey].amnt[colIdx] += amount;
  });

  return {
    columns: tcolumn,
    grandTotal: ttotal,
    dataset: Object.values(rootMap),
  };
};

export const ProfitView = ({ ...other }: BoxProps) => {
  const [repo, setRepo] = useState(REPO_LIST[0].id);
  const [period, setPeriod] = useState<Dayjs>(dayjs());
  const [dataset, setDataset] = useState<DbProfitType[]>([]);
  const { appUser } = useUserStore();

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const pto = period.format('YYYY-MM');
        const pfrom = period.subtract(2, 'month').format('YYYY-MM');

        const req = {
          reqid: repo,
          shop: (appUser?.role ?? '') !== 'owner' ? appUser?.term : '',
          from: pfrom,
          to: pto,
        };

        const reportData = await postData<any[]>(
          '/reports',
          JSON.stringify(req),
        );

        if (reportData && Array.isArray(reportData)) {
          setDataset(
            reportData.map((v) => ({
              gr0: v.gr0,
              gr1: v.gr1,
              code: v.code,
              period: v.period,
              so: v.so,
              amnt: Number(v.amnt || 0),
            })),
          );
        } else {
          setDataset([]);
        }
      } catch (err: any) {
        console.error('Помилка завантаження звіту доходу:', err.message);
        setDataset([]);
      }
    };

    loadReportData();
    return () => {};
  }, [repo, period, appUser]);

  const pivotData = useMemo(() => {
    return buildThreeLevelPivot(dataset, period.format('YYYY-MM'));
  }, [dataset, period]);

  return (
    <Box
      className="adm-dash-container"
      sx={{
        // minWidth: { xs: 'auto', sm: '360px' },
        width: { xs: 'auto', sm: '360px' },
      }}
      {...other}
    >
      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 3 } }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Початок"
            views={['month', 'year']}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            value={period}
            onChange={(newValue) => {
              if (newValue) setPeriod(newValue);
            }}
            format="MM-YYYY"
            closeOnSelect={true}
            disableFuture={true}
          />
        </LocalizationProvider>

        <VkToggle
          data={REPO_LIST}
          dflt={repo}
          limit={0}
          allowAll={false}
          fcb={(v) => setRepo(v)}
        />
      </Box>
      <Box className="adm-dash-container-title-wrapper">
        <Box className="adm-dash-container-title">Balance</Box>
      </Box>
      <ProfitTable
        columns={pivotData.columns}
        grandTotal={pivotData.grandTotal}
        dataset={pivotData.dataset}
      />{' '}
    </Box>
  );
};
