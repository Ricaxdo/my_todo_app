export type TodoStatsProps = {
  activeCount: number;
  userActiveCount: number;
  completionRate: number; // 0..100
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
};
