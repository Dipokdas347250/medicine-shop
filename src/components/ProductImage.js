import { cn } from "@/lib/utils";

function short(text, max = 11) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function Box({ c, name, strength }) {
  return (
    <g>
      <rect x="38" y="34" width="104" height="124" rx="10" fill={c} />
      <rect x="38" y="34" width="104" height="30" rx="10" fill="#fff" opacity="0.18" />
      <rect x="38" y="140" width="104" height="18" rx="0" fill="#000" opacity="0.08" />
      <text x="90" y="92" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="800">{short(name, 10)}</text>
      <text x="90" y="110" textAnchor="middle" fill="#fff" fontSize="10" opacity="0.85">{short(strength, 16)}</text>
      <path d="M52 50h10M57 45v10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Tablet({ c, name, strength }) {
  const pills = [];
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < 4; i++) pills.push(<circle key={`${r}${i}`} cx={86 + i * 24} cy={126 + r * 24} r="8.5" fill="#fff" stroke={c} strokeWidth="2.5" />);
  return (
    <>
      <Box c={c} name={name} strength={strength} />
      <g transform="rotate(-10 128 138)">
        <rect x="70" y="110" width="110" height="56" rx="9" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        {pills}
      </g>
    </>
  );
}

function Capsule({ c, name, strength }) {
  const cap = (x, y, rot) => (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <rect x={x - 24} y={y - 9} width="48" height="18" rx="9" fill="#fff" stroke="#cbd5e1" />
      <path d={`M${x} ${y - 9}h15a9 9 0 0 1 0 18h-15z`} fill={c} />
      <rect x={x - 18} y={y - 5} width="12" height="3" rx="1.5" fill="#fff" opacity="0.8" />
    </g>
  );
  return (
    <>
      <Box c={c} name={name} strength={strength} />
      {cap(128, 146, -25)}
      {cap(160, 128, 40)}
      {cap(150, 170, 10)}
    </>
  );
}

function Syrup({ c, name, strength }) {
  return (
    <g>
      <rect x="80" y="22" width="40" height="22" rx="4" fill="#334155" />
      <rect x="86" y="44" width="28" height="14" fill="#92400e" opacity="0.9" />
      <path d="M72 70q0-12 14-12h28q14 0 14 12v100q0 12-12 12H84q-12 0-12-12z" fill="#b45309" />
      <path d="M78 74q0-8 8-8h6v110h-6q-8 0-8-8z" fill="#fff" opacity="0.15" />
      <rect x="66" y="92" width="68" height="62" rx="6" fill="#fff" />
      <rect x="66" y="92" width="68" height="14" rx="6" fill={c} />
      <text x="100" y="128" textAnchor="middle" fill={c} fontSize="13" fontWeight="800">{short(name, 9)}</text>
      <text x="100" y="143" textAnchor="middle" fill="#64748b" fontSize="8.5">{short(strength, 14)}</text>
    </g>
  );
}

function Cream({ c, name, strength }) {
  return (
    <g transform="rotate(-18 100 100)">
      <rect x="84" y="150" width="32" height="26" rx="4" fill="#334155" />
      <path d="M60 30h80l-6 8H66z" fill="#94a3b8" />
      <path d="M62 38h76l-14 112H76z" fill="#fff" stroke="#e2e8f0" />
      <path d="M62 38h76l-3 24H65z" fill={c} />
      <path d="M76 150h48l2-14H74z" fill={c} />
      <text x="100" y="96" textAnchor="middle" fill={c} fontSize="14" fontWeight="800">{short(name, 9)}</text>
      <text x="100" y="112" textAnchor="middle" fill="#64748b" fontSize="8.5">{short(strength, 14)}</text>
    </g>
  );
}

function Drops({ c, name, strength }) {
  return (
    <g>
      <path d="M92 16h16l4 44H88z" fill="#f1f5f9" stroke="#cbd5e1" />
      <rect x="80" y="56" width="40" height="22" rx="4" fill={c} />
      <path d="M66 90q0-12 14-12h40q14 0 14 12v80q0 12-12 12H78q-12 0-12-12z" fill="#78350f" />
      <rect x="62" y="104" width="76" height="56" rx="6" fill="#fff" />
      <text x="100" y="134" textAnchor="middle" fill={c} fontSize="13" fontWeight="800">{short(name, 9)}</text>
      <text x="100" y="148" textAnchor="middle" fill="#64748b" fontSize="8.5">{short(strength, 14)}</text>
    </g>
  );
}

function Injection({ c, name, strength }) {
  return (
    <g>
      <rect x="76" y="26" width="48" height="22" rx="5" fill={c} />
      <rect x="84" y="48" width="32" height="12" fill="#94a3b8" />
      <path d="M70 70q0-10 12-10h36q12 0 12 10v96q0 12-12 12H82q-12 0-12-12z" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2" />
      <path d="M72 120h56v46q0 10-10 10H82q-10 0-10-10z" fill={c} opacity="0.25" />
      <rect x="70" y="92" width="60" height="44" rx="4" fill="#fff" />
      <text x="100" y="114" textAnchor="middle" fill={c} fontSize="12" fontWeight="800">{short(name, 9)}</text>
      <text x="100" y="127" textAnchor="middle" fill="#64748b" fontSize="8">{short(strength, 14)}</text>
      <rect x="80" y="74" width="5" height="12" rx="2.5" fill="#fff" opacity="0.8" />
    </g>
  );
}

function Sachet({ c, name, strength }) {
  const zig = (y) => {
    let d = `M44 ${y}`;
    for (let x = 44; x < 156; x += 8) d += `l4 ${y < 100 ? -5 : 5}l4 ${y < 100 ? 5 : -5}`;
    return d;
  };
  return (
    <g transform="rotate(6 100 100)">
      <rect x="44" y="30" width="112" height="140" rx="4" fill={c} />
      <path d={`${zig(30)}V40H44z`} fill={c} />
      <rect x="44" y="30" width="112" height="16" fill="#fff" opacity="0.2" />
      <rect x="44" y="154" width="112" height="16" fill="#fff" opacity="0.2" />
      <circle cx="100" cy="82" r="18" fill="#fff" opacity="0.9" />
      <path d="M100 70q10 12 0 24q-10-12 0-24z" fill={c} />
      <text x="100" y="124" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800">{short(name, 10)}</text>
      <text x="100" y="140" textAnchor="middle" fill="#fff" fontSize="9" opacity="0.85">{short(strength, 16)}</text>
    </g>
  );
}

function Spray({ c, name, strength }) {
  return (
    <g>
      <path d="M92 14h16v26H92z" fill="#e2e8f0" stroke="#94a3b8" />
      <path d="M108 20h18v8h-18z" fill="#94a3b8" />
      <rect x="82" y="40" width="36" height="20" rx="4" fill="#334155" />
      <path d="M68 72q0-12 14-12h36q14 0 14 12v96q0 12-12 12H80q-12 0-12-12z" fill={c} />
      <rect x="68" y="96" width="64" height="52" fill="#fff" />
      <text x="100" y="124" textAnchor="middle" fill={c} fontSize="13" fontWeight="800">{short(name, 9)}</text>
      <text x="100" y="138" textAnchor="middle" fill="#64748b" fontSize="8.5">{short(strength, 14)}</text>
    </g>
  );
}

function Device({ c, name, strength }) {
  return (
    <g>
      <rect x="40" y="36" width="120" height="128" rx="22" fill={c} />
      <rect x="40" y="36" width="120" height="40" rx="22" fill="#fff" opacity="0.12" />
      <rect x="56" y="54" width="88" height="52" rx="8" fill="#0f172a" />
      <polyline points="62,82 78,82 84,68 92,96 100,74 106,82 138,82" fill="none" stroke="#34d399" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="80" cy="130" r="9" fill="#fff" opacity="0.9" />
      <circle cx="120" cy="130" r="9" fill="#fff" opacity="0.5" />
      <text x="100" y="156" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" opacity="0.9">{short(name, 18)}</text>
      <text x="100" y="50" textAnchor="middle" fill="#fff" fontSize="7" opacity="0.7">{short(strength, 20)}</text>
    </g>
  );
}

const SHAPES = { tablet: Tablet, capsule: Capsule, syrup: Syrup, cream: Cream, drops: Drops, injection: Injection, sachet: Sachet, spray: Spray, device: Device };

export default function ProductImage({ product, className, rounded = "rounded-2xl" }) {
  const c = product.color || "#0d9488";
  if (product.image) {
    return (
      <div className={cn("relative overflow-hidden bg-white", rounded, className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
      </div>
    );
  }
  const Shape = SHAPES[product.form] || Tablet;
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", rounded, className)}
      style={{ background: `radial-gradient(circle at 30% 20%, ${c}22, ${c}0d 60%, transparent)` }}
    >
      <svg viewBox="0 0 200 200" className="h-[85%] w-[85%] drop-shadow-md" role="img" aria-label={product.name}>
        <ellipse cx="100" cy="186" rx="62" ry="7" fill="#0f172a" opacity="0.08" />
        <Shape c={c} name={product.name} strength={product.strength || ""} />
      </svg>
    </div>
  );
}
