import { useId } from "react";
import { cn } from "../lib/cn";

export type RobotPose = "wave" | "think" | "calm" | "celebrate";

interface RobotProps {
  pose?: RobotPose;
  className?: string;
  /** Плавне «дихання» - вимикається у щільних місцях інтерфейсу */
  floating?: boolean;
}

/**
 * AI-помічник Олени - векторний маскот із макета.
 * Повністю SVG: масштабується без втрат, реагує на позу, без растрових ассетів.
 */
export function Robot({
  pose = "wave",
  className,
  floating = true,
}: RobotProps) {
  const uid = useId().replace(/[:]/g, "");
  const id = (name: string) => `${name}-${uid}`;

  return (
    <svg
      viewBox="0 0 280 320"
      role="img"
      aria-label="AI-помічник Олени Філатової"
      className={cn(floating && "animate-float", className)}
    >
      <defs>
        <linearGradient id={id("shell")} x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f7f8f4" />
          <stop offset="100%" stopColor="#e3e6dd" />
        </linearGradient>

        <linearGradient id={id("shellSide")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f2f3ee" />
          <stop offset="100%" stopColor="#d7dbd0" />
        </linearGradient>

        <linearGradient id={id("screen")} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#2f4030" />
          <stop offset="45%" stopColor="#1e2b1e" />
          <stop offset="100%" stopColor="#152016" />
        </linearGradient>

        <linearGradient id={id("leaf")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b0c992" />
          <stop offset="100%" stopColor="#5f7e3f" />
        </linearGradient>

        <radialGradient id={id("eye")} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#e8ffc4" />
          <stop offset="45%" stopColor="#a6dc6a" />
          <stop offset="100%" stopColor="#74b23c" />
        </radialGradient>

        <radialGradient id={id("glow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#a6dc6a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a6dc6a" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={id("ground")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#3a4e28" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3a4e28" stopOpacity="0" />
        </radialGradient>

        <filter id={id("soft")} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="12"
            floodColor="#2b3a1e"
            floodOpacity="0.16"
          />
        </filter>
      </defs>

      {/* тінь на підлозі */}
      <ellipse
        cx="140"
        cy="303"
        rx="86"
        ry="14"
        fill={`url(#${id("ground")})`}
      />

      {/* ─── антена з листком ─── */}
      <g>
        <path
          d="M140 62 C140 46 136 36 128 28"
          stroke="#b6bdae"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M128 28 C112 12 118 4 136 6 C150 8 152 22 140 30 C135 33 131 32 128 28 Z"
          fill={`url(#${id("leaf")})`}
        />
        <path
          d="M131 27 C134 20 138 14 144 9"
          stroke="#eef5e3"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </g>

      {/* ─── руки (позаду корпусу) ─── */}
      <g>
        {/* ліва на екрані */}
        {pose === "wave" || pose === "celebrate" ? (
          <Limb
            path="M74 216 C50 202 42 174 50 150"
            hand={{ cx: 48, cy: 140, r: 18 }}
            fingers="M40 127 L38 116 M48 123 L48 112 M56 126 L58 115"
            armFill={`url(#${id("shellSide")})`}
            handFill={`url(#${id("shell")})`}
            animate={{ origin: "74px 216px" }}
          />
        ) : (
          <Limb
            path="M76 212 C58 210 46 200 44 184"
            hand={{ cx: 42, cy: 176, r: 16 }}
            armFill={`url(#${id("shellSide")})`}
            handFill={`url(#${id("shell")})`}
          />
        )}

        {/* права на екрані */}
        {pose === "think" ? (
          <Limb
            path="M206 216 C228 202 224 176 200 168"
            hand={{ cx: 190, cy: 164, r: 17 }}
            armFill={`url(#${id("shellSide")})`}
            handFill={`url(#${id("shell")})`}
          />
        ) : pose === "celebrate" ? (
          <Limb
            path="M206 216 C230 202 238 174 230 150"
            hand={{ cx: 232, cy: 140, r: 18 }}
            fingers="M240 127 L242 116 M232 123 L232 112 M224 126 L222 115"
            armFill={`url(#${id("shellSide")})`}
            handFill={`url(#${id("shell")})`}
            animate={{ origin: "206px 216px", delay: "0.4s" }}
          />
        ) : (
          <Limb
            path="M204 212 C222 210 234 200 236 184"
            hand={{ cx: 238, cy: 176, r: 16 }}
            armFill={`url(#${id("shellSide")})`}
            handFill={`url(#${id("shell")})`}
          />
        )}
      </g>

      {/* ─── корпус ─── */}
      <g filter={`url(#${id("soft")})`}>
        <rect
          x="76"
          y="186"
          width="128"
          height="104"
          rx="42"
          fill={`url(#${id("shell")})`}
          stroke="#e0e4da"
          strokeWidth="1.5"
        />
        {/* емблема на грудях */}
        <circle
          cx="140"
          cy="232"
          r="27"
          fill="#f1f5ea"
          stroke="#dde5d1"
          strokeWidth="1.5"
        />
        <path
          d="M140 218 C128 224 126 238 137 246 C148 242 150 226 140 218 Z"
          fill={`url(#${id("leaf")})`}
        />
        <path
          d="M138 244 C138 236 139 228 142 222"
          stroke="#f1f5ea"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
        {/* світлові індикатори */}
        <rect x="120" y="270" width="40" height="6" rx="3" fill="#e6eade" />
        <rect x="120" y="270" width="24" height="6" rx="3" fill="#b0c992" />
      </g>

      {/* ─── шия ─── */}
      <rect x="126" y="172" width="28" height="20" rx="8" fill="#dbe0d5" />

      {/* ─── вушні модулі ─── */}
      <g>
        <rect
          x="52"
          y="112"
          width="20"
          height="42"
          rx="10"
          fill={`url(#${id("shellSide")})`}
          stroke="#dfe3d9"
          strokeWidth="1.2"
        />
        <circle cx="62" cy="133" r="5" fill="#91b06c" />
        <rect
          x="208"
          y="112"
          width="20"
          height="42"
          rx="10"
          fill={`url(#${id("shellSide")})`}
          stroke="#dfe3d9"
          strokeWidth="1.2"
        />
        <circle cx="218" cy="133" r="5" fill="#91b06c" />
      </g>

      {/* ─── голова ─── */}
      <g filter={`url(#${id("soft")})`}>
        <rect
          x="62"
          y="60"
          width="156"
          height="126"
          rx="52"
          fill={`url(#${id("shell")})`}
          stroke="#e0e4da"
          strokeWidth="1.5"
        />
        {/* блік */}
        <path
          d="M86 92 C92 76 106 68 122 68"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* екран-обличчя */}
        <rect
          x="80"
          y="80"
          width="120"
          height="88"
          rx="36"
          fill={`url(#${id("screen")})`}
        />
        <rect
          x="80"
          y="80"
          width="120"
          height="88"
          rx="36"
          fill="none"
          stroke="#0f1810"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* світіння очей */}
        <circle cx="114" cy="116" r="24" fill={`url(#${id("glow")})`} />
        <circle cx="166" cy="116" r="24" fill={`url(#${id("glow")})`} />

        {/* очі */}
        <g
          className="animate-blink"
          style={{ transformOrigin: "140px 116px", transformBox: "view-box" }}
        >
          <ellipse
            cx="114"
            cy="116"
            rx="13"
            ry="15"
            fill={`url(#${id("eye")})`}
          />
          <ellipse
            cx="166"
            cy="116"
            rx="13"
            ry="15"
            fill={`url(#${id("eye")})`}
          />
          <ellipse
            cx="110"
            cy="110"
            rx="4"
            ry="5"
            fill="#f4ffe2"
            opacity="0.9"
          />
          <ellipse
            cx="162"
            cy="110"
            rx="4"
            ry="5"
            fill="#f4ffe2"
            opacity="0.9"
          />
        </g>

        {/* усмішка */}
        <path
          d={
            pose === "think"
              ? "M127 139 C134 147 146 147 153 139"
              : "M122 138 C130 152 150 152 158 138"
          }
          stroke="#a6dc6a"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/**
 * Кінцівка робота: контур + світла заливка, тому рука читається як обʼєм,
 * а не як пляма, що зливається зі світлим фоном.
 */
function Limb({
  path,
  hand,
  fingers,
  armFill,
  handFill,
  animate,
}: {
  path: string;
  hand: { cx: number; cy: number; r: number };
  fingers?: string;
  armFill: string;
  handFill: string;
  animate?: { origin: string; delay?: string };
}) {
  const content = (
    <>
      {/* контур */}
      <path
        d={path}
        stroke="#d4d9cb"
        strokeWidth="23"
        strokeLinecap="round"
        fill="none"
      />
      {/* заливка */}
      <path
        d={path}
        stroke={armFill}
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />

      {fingers && (
        <path
          d={fingers}
          stroke="#cfd5c6"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      )}

      <circle
        cx={hand.cx}
        cy={hand.cy}
        r={hand.r}
        fill={handFill}
        stroke="#d4d9cb"
        strokeWidth="2"
      />
      {/* блік на долоні */}
      <circle
        cx={hand.cx - hand.r * 0.3}
        cy={hand.cy - hand.r * 0.35}
        r={hand.r * 0.28}
        fill="#ffffff"
        opacity="0.75"
      />
    </>
  );

  if (!animate) return <g>{content}</g>;

  return (
    <g
      className="animate-wave"
      style={{
        transformOrigin: animate.origin,
        transformBox: "view-box",
        animationDelay: animate.delay,
      }}
    >
      {content}
    </g>
  );
}
