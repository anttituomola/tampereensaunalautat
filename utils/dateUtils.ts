export const isWinterSeason = (): boolean => {
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
  return currentMonth >= 10 || currentMonth <= 3; // October (10) through March (3)
};
