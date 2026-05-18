import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StatsChart({ data }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl mt-6">

      <h2 className="text-xl mb-4">
        Analytics
      </h2>

      <ResponsiveContainer width="100%" height={300}>

        <LineChart data={data}>

          <XAxis dataKey="time" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#ef4444"
          />

          <Line
            type="monotone"
            dataKey="money"
            stroke="#22c55e"
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}