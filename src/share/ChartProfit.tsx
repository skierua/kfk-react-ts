import { useState, useEffect, useMemo } from 'react';
import {
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BarChart, type BarChartProps } from '@mui/x-charts/BarChart';
import dayjs, { Dayjs } from 'dayjs';

// --- Опис інтерфейсів для TypeScript ---
export interface DbChartProfitRow {
  acnt: string;
  shop: string;
  cashier: string;
  chid: string;
  period: string; // YYYY-MM
  total: number; // сума прибутку
  wage: number; // зарплата
  cso: number;
  sso: number;
}

interface ChartState {
  dataset: Record<string, any>[];
  series: { dataKey: string; label: string }[];
}

interface ChartProfitProps {
  sqldata: DbChartProfitRow[];
  fsubmit: (params: { reqid: string; from: string; to: string }) => void;
}

// Помічник для створення унікальних масивів без використання бітових операторів `!~`
const getUniqueValues = (
  data: DbChartProfitRow[],
  key: 'period' | 'cashier' | 'chid',
): string[] => {
  return Array.from(new Set(data.map((v) => v[key]))).sort();
};

export const ChartProfit = ({ sqldata, fsubmit }: ChartProfitProps) => {
  const [period, setPeriod] = useState<Dayjs>(dayjs());

  // Автоматичний розрахунок часового інтервалу (6 місяців) через Dayjs
  const timeInterval = useMemo(() => {
    const pto = period.format('YYYY-MM');
    const computedFrom = period.subtract(5, 'month').format('YYYY-MM');
    const pfrom = computedFrom < '2024-02' ? '2024-02' : computedFrom;
    return { pfrom, pto };
  }, [period]);

  // Тригер завантаження даних при зміні періоду
  useEffect(() => {
    fsubmit({
      reqid: 'chartprofit',
      from: timeInterval.pfrom,
      to: timeInterval.pto,
    });
  }, [period, timeInterval, fsubmit]);

  // --- Головна функція генерації датасетів для касирів (Оптимізована) ---
  const buildCashierDataset = (
    data: DbChartProfitRow[],
    periods: string[],
    cashiers: string[],
    filterCurrency = '',
  ): ChartState => {
    // 1. Створюємо серії для MUI X Charts
    const series = cashiers.map((cshr) => ({
      dataKey: cshr,
      label: cshr,
    }));

    // 2. Ініціалізуємо матрицю рядків по місяцях
    const dataset = periods.map((p) => {
      const row: Record<string, any> = {
        pr: p,
        month: dayjs(p).locale('uk').format('MMM'), // короткий місяць (напр. "трав.")
      };

      cashiers.forEach((cshr) => {
        row[cshr] = 0;
        row[`${cshr}_wage`] = 0;
        row[`${cshr}_effic`] = 0;
      });
      return row;
    });

    // 3. Наповнюємо даними БЕЗ мутації оригінального масиву
    data.forEach((v) => {
      if (!filterCurrency || v.chid === filterCurrency) {
        const targetRow = dataset.find((row) => row.pr === v.period);
        if (targetRow) {
          // Безпечно додаємо фінансові показники (v.total замість мутованого v.amnt)
          targetRow[v.cashier] += Math.round(Number(v.total || 0));
          targetRow[`${v.cashier}_wage`] = Math.round(Number(v.wage || 0));
        }
      }
    });

    // 4. Розраховуємо ефективність
    dataset.forEach((row) => {
      cashiers.forEach((cshr) => {
        const wage = row[`${cshr}_wage`];
        if (row[cshr] !== 0 && wage > 0) {
          row[`${cshr}_effic`] = row[cshr] / wage - 1;
        }
      });
    });

    return { dataset, series };
  };

  // --- Типізована версія вашої оригінальної функції curDataset ---
  const buildCurrencyDataset = (
    data: DbChartProfitRow[],
    periods: string[],
  ): ChartState => {
    const cols = ['USD', 'EUR', 'PLN', 'other'];

    // Створюємо серії для MUI X Charts (з перекладом "інші")
    const series = cols.map((v) => ({
      dataKey: v,
      label: v === 'other' ? 'інші' : v,
    }));

    // Ініціалізуємо базову матрицю для місяців
    const dataset = periods.map((p) => {
      const row: Record<string, any> = {
        pr: p,
        month: dayjs(p).locale('uk').format('MMM'), // короткий місяць українською
      };
      cols.forEach((col) => {
        row[col] = 0;
      });
      return row;
    });

    // Наповнюємо даними за вашим алгоритмом (але через швидкий .find без мутацій)
    data.forEach((v) => {
      const targetRow = dataset.find((row) => row.pr === v.period);

      if (targetRow) {
        const amount = Math.round(Number(v.total || 0));

        // Перевіряємо, чи це основна валюта, чи відносимо до "other"
        if (v.chid === 'USD' || v.chid === 'EUR' || v.chid === 'PLN') {
          targetRow[v.chid] += amount;
        } else {
          targetRow['other'] += amount;
        }
      }
    });

    return { dataset, series };
  };

  // --- useMemo для кешування розрахунків графіків ---
  const chartsData = useMemo(() => {
    if (sqldata.length === 0) {
      return {
        profit: { dataset: [], series: [] },
        ptotal: { dataset: [], series: [] },
        pusd: { dataset: [], series: [] },
        peur: { dataset: [], series: [] },
        ppln: { dataset: [], series: [] },
      };
    }

    const uniquePeriods = getUniqueValues(sqldata, 'period');
    const uniqueCashiers = getUniqueValues(sqldata, 'cashier');

    return {
      profit: buildCashierDataset(sqldata, uniquePeriods, uniqueCashiers),
      ptotal: buildCurrencyDataset(sqldata, uniquePeriods),
      pusd: buildCashierDataset(sqldata, uniquePeriods, uniqueCashiers, 'USD'),
      peur: buildCashierDataset(sqldata, uniquePeriods, uniqueCashiers, 'EUR'),
      ppln: buildCashierDataset(sqldata, uniquePeriods, uniqueCashiers, 'PLN'),
    };
  }, [sqldata]);

  // Внутрішній універсальний компонент графіка
  const SafeBarChart = ({
    title,
    ...chartProps
  }: BarChartProps & { title: string }) => (
    <Stack spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 'bold', color: 'text.secondary' }}
      >
        {title}
      </Typography>
      <BarChart {...chartProps} width={340} height={220} />
    </Stack>
  );

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: { md: 360 }, p: 1 }}>
      {/* Вибір місяця */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Звітний період"
          views={['month', 'year']}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          value={period}
          onChange={(v) => v && setPeriod(v)}
          format="MM-YYYY"
          closeOnSelect
          disableFuture
        />
      </LocalizationProvider>

      {/* Секція 1: Працівники */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 'bold' }}>
            Аналітика працівників
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SafeBarChart
            dataset={chartsData.profit.dataset}
            xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
            series={chartsData.profit.series}
            title="Загальний прибуток по касирах"
          />
        </AccordionDetails>
      </Accordion>

      {/* Секція 2: Валюти */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 'bold' }}>
            Розподіл по валютах
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SafeBarChart
            dataset={chartsData.ptotal.dataset}
            xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
            series={chartsData.ptotal.series}
            title="Разом за всіма валютами"
          />
          <SafeBarChart
            dataset={chartsData.pusd.dataset}
            xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
            series={chartsData.pusd.series}
            title="Прибуток у секції USD"
          />
          <SafeBarChart
            dataset={chartsData.peur.dataset}
            xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
            series={chartsData.peur.series}
            title="Прибуток у секції EUR"
          />
          <SafeBarChart
            dataset={chartsData.ppln.dataset}
            xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
            series={chartsData.ppln.series}
            title="Прибуток у секції PLN"
          />
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};
