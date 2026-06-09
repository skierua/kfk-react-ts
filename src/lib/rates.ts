import type { DbRateType } from '../store/DbTypes';
import { APP_CONFIG } from '../const';

export interface iRateDataset {
  data: DbRateType[];
  kantFilter?: string;
  curFilter?: string;
  cursubFilter?: string;
  sortFilter?: number;
  typeFilter?: number;
}

export const ratesDataset = ({
  data,
  kantFilter,
  curFilter,
  cursubFilter,
  sortFilter,
  typeFilter,
}: iRateDataset): DbRateType[] => {
  if (!data || !Array.isArray(data)) {
    console.error('ratesDataset: data is null or not an array');
    return [];
  }

  if (data.length === 0) return [];

  return data.filter((v) => {
    const matchesCur = curFilter ? v.atclcode === curFilter : true;
    const matchesCursub = cursubFilter ? v.scode === cursubFilter : true;
    const matchesSort = sortFilter ? v.sortorder < sortFilter : true;
    const matchesType = typeFilter ? v.domestic === typeFilter : true;

    if (!matchesCur || !matchesCursub || !matchesSort || !matchesType)
      return false;

    if (kantFilter) {
      return v.shop === kantFilter;
    }

    return v.shop !== APP_CONFIG.BULK;
  });
};
export const ratesDataset_v2 = ({
  data,
  kantFilter,
  curFilter,
  cursubFilter,
  sortFilter,
  typeFilter,
}: iRateDataset): DbRateType[] => {
  if (!data || !Array.isArray(data)) {
    console.error('ratesDataset: data is null or not an array');
    return [];
  }

  if (data.length === 0) return [];

  return data.filter((v) => {
    return (
      (kantFilter ? v.shop === kantFilter : true) &&
      (curFilter ? v.atclcode === curFilter : true) &&
      (cursubFilter ? v.scode === cursubFilter : true) &&
      (sortFilter ? v.sortorder < sortFilter : true) &&
      (typeFilter ? v.domestic === typeFilter : true)
    );
  });
};

export const maxTime = (rateset: DbRateType[]): string => {
  return rateset.reduce((t, v) => {
    const max = v.bidtm > v.asktm ? v.bidtm : v.asktm;
    return max > t ? max : t;
  }, '');
};
