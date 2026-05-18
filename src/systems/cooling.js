export const calculateCooling = ({
  nextTemperature,
  cooling,
  usedCapacity,
  totalCapacity,
}) => {
  let finalTemperature = nextTemperature;

  /* NETWORK OVERLOAD */

  const usageRatio =
    usedCapacity / Math.max(totalCapacity, 1);

  if (usageRatio > 0.9) {
    finalTemperature += 10;
  }

  /* EXTRA COOLING BONUS */

  finalTemperature -= cooling * 0.3;

  /* MIN TEMP */

  finalTemperature = Math.max(
    20,
    finalTemperature
  );

  return {
    finalTemperature,
    usageRatio,
  };
};