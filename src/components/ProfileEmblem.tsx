import type { EmblemVariant } from "../data/profiles";
import { asset } from "../lib/asset";
import { cn } from "../lib/cn";

/** Прозорий PNG у палітрі проєкту, зібраний із 3D-рендера макета */
const ART = { src: asset("/4.png"), width: 500, height: 500 };

interface ProfileEmblemProps {
  /**
   * Зарезервовано під набір емблем. Зараз усі профілі показують один
   * «кристал» - решта варіацій ще не зведені до спільного рендера.
   */
  variant?: EmblemVariant;
  className?: string;
  /** Плавне «дихання» - вимикається у щільних місцях інтерфейсу */
  floating?: boolean;
}

/**
 * Емблема бізнес-профілю - «кристал» із макета. Розмір задає виклик
 * (`className="size-24"`), ілюстрація квадратна.
 */
export function ProfileEmblem({
  className,
  floating = true,
}: ProfileEmblemProps) {
  const { src, width, height } = ART;

  return (
    <img
      src={src}
      width={width}
      height={height}
      alt="Емблема бізнес-профілю"
      decoding="async"
      draggable={false}
      className={cn("select-none", floating && "animate-float", className)}
    />
  );
}
