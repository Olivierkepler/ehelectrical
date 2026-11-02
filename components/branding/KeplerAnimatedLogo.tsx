
"use client";

import { useId, type CSSProperties } from "react";
import KeplerWordmark from "./KeplerWordmark";

type KeplerAnimatedLogoProps = {
  width?: number;
  height?: number;
  orange?: string;
  wordmarkColor?: string;
  taglineColor?: string;
  autoPlay?: boolean;
  showTagline?: boolean;
  className?: string;
  style?: CSSProperties;
};

const COLORS = {
  bankBlue: "#012169",
  bankBlueLight: "#123D83",
  bankBlueDark: "#001A52",
  bankRed: "#E31837",
  bankRedLight: "#F0445C",
  bankRedDark: "#B5122C",
  edgeLight: "#8993A0",
  edgeDark: "#151B23",
  lowerArmHighlight: "#46514E",
  lowerArmShadow: "#131A19",
  tagline: "#64748B",
  wordmark: "#0A2540",
};

export default function KeplerAnimatedLogo({
  width = 640,
  height = 260,
  orange = COLORS.bankRed,
  wordmarkColor = COLORS.wordmark,
  taglineColor,
  autoPlay = true,
  showTagline = true,
  className,
  style,
}: KeplerAnimatedLogoProps) {
  const id = useId().replace(/:/g, "");

  const silverId = `kepler-silver-${id}`;
  const redId = `kepler-red-${id}`;

  const emblemWidth = width * 0.34;
  const gap = width * 0.012;
  const brandWidth = width - emblemWidth - gap;
  const wordmarkHeight = height * 0.34;
  const descriptorInset = brandWidth * (20 / 1060);
  const descriptorFontSize = Math.max(6, width * 0.0125);

  const animated = autoPlay ? "kepler-animate" : "";

  return (
    <div
      className={`${animated} ${className ?? ""}`}
      role="img"
      aria-label="Kepler — Build Smarter"
      style={{
        width,
        height,
        maxWidth: "100%",
        display: "flex",
        alignItems: "flex-end",
        overflow: "visible",
        ...style,
      }}
    >
      <style>{`
        @keyframes kepler-rise {
          from {
            opacity: 0;
            transform: translateY(52px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes kepler-bar-rise {
          from {
            opacity: 0;
            transform: translateY(68px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes kepler-core-rise {
          from {
            opacity: 0;
            transform: translateY(78px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes kepler-arm-enter {
          from {
            opacity: 0;
            transform: translateX(-56px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes kepler-text-enter {
          from {
            opacity: 0;
            transform: translateX(28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes kepler-tagline-enter {
          from {
            opacity: 0;
            transform: translateX(22px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes kepler-settle {
          0% { transform: scale(0.97); }
          70% { transform: scale(1.012); }
          100% { transform: scale(1); }
        }

        .kepler-animate {
          animation: kepler-settle 1500ms ease-out both;
          transform-origin: center;
        }

        .kepler-animate .kepler-tower {
          animation: kepler-rise 650ms cubic-bezier(.2,.8,.2,1) both;
        }

        .kepler-animate .kepler-bar-1 {
          animation: kepler-bar-rise 550ms 150ms ease-out both;
        }

        .kepler-animate .kepler-bar-2 {
          animation: kepler-bar-rise 550ms 225ms ease-out both;
        }

        .kepler-animate .kepler-bar-3 {
          animation: kepler-bar-rise 550ms 300ms ease-out both;
        }

        .kepler-animate .kepler-red-core {
          animation: kepler-core-rise 550ms 390ms ease-out both;
        }

        .kepler-animate .kepler-upper-arm {
          animation: kepler-arm-enter 420ms 580ms ease-out both;
        }

        .kepler-animate .kepler-lower-arm {
          animation: kepler-arm-enter 420ms 720ms ease-out both;
        }

        .kepler-animate .kepler-wordmark {
          animation: kepler-text-enter 440ms 920ms ease-out both;
        }

        .kepler-animate .kepler-tagline {
          animation: kepler-tagline-enter 440ms 1120ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .kepler-animate,
          .kepler-animate .kepler-tower,
          .kepler-animate .kepler-bar-1,
          .kepler-animate .kepler-bar-2,
          .kepler-animate .kepler-bar-3,
          .kepler-animate .kepler-red-core,
          .kepler-animate .kepler-upper-arm,
          .kepler-animate .kepler-lower-arm,
          .kepler-animate .kepler-wordmark,
          .kepler-animate .kepler-tagline {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Architectural K emblem */}
      <div
        style={{
          width: emblemWidth,
          height: "100%",
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="70 25 450 455"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={silverId}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.28" stopColor="#E8EBEF" />
              <stop offset="1" stopColor="#747D89" />
            </linearGradient>

            <linearGradient
              id={redId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0"
                stopColor={COLORS.bankRedLight}
              />
              <stop offset="0.42" stopColor={orange} />
              <stop
                offset="1"
                stopColor={COLORS.bankRedDark}
              />
            </linearGradient>
          </defs>

          {/* Navy tower */}
          <g className="kepler-tower">
            <polygon
              points="104,103 190,47 190,224 166,244 166,410 104,410"
              fill={COLORS.bankBlue}
            />
            <path
              d="M106 103 L188 49"
              stroke={COLORS.edgeLight}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.85}
            />
            <path
              d="M188 49 L188 220"
              stroke={COLORS.edgeDark}
              strokeWidth={4}
              opacity={0.65}
            />
          </g>

          {/* Three white building bars */}
          <polygon
            className="kepler-bar-1"
            points="114,324 130,310 130,410 114,410"
            fill="#FFFFFF"
          />

          <polygon
            className="kepler-bar-2"
            points="140,299 156,285 156,410 140,410"
            fill="#FFFFFF"
          />

          <polygon
            className="kepler-bar-3"
            points="166,276 181,264 181,410 166,410"
            fill="#FFFFFF"
          />

          {/* Upper metallic K arm */}
          <g className="kepler-upper-arm">
            <polygon
              points="324,310 416,213 492,213 324,384"
              fill={`url(#${silverId})`}
            />
            <path
              d="M326 310 L417 215 L490 215"
              stroke="#FFFFFF"
              strokeWidth={3}
              strokeLinejoin="round"
              opacity={0.75}
            />
            <path
              d="M325 382 L490 215"
              stroke="#555D68"
              strokeWidth={4}
              opacity={0.5}
            />
          </g>

          {/* Lower navy K arm */}
          <g className="kepler-lower-arm">
            <polygon
              points="340,382 396,332 505,475 420,475"
              fill={COLORS.bankBlue}
            />
            <path
              d="M342 381 L396 335 L503 473"
              stroke={COLORS.lowerArmHighlight}
              strokeWidth={3}
              strokeLinejoin="round"
              opacity={0.72}
            />
            <path
              d="M420 474 L503 474"
              stroke={COLORS.lowerArmShadow}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.55}
            />
          </g>

          {/* Crimson center core */}
          <g className="kepler-red-core">
            <polygon
              points="204,67 259,111 259,390 204,390"
              fill={`url(#${redId})`}
            />

            <path
              d="M204 67 L259 111"
              stroke="#FF6678"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.9}
            />

            <path
              d="M205 70 L205 388"
              stroke="#F75A6D"
              strokeWidth={2}
              opacity={0.78}
            />

            <path
              d="M258 112 L258 388"
              stroke="#941127"
              strokeWidth={3}
              opacity={0.52}
            />

            <polygon
              points="204,300 259,250 259,336 204,385"
              fill="#D61532"
              opacity={0.38}
            />

            <polygon
              points="204,385 259,336 259,390 204,390"
              fill="#B5122C"
              opacity={0.34}
            />
          </g>
        </svg>
      </div>

      {/* Wordmark and tagline */}
      <div
        style={{
          width: brandWidth,
          height: "100%",
          marginLeft: gap,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          minWidth: 0,
        }}
      >
        <div
          className="kepler-wordmark"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <KeplerWordmark
            width={brandWidth}
            height={wordmarkHeight}
            color={wordmarkColor}
          />
        </div>

        {showTagline && (
          <div
            className="kepler-tagline"
            style={{
              width: "100%",
              boxSizing: "border-box",
              paddingLeft: descriptorInset,
              paddingRight: descriptorInset,
              marginTop: width * 0.0015625,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              whiteSpace: "nowrap",
              fontSize: descriptorFontSize,
              lineHeight: 1.25,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            <span
              style={{
                color: taglineColor ?? COLORS.bankRed,
              }}
            >
              BUILD
            </span>

            <span
              style={{
                color: taglineColor ?? COLORS.bankBlue,
              }}
            >
              SMARTER
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
