export default function ServerRack({ type }) {
  return (
    <div className="w-24 bg-gray-950 border border-gray-700 rounded-lg p-2">

      <div className="text-center text-xs mb-2">
        {type === "basic" ? "Basic" : "Advanced"}
      </div>

      <div className="space-y-1">

        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-3 rounded ${
              type === "basic"
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
          />
        ))}

      </div>

    </div>
  );
}