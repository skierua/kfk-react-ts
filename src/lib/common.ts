export function humanDate(vdate: string | undefined): string {
  if (!vdate) return '';

  const vcd = new Date(vdate);
  if (isNaN(vcd.getTime())) return vdate;

  const now = new Date();

  // Створюємо чисті календарні дати (без часу) для порівняння днів
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(vcd.getFullYear(), vcd.getMonth(), vcd.getDate());

  // Найнадійніший спосіб вирахувати різницю в календарних днях (без багів з переходом на літній/зимовий час та таймзон)
  const diffTime = today.getTime() - itemDate.getTime();
  const diffDays = Math.trunc(diffTime / (1000 * 60 * 60 * 24));

  // Отримуємо локальний час у форматі "HH:MM"
  const timeStr = vcd.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. Сьогодні
  if (diffDays === 0) {
    return timeStr;
  }

  // console.info(vdate, timeStr);

  // 2. Вчора
  if (diffDays === 1) {
    return `Вч ${timeStr}`;
  }

  // 3. Протягом останнього тижня (2 - 6 днів тому)
  if (diffDays > 1 && diffDays < 7) {
    const dayName = vcd.toLocaleDateString('uk-UA', { weekday: 'short' });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return `${capitalizedDay.replace('.', '')} ${timeStr}`; // Прибираємо крапку після дня тижня, якщо є
  }

  // 4. Більше тижня тому
  const isSameYear = now.getFullYear() === vcd.getFullYear();
  const options: Intl.DateTimeFormatOptions = isSameYear
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'short', year: 'numeric' };

  // Повертаємо локальну дату ("28 лип" або "28 лип 2025")
  return vcd.toLocaleDateString('uk-UA', options).replace('.', '');
}

export function old_humanDate(vdate: string | undefined): string {
  if (!vdate) return '';

  const vcd = new Date(vdate);
  if (isNaN(vcd.getTime())) return vdate;

  // Створюємо об'єкти лише для дат (без часу) для точного порівняння днів
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(vcd.getFullYear(), vcd.getMonth(), vcd.getDate());

  // Різниця в днях на основі календарних дат
  const diffDays = Math.round(
    (today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const timeStr = vcd.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diffDays === 0) {
    return timeStr;
  }

  if (diffDays === 1) {
    return `Вч ${timeStr}`;
  }

  if (diffDays > 1 && diffDays < 7) {
    // return `${diffDays} дн`;
    const dayName = vcd.toLocaleDateString('uk-UA', { weekday: 'short' });

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${timeStr}`;
  }

  const isSameYear = now.getFullYear() === vcd.getFullYear();
  const options: Intl.DateTimeFormatOptions = isSameYear
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'short', year: 'numeric' };

  return vcd.toLocaleDateString('uk-UA', options).replace('.', ''); // прибираємо крапку після місяця, якщо вона є

  // 4. Більше тижня -> просто дата (2023-10-25)
  // return vdate.slice(0, 10);
}

const FLAGS_BY_CHID: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  PLN: '🇵🇱',
  CZK: '🇨🇿',
  'EUR>USD': '🇪🇺➡️🇺🇸',
  'USD>PLN': '🇺🇸➡️🇵🇱',
  USDT: '🇺🇸 T',
  UAH: '🇺🇦',
};
export const getFlagByChid = (chid: string): string =>
  FLAGS_BY_CHID[chid] ?? '🏳️';

const FLAGS_BY_ID: Record<string, string> = {
  '840': '🇺🇸',
  '978': '🇪🇺',
  '826': '🇬🇧',
  '985': '🇵🇱',
  '203': '🇨🇿',
  '978840': '🇪🇺➡️🇺🇸',
  '840985': '🇺🇸➡️🇵🇱',
  '840T': '🇺🇸 T',
  '980': '🇺🇦',
};
export const getFlagById = (id: string): string => FLAGS_BY_ID[id] ?? '🏳️';

interface iTgMessage {
  data: any[]; // DbRateType[];
  title: string;
  footer?: string;
}
export function tgMessage({
  data,
  title,
  footer = '\n☎️ 096 001 36 00\n🌐 kantorfk.com',
}: iTgMessage): string {
  // Implementation for generating Telegram message
  if (!data || !Array.isArray(data)) {
    console.error('tgMessage: data is null or not an array');
    return '';
  }
  if (data.length === 0) return '';

  let str = title + '\n';
  str += data.reduce((acc, v) => {
    if (v.bid !== 0 || v.ask !== 0) {
      acc +=
        (v.bid === 0
          ? '--.--'
          : Number(v.bid).toLocaleString('uk-UA', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })) +
        ' ' +
        (v.rqty === '1' ? '' : `${v.rqty} `) +
        getFlagByChid(v.chid) +
        ' ' +
        (v.ask === 0
          ? '--.--'
          : Number(v.ask).toLocaleString('uk-UA', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })) +
        ' ' +
        v.sname +
        '\n';
      return acc;
    }
  }, '');

  str += footer + '\n';
  return str;
}

//  humanDate
/*export function humanDate1(vdate: string | undefined): string {
  if (vdate === undefined || vdate === '') {
    return '';
  }
  // return vdate;
  let vnd = new Date();
  let vcd = new Date(vdate);
  //   return "" + Math.floor((vnd - vcd) / (24 * 60 * 60 * 1000)) + "дн";
  if (1 < (vnd - vcd) / (365 * 24 * 60 * 60 * 1000)) {
    return '' + Math.floor((vnd - vcd) / (365 * 24 * 60 * 60 * 1000)) + 'рік';
  } else if (1 < (vnd - vcd) / (30 * 24 * 60 * 60 * 1000)) {
    return '' + Math.floor((vnd - vcd) / (30 * 24 * 60 * 60 * 1000)) + 'міс';
  } else if (1 < (vnd - vcd) / (7 * 24 * 60 * 60 * 1000)) {
    return '' + Math.floor((vnd - vcd) / (7 * 24 * 60 * 60 * 1000)) + 'тиж';
  } else if (2 <= (vnd - vcd) / (24 * 60 * 60 * 1000)) {
    return '' + Math.floor((vnd - vcd) / (24 * 60 * 60 * 1000)) + 'дн';
  } else if (1 < (vnd - vcd) / (24 * 60 * 60 * 1000)) {
    return 'Вч ' + vdate.substr(-5);
  }
  //  else {
  //     vdate = vdate.substr(11, 5);
  //   }

  return vdate.substring(11, 17);
}
*/

export function humanDate2(vdate: string | undefined): string {
  if (vdate === undefined || vdate === '') {
    return '';
  }
  let vnd = new Date();
  let vcd = new Date(vdate);
  // !!! FOR TESTING
  // return vcd.toLocaleTimeString("en-GB").substring(0, 5);
  if (vnd.toISOString().substring(0, 10) === vdate.substring(0, 10)) {
    return vcd.toLocaleTimeString('en-GB').substring(0, 5);
  }
  return vcd.toISOString().substring(0, 10);
}
