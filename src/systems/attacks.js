export const runCyberAttack = ({
  security,
  setMoney,
  setTemperature,
  setMessage,
}) => {
  const chance = Math.random();

  if (chance < 0.08) {
    const damage = Math.max(
      50 - security * 10,
      5
    );

    setMoney((p) => p - damage);

    setTemperature((p) => p + 5);

    setMessage("⚠ Cyber Attack Detected!");

    return true;
  }

  return false;
};