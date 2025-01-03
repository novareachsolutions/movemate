export type TFareCalculation = {
  distance: number;
  estimatedTime: number;
  packageWeight: number;
  isPeakHour?: boolean;
  isHighDemand?: boolean;
  isSpecialEvent?: boolean;
  isWeatherAffected?: boolean;
};
