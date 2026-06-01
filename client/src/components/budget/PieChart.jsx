export default function PieChart({ slices, size = 160, holeRatio = 0 }) {
  const nonEmpty = slices.filter((s) => s.value > 0);
  const total = nonEmpty.reduce((s, sl) => s + sl.value, 0);
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 2;
  const holeR = holeRatio ? r * holeRatio : 0;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="#f3f4f6" />
        {holeR > 0 && <circle cx={cx} cy={cy} r={holeR} fill="white" />}
      </svg>
    );
  }

  let angle = -Math.PI / 2;
  const paths = nonEmpty.map((slice) => {
    const sweep = (slice.value / total) * 2 * Math.PI;
    const startAngle = angle;
    angle += sweep;
    const endAngle = angle;
    const sx = cx + r * Math.cos(startAngle), sy = cy + r * Math.sin(startAngle);
    const ex = cx + r * Math.cos(endAngle), ey = cy + r * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} Z`;
    return <path key={slice.label} d={d} fill={slice.color} stroke="white" strokeWidth="1.5" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      {holeR > 0 && <circle cx={cx} cy={cy} r={holeR} fill="white" />}
    </svg>
  );
}
