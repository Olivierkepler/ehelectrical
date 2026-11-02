
import type { SVGProps } from "react";

type KeplerWordmarkProps = SVGProps<SVGSVGElement> & {
  width?: number;
  height?: number;
  color?: string;
};

export default function KeplerWordmark({
  width = 420,
  height = 110,
  color = "#0A2540",
  ...props
}: KeplerWordmarkProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 1060 220"
      fill="none"
      preserveAspectRatio="xMinYMid meet"
      role="img"
      aria-label="Kepler"
      {...props}
    >
      <g fill={color}>
        {/* K */}
        <rect x={20} y={30} width={28} height={160} rx={2} />
        <path d="M48 105 L122 30 L160 30 L84 108 L164 190 L123 190 L48 116 Z" />

        {/* E */}
        <rect x={205} y={30} width={110} height={28} rx={2} />
        <rect x={205} y={96} width={110} height={28} rx={2} />
        <rect x={205} y={162} width={110} height={28} rx={2} />

        {/* P */}
        <rect x={365} y={30} width={28} height={160} rx={2} />
        <path d="M393 30 H455 C500 30 522 54 522 89 C522 126 499 146 455 146 H393 V118 H451 C479 118 493 108 493 89 C493 70 479 58 451 58 H393 Z" />

        {/* L */}
        <rect x={570} y={30} width={28} height={160} rx={2} />
        <rect x={570} y={162} width={105} height={28} rx={2} />

        {/* E */}
        <rect x={720} y={30} width={110} height={28} rx={2} />
        <rect x={720} y={96} width={110} height={28} rx={2} />
        <rect x={720} y={162} width={110} height={28} rx={2} />

        {/* R */}
        <rect x={875} y={30} width={28} height={160} rx={2} />
        <path d="M903 30 H960 C1006 30 1031 53 1031 88 C1031 121 1008 145 965 145 H903 V117 H958 C987 117 1002 107 1002 88 C1002 69 987 58 958 58 H903 Z" />
        <path d="M947 128 H982 L1040 190 H1001 Z" />
      </g>
    </svg>
  );
}
