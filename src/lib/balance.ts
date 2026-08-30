import type { DbBalanceType } from '../store/DbTypes';
import type { VkToggleDataType } from '../share/VkToggle';

interface iBalanceDataset {
  data: DbBalanceType[];
  bal: string;
  sortFilter?: number;
  shft?: string | undefined;
}

export const balanceDataset = ({
  data,
  bal,
  sortFilter = 1000,
  shft,
}: iBalanceDataset): DbBalanceType[] => {
  return data.filter((v) => {
    return (
      v.acntno.startsWith(bal) &&
      // v.cuso < sortFilter
      (v.cuso < sortFilter || !shft || v.tm.startsWith(shft))
    );
  });
};

export const kantFromBalanceForToggle = (
  data: DbBalanceType[],
): VkToggleDataType[] => {
  return data
    .filter(
      (value, index, array) =>
        array.findIndex((v) => v.shop === value.shop) === index,
    )
    .map((v) => {
      return { id: v.shop, sname: v.shop, name: v.shop };
    });
};

export const acntFromBalanceForToggle = (
  data: DbBalanceType[],
): VkToggleDataType[] => {
  return data
    .filter(
      (value, index, array) =>
        array.findIndex(
          (v) => v.acntno.slice(0, 4) === value.acntno.slice(0, 4),
        ) === index,
    )
    .map((v) => {
      return {
        id: v.acntno.slice(0, 4),
        sname: v.acntno.slice(2, 4),
        name: v.acntno.slice(0, 4),
      };
    });
};
