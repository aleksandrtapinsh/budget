// card background — donut hole and slice separators match the dark card surface
const CARD_BG = '#1f2937';   // gray-800
const UNALLOC  = '#374151';  // gray-700

function piePath(cx, cy, r, startAngle, endAngle) {
  const sx = cx + r * Math.cos(startAngle), sy = cy + r * Math.sin(startAngle);
  const ex = cx + r * Math.cos(endAngle),   ey = cy + r * Math.sin(endAngle);
  const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} Z`;
}

function ringPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const sweep = endAngle - startAngle;
  const largeArc = sweep > Math.PI ? 1 : 0;
  const cSa = Math.cos(startAngle), sSa = Math.sin(startAngle);
  const cEa = Math.cos(endAngle),   sEa = Math.sin(endAngle);
  return [
    `M ${cx + rOuter * cSa} ${cy + rOuter * sSa}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${cx + rOuter * cEa} ${cy + rOuter * sEa}`,
    `L ${cx + rInner * cEa} ${cy + rInner * sEa}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${cx + rInner * cSa} ${cy + rInner * sSa}`,
    'Z',
  ].join(' ');
}

// slices: [{ label, plannedValue, spentValue, color }]
// total: monthly income (full circle = total income, not total budgeted)
export default function PieChart({ slices, total, size = 160, holeRatio = 0.5 }) {
  const cx = size / 2, cy = size / 2;
  const rOuter  = size / 2 - 1;
  const rWidth  = Math.round(size * 0.038);
  const rInner  = rOuter - rWidth;
  const gap     = Math.round(size * 0.018);
  const r       = rInner - gap;
  const holeR   = r * holeRatio;

  const denom = total > 0 ? total : slices.reduce((s, sl) => s + sl.plannedValue, 0);

  if (denom === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={rOuter} fill={UNALLOC} />
        <circle cx={cx} cy={cy} r={rInner} fill={CARD_BG} />
        <circle cx={cx} cy={cy} r={r} fill={UNALLOC} />
        <circle cx={cx} cy={cy} r={holeR} fill={CARD_BG} />
      </svg>
    );
  }

  let angle = -Math.PI / 2;
  const bgSlices  = [];
  const fgSlices  = [];
  const ringSegs  = [];

  slices.filter((s) => s.plannedValue > 0).forEach((slice, i) => {
    const sweep = (slice.plannedValue / denom) * 2 * Math.PI;
    const start = angle;
    const end   = angle + sweep;
    angle = end;

    bgSlices.push(
      <path key={`bg-${i}`}
        d={piePath(cx, cy, r, start, end)}
        fill={UNALLOC} stroke={CARD_BG} strokeWidth="1.5" />
    );

    if (slice.spentValue > 0) {
      const spentSweep = (Math.min(slice.spentValue, slice.plannedValue) / denom) * 2 * Math.PI;
      fgSlices.push(
        <path key={`fg-${i}`}
          d={piePath(cx, cy, r, start, start + spentSweep)}
          fill={slice.color} stroke={CARD_BG} strokeWidth="1.5" />
      );
    }

    ringSegs.push(
      <path key={`ring-${i}`}
        d={ringPath(cx, cy, rOuter, rInner, start, end)}
        fill={slice.color} stroke={CARD_BG} strokeWidth="1" />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={rOuter} fill={UNALLOC} />
      <circle cx={cx} cy={cy} r={rInner} fill={CARD_BG} />
      {ringSegs}
      <circle cx={cx} cy={cy} r={r} fill={UNALLOC} />
      {bgSlices}
      {fgSlices}
      <circle cx={cx} cy={cy} r={holeR} fill={CARD_BG} />
    </svg>
  );
}
