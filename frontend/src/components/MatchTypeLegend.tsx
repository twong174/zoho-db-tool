const MatchTypeLegend = () => {
  return (
    <div className="bg-white rounded-md p-2 ">
      <p className="text-xs tracking-tight font-semibold text-gray-700 uppercase">
        Match Type Legend
      </p>

      <div className="flex items-center gap-2 text-xs">
        <div className="w-3 h-3 border border-green-500 bg-green-400 rounded-xs"></div>
        <p>Green: Exact UTF-8 Match</p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="w-3 h-3 border border-orange-500 bg-orange-400 rounded-xs"></div>
        <p>Orange: Match Without Accents </p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="w-3 h-3 border border-red-500 bg-red-400 rounded-xs"></div>
        <p>Red: Different Values</p>
      </div>
    </div>
  );
};

export default MatchTypeLegend;
