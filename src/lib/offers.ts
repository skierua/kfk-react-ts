import type { OfferType } from '../lib/types';
import type { VkToggleDataType } from '../share/VkToggle';

interface iOffersDataset {
  data: OfferType[];
  kantFilter?: string;
  curFilter?: string;
  typeFilter?: string; //'bid' | 'ask' | '';
}

export const offersDataset = ({
  data,
  kantFilter,
  curFilter,
  typeFilter,
}: iOffersDataset): OfferType[] => {
  if (!data || !Array.isArray(data)) {
    console.error('offersDataset: data is null or not an array');
    return [];
  }

  if (data.length === 0) return [];

  return data.filter((v) => {
    if (kantFilter && v.shop !== kantFilter) return false;
    if (curFilter && v.curid !== curFilter) return false;
    if (typeFilter && v.bidask !== typeFilter) return false;

    return true;
  });
};

export const kantToggleList = (data: OfferType[]): VkToggleDataType[] => {
  return data
    .filter(
      (value, index, array) =>
        array.findIndex((v) => v.shop === value.shop) === index,
    )
    .sort((a, b) => (a.so || 999) - (b.so || 999))
    .map((v) => {
      return { id: v.shop, sname: v.shop, name: v.shop };
    });
};

export const curToggleList = (data: OfferType[]): VkToggleDataType[] => {
  return data
    .filter(
      (value, index, array) =>
        array.findIndex((v) => v.curid === value.curid) === index,
    )
    .map((v) => {
      return { id: v.curid, sname: v.chid, name: v.chid };
    });
};

export const baToggleList = (data: OfferType[]): VkToggleDataType[] => {
  return data
    .filter(
      (value, index, array) =>
        array.findIndex((v) => v.bidask === value.bidask) === index,
    )
    .map((v) => {
      return { id: v.bidask, sname: v.bidask, name: v.bidask };
    });
};
