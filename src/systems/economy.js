export const calculateEconomy = ({
  servers,
  clients,
  cooling,
  temperature,
}) => {
  let income = 0;
  let heat = 0;

  const load = servers.reduce(
    (sum, s) => sum + s.level,
    0
  );

  /* SERVER INCOME */
  servers.forEach((s) => {
    const efficiency = s.health / 100;

    income += s.level * 15 * efficiency;
  });

  /* CLIENT INCOME */
  clients.forEach((c) => {
    income += c.reward;
  });

  /* HEAT */
  servers.forEach((s) => {
    const damageFactor =
      1 + (100 - s.health) / 100;

    heat += s.level * 0.8 * damageFactor;
  });

  /* OVERLOAD */
  if (load > 15) {
    heat *= 1.4;
  }

  /* ELECTRICITY */
  const electricity = load * 5;

  const electricBill = electricity * 0.5;

  /* COOLING EFFECT */
  const nextTemperature = Math.max(
    20,
    temperature + heat * 0.2 - cooling * 2
  );

  return {
    income,
    heat,
    electricity,
    electricBill,
    nextTemperature,
    load,
  };
};