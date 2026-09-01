import { formatCompactMoney, formatMonthYear } from "../../lib/money";

export function BalanceChart({
  points,
}: {
  points: { date: Date; value: number }[];
}) {
  if (points.length === 0) return null;

  const w = 640;
  const h = 220;
  const pad = { t: 16, r: 16, b: 36, l: 56 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const values = points.map((p) => p.value);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;

  const x = (i: number) => pad.l + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.t + ((max - v) / span) * innerH;
  const zeroY = y(0);

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");

  const area = `${d} L ${x(points.length - 1).toFixed(1)} ${zeroY.toFixed(1)} L ${x(0).toFixed(1)} ${zeroY.toFixed(1)} Z`;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => min + (span * i) / ticks);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Projected balance chart">
      {yTicks.map((t) => (
        <g key={t}>
          <line
            x1={pad.l}
            x2={w - pad.r}
            y1={y(t)}
            y2={y(t)}
            stroke="#E6EBF0"
            strokeDasharray={t === 0 ? undefined : "4 4"}
          />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5D6D7E">
            {formatCompactMoney(t)}
          </text>
        </g>
      ))}
      <path d={area} fill="#1F7A6B" fillOpacity="0.12" />
      <path d={d} fill="none" stroke="#1F7A6B" strokeWidth="2.5" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(p.value)}
          r="3.5"
          fill={p.value < 0 ? "#C0392B" : "#1F7A6B"}
        />
      ))}
      {points.map((p, i) =>
        i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2) ? (
          <text
            key={`l${i}`}
            x={x(i)}
            y={h - 10}
            textAnchor="middle"
            fontSize="11"
            fill="#5D6D7E"
          >
            {formatMonthYear(p.date)}
          </text>
        ) : null,
      )}
    </svg>
  );
}
