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
  const rWidth  = Math.round(size * 0.038);   // skinny outer ring
  const rInner  = rOuter - rWidth;
  const gap     = Math.round(size * 0.018);   // gap between ring and pie
  const r       = rInner - gap;
  const holeR   = r * holeRatio;

  const denom = total > 0 ? total : slices.reduce((s, sl) => s + sl.plannedValue, 0);

  if (denom === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={rOuter} fill="#e5e7eb" />
        <circle cx={cx} cy={cy} r={rInner} fill="white" />
        <circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />
        <circle cx={cx} cy={cy} r={holeR} fill="white" />
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

    // Gray background slice — shows the planned structure
    bgSlices.push(
      <path key={`bg-${i}`}
        d={piePath(cx, cy, r, start, end)}
        fill="#e5e7eb" stroke="white" strokeWidth="1.5" />
    );

    // Colored fill — grows as money is spent
    if (slice.spentValue > 0) {
      const spentSweep = (Math.min(slice.spentValue, slice.plannedValue) / denom) * 2 * Math.PI;
      fgSlices.push(
        <path key={`fg-${i}`}
          d={piePath(cx, cy, r, start, start + spentSweep)}
          fill={slice.color} stroke="white" strokeWidth="1.5" />
      );
    }

    // Outer ring segment in the category color
    ringSegs.push(
      <path key={`ring-${i}`}
        d={ringPath(cx, cy, rOuter, rInner, start, end)}
        fill={slice.color} stroke="white" strokeWidth="1" />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer ring: gray base (unallocated stays gray), colored segments on top */}
      <circle cx={cx} cy={cy} r={rOuter} fill="#e5e7eb" />
      <circle cx={cx} cy={cy} r={rInner} fill="white" />
      {ringSegs}

      {/* Inner pie: full gray base, category bg slices with separators, spent fills */}
      <circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />
      {bgSlices}
      {fgSlices}
      <circle cx={cx} cy={cy} r={holeR} fill="white" />
    </svg>
  );
}
