// Small chart primitives shared across admin pages/dashboards.

export function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-gray-400">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export function HBar({ label, value, maxValue, color, suffix = "" }) {
  const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-700 truncate flex-1 min-w-0 pr-2">{label}</span>
        <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color }}>
          {value}{suffix}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
