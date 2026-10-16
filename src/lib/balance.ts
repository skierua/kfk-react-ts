import type { VkToggleDataType } from '../share/VkToggle';

export const kantFromBalanceForToggle = (data: any[]): VkToggleDataType[] => {
  // console.log(data);
  return data
    .filter(
      (value, index, array) =>
        array.findIndex((v) => v.shop === value.shop) === index,
    )
    .sort((a, b) => Number(a.shso || 99) - Number(b.shso || 99))
    .map((v) => {
      return { id: v.shop, sname: v.shop, name: v.shop };
    });
};

export const acntFromBalanceForToggle = (data: any[]): VkToggleDataType[] => {
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
    })
    .sort((a, b) => a.sname.localeCompare(b.sname));
};
