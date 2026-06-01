function pathForSlice(cx, cy, r, startAngle, endAngle) {
  const sweep = endAngle - startAngle;
  const sx = cx + r * Math.cos(startAngle), sy = cy + r * Math.sin(startAngle);
  const ex = cx + r * Math.cos(endAngle),   ey = cy + r * Math.sin(endAngle);
  const largeArc = sweep > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} Z`;
}

// slices: [{ label, plannedValue, spentValue, color }]
export default function PieChart({ slices, size = 160, holeRatio = 0.5 }) {
  const totalPlanned = slices.reduce((s, sl) => s + sl.plannedValue, 0);
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 2;
  const holeR = holeRatio ? r * holeRatio : 0;

  if (totalPlanned === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />
        {holeR > 0 && <circle cx={cx} cy={cy} r={holeR} fill="white" />}
      </svg>
    );
  }

  let angle = -Math.PI / 2;
  const bgPaths = [];
  const fgPaths = [];

  slices.filter((s) => s.plannedValue > 0).forEach((slice, i) => {
    const plannedSweep = (slice.plannedValue / totalPlanned) * 2 * Math.PI;
    const startAngle = angle;
    const endAngle = angle + plannedSweep;
    angle = endAngle;

    // Gray background slice showing planned allocation
    bgPaths.push(
      <path key={`bg-${i}`} d={pathForSlice(cx, cy, r, startAngle, endAngle)}
        fill="#e5e7eb" stroke="white" strokeWidth="1.5" />
    );

    // Colored fill for spent portion
    if (slice.spentValue > 0) {
      const spentSweep = (Math.min(slice.spentValue, slice.plannedValue) / totalPlanned) * 2 * Math.PI;
      fgPaths.push(
        <path key={`fg-${i}`} d={pathForSlice(cx, cy, r, startAngle, startAngle + spentSweep)}
          fill={slice.color} stroke="white" strokeWidth="1.5" />
      );
    }
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {bgPaths}
      {fgPaths}
      {holeR > 0 && <circle cx={cx} cy={cy} r={holeR} fill="white" />}
    </svg>
  );
}
