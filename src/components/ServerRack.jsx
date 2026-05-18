import { SERVER_LEVELS } from "../data/serverLevels";

export default function ServerRack({ server }) {
  return (
    <div
      className={`relative w-full min-h-[170px] rounded-xl p-3 border shadow-2xl transition-all duration-300 hover:scale-[1.03] ${
        SERVER_LEVELS[server.level]?.color
      }`}
    >
      {/* HEADER */}
      <div className="text-center font-bold text-white mb-2">
        Server L{server.level}
      </div>

      {/* SERVER BARS */}
      <div className="space-y-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-3 rounded ${
              SERVER_LEVELS[server.level]?.bar
            }`}
          />
        ))}
      </div>

      {/* DATA FLOW */}
      <div className="mt-2 h-1 bg-gray-900 rounded overflow-hidden">
        <div className="h-full bg-cyan-400 animate-pulse w-3/4" />
      </div>

      {/* LEDS */}
      <div className="flex justify-center gap-1 mt-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
      </div>

      {/* FAN */}
      <div className="flex justify-center mt-2">
        <div className="w-4 h-4 border-2 border-gray-200 rounded-full animate-spin" />
      </div>

      {/* HEALTH */}
      <div className="mt-2 text-[10px] text-center text-white">
        <span
          className={
            server.health > 70
              ? "text-green-300"
              : server.health > 40
              ? "text-yellow-300"
              : "text-red-400"
          }
        >
          ❤️ {server.health}%
        </span>
      </div>

      {/* CAPACITY */}
      <div className="mt-1 text-[10px] text-center text-cyan-300">
        📡 {server.capacity} TB
      </div>
    </div>
  );
}