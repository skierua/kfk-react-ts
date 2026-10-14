import type { DbCurrencyType } from '../store/DbTypes';

interface iCurrencyDataset {
  data: DbCurrencyType[];
  sortFilter?: number;
  typeFilter?: number;
}

export const currenciesDataset = ({
  data,
  sortFilter,
  typeFilter,
}: iCurrencyDataset): DbCurrencyType[] => {
  if (!data || !Array.isArray(data)) {
    console.error('currenciesDataset: data is null or not an array');
    return [];
  }
  // console.log('currenciesDataset: data=', data.length);
  if (data.length === 0) return [];

  return data
    .filter((v) => {
      const matchesSort = sortFilter ? v.so < sortFilter : true;
      const matchesType = typeFilter ? v.dmst === typeFilter : true;

      if (!matchesSort || !matchesType) return false;

      return true;
    })
    .sort((a, b) => {
      if (a.so !== b.so) {
        return a.so - b.so;
      }
      return a.name.localeCompare(b.name);
    });
};

export const foreignDataset = (data: DbCurrencyType[]): DbCurrencyType[] => {
  if (!data || !Array.isArray(data)) {
    console.error('foreignDataset: data is null or not an array');
    return [];
  }

  if (data.length === 0) return [];

  return data
    .filter((v) => v.dmst !== 1)
    .sort((a, b) => {
      if (a.so !== b.so) {
        return a.so - b.so;
      }
      return a.name.localeCompare(b.name);
    });
};
