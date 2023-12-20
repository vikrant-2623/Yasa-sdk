export const number2Percent = (v: number, fixed = 0): string => {
  return !isNaN(Number(v * 100)) ? Number(v * 100).toFixed(fixed) + "%" : "0%";
};

export const humpToLine = (str: string) => {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
};
