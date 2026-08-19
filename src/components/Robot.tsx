import { cn } from "../lib/cn";

export type RobotPose = "wave" | "think" | "calm" | "celebrate";

interface RobotProps {
  /**
   * Зарезервовано під набір поз. Зараз усі екрани показують одну ілюстрацію -
   * решта кадрів (IMG_1658/1659/1661) ще не зведені до спільного масштабу.
   */
  pose?: RobotPose;
  /** Яку ілюстрацію показати; `hero` - великий кадр для головного екрана */
  art?: RobotArt;
  className?: string;
  /** Плавне «дихання» - вимикається у щільних місцях інтерфейсу */
  floating?: boolean;
}

export type RobotArt = "default" | "hero" | "heart";

/** Прозорі PNG у палітрі проєкту, зібрані із 3D-рендера макета */
const ART: Record<RobotArt, { src: string; width: number; height: number }> = {
  default: { src: "/1.png", width: 500, height: 500 },
  hero: { src: "/2.png", width: 1254, height: 1254 },
  heart: { src: "/3.png", width: 800, height: 800 },
};

/**
 * AI-помічник Олени. Висоту задає виклик (`className="h-36"`), ширина
 * підбирається за пропорцією ілюстрації.
 */
export function Robot({
  art = "default",
  className,
  floating = true,
}: RobotProps) {
  const { src, width, height } = ART[art];

  return (
    <img
      src={src}
      width={width}
      height={height}
      alt="AI-помічник Олени Філатової"
      decoding="async"
      draggable={false}
      className={cn(
        "w-auto select-none",
        floating && "animate-float",
        className,
      )}
    />
  );
}
