// Описуємо інтерфейси для типізації
interface PivotItem {
  id: string;
  code: string;
  amnt: number[];
  chld?: PivotItem[];
}

// profit dataset to pivot transform
export const transformProfitDataset = (
  sqldata: any[],
  period: string,
  ddif: (p1: string, p2: string) => number,
) => {
  const tcolumn: string[] = [];
  const ttotal: number[] = [0, 0, 0];

  // Використовуємо індексні карти для миттєвого пошуку батьківських вузлів
  const rootMap: Record<string, PivotItem> = {};
  const chldMap: Record<string, PivotItem> = {};

  sqldata.forEach((v) => {
    // 1. Розраховуємо індекс колонки один раз для поточної ітерації
    const colIdx = ddif(period, v.period);

    // 2. Збираємо колонки та загальні підсумки
    tcolumn[colIdx] = v.period;
    ttotal[colIdx] += Number(v.amnt || 0);

    // 3. Рівень 0 (gr0)
    if (!rootMap[v.gr0]) {
      rootMap[v.gr0] = {
        id: `${v.so}/${v.gr0}`,
        code: v.gr0,
        amnt: [0, 0, 0],
        chld: [],
      };
    }
    rootMap[v.gr0].amnt[colIdx] += Number(v.amnt || 0);

    // 4. Рівень 1 (gr1)
    const gr1Key = `${v.gr0}-${v.gr1}`; // унікальний ключ для рівня 1
    if (!chldMap[gr1Key]) {
      chldMap[gr1Key] = {
        id: `${v.so}/${v.gr1}`,
        code: v.gr1,
        amnt: [0, 0, 0],
        chld: [],
      };
      rootMap[v.gr0].chld!.push(chldMap[gr1Key]);
    }
    chldMap[gr1Key].amnt[colIdx] += Number(v.amnt || 0);

    // 5. Рівень 2 (code)
    const codeKey = `${gr1Key}-${v.code}`; // унікальний ключ для рівня 2
    if (!chldMap[codeKey]) {
      chldMap[codeKey] = {
        id: `${v.so}/${v.code}`,
        code: v.code,
        amnt: [0, 0, 0],
      };
      chldMap[gr1Key].chld!.push(chldMap[codeKey]);
    }
    chldMap[codeKey].amnt[colIdx] += Number(v.amnt || 0);
  });

  return {
    column: tcolumn,
    total: ttotal,
    dataset: Object.values(rootMap), // перетворюємо карту на лінійний масив для рендеру
  };
};

interface PivotRow {
  id: string;
  code: string;
  amnt: number[]; // масив сум за періодами [col0, col1, col2]
  chld?: PivotRow[];
}

export const buildThreeLevelPivot = (
  sqldata: any[],
  period: string,
  ddif: (p1: string, p2: string) => number,
) => {
  const tcolumn: string[] = [];
  const ttotal: number[] = [0, 0, 0]; // Ініціалізація під Grand Total

  // Хеш-мапи для швидкого доступу до гілок дерева
  const rootMap: Record<string, PivotRow> = {};
  const subMap: Record<string, PivotRow> = {};

  sqldata.forEach((v) => {
    // Індекс стовпчика (0, 1 або 2) обчислюємо ОДИН раз для кожного рядка
    const colIdx = ddif(period, v.period);

    // Заповнюємо заголовки стовпчиків та Grand Total
    tcolumn[colIdx] = v.period;
    ttotal[colIdx] += Number(v.amnt || 0);

    // --- РІВЕНЬ 1: TOTAL (gr0) ---
    if (!rootMap[v.gr0]) {
      rootMap[v.gr0] = {
        id: `${v.so}/${v.gr0}`,
        code: v.gr0,
        amnt: [0, 0, 0],
        chld: [],
      };
    }
    rootMap[v.gr0].amnt[colIdx] += Number(v.amnt || 0);

    // --- РІВЕНЬ 2: SUBTOTAL (gr1) ---
    const subKey = `${v.gr0}-${v.gr1}`; // унікальний ключ гілки
    if (!subMap[subKey]) {
      subMap[subKey] = {
        id: `${v.so}/${v.gr1}`,
        code: v.gr1,
        amnt: [0, 0, 0],
        chld: [],
      };
      rootMap[v.gr0].chld!.push(subMap[subKey]);
    }
    subMap[subKey].amnt[colIdx] += Number(v.amnt || 0);

    // --- РІВЕНЬ 3: DATA (code) ---
    // Для кінцевих даних ключ має враховувати весь шлях, щоб уникнути дублів
    const dataKey = `${subKey}-${v.code}`;
    if (!subMap[dataKey]) {
      subMap[dataKey] = {
        id: `${v.so}/${v.code}`,
        code: v.code,
        amnt: [0, 0, 0],
      };
      subMap[subKey].chld!.push(subMap[dataKey]);
    }
    subMap[dataKey].amnt[colIdx] += Number(v.amnt || 0);
  });

  return {
    column: tcolumn,
    grandTotal: ttotal, // Повністю готовий Grand Total
    dataset: Object.values(rootMap), // Масив ієрархічних даних для рендеру
  };
};
