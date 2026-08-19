import { ArrowUpRight, Globe2, Sparkles, Users } from "lucide-react";
import { Button } from "./ui/Button";
import { env } from "../lib/env";
import { cn } from "../lib/cn";

/**
 * Блок MIHI з макета. Показується під час очікування аналізу
 * та на екрані запису - за сценарієм із ТЗ.
 */
export function MihiTeaser({
  onOpen,
  className,
  variant = "full",
}: {
  onOpen?: () => void;
  className?: string;
  variant?: "full" | "compact";
}) {
  const link = (
    <Button
      asChild
      variant={variant === "full" ? "primary" : "secondary"}
      size={variant === "full" ? "md" : "sm"}
    >
      <a
        href={env.mihiUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onOpen}
      >
        Дивитись проєкт MIHI
        <ArrowUpRight className="size-4" strokeWidth={2.75} />
      </a>
    </Button>
  );

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 rounded-card border border-leaf-200 bg-leaf-50/70 p-4",
          className,
        )}
      >
        <MihiBottles className="h-16 w-24 shrink-0" />
        <div className="min-w-40 flex-1">
          <p className="font-display text-sm font-extrabold text-ink">
            MIHI - нове покоління можливостей
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Поки чекаєш результат - подивись, з якою компанією зараз співпрацює
            Олена.
          </p>
        </div>
        {link}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-panel border border-line panel-wash shadow-card",
        className,
      )}
    >
      <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h3 className="text-2xl sm:text-[1.75rem]">
            MIHI - нове покоління можливостей
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Сучасний продукт · Міжнародна система · Підтримка лідерів.
            Інструменти AI та автоматизації для твого зростання.
          </p>

          <ul className="mt-5 grid gap-2.5 text-sm text-ink-soft sm:grid-cols-2">
            {[
              { icon: Sparkles, text: "Сучасний якісний продукт" },
              { icon: Globe2, text: "Єдина система в країнах Європи" },
              { icon: Users, text: "Середовище сильних лідерів" },
              { icon: Sparkles, text: "AI та автоматизація в основі" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-600">
                  <Icon className="size-3.5" strokeWidth={2.5} />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-6">{link}</div>
        </div>

        <MihiBottles className="mx-auto h-44 w-full max-w-72" />
      </div>
    </div>
  );
}

/** Продуктова композиція. Замінюється на фото public/mihi.png за бажанням. */
function MihiBottles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 170" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mihi-shelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef2e6" />
          <stop offset="100%" stopColor="#e0e6d6" />
        </linearGradient>
        <linearGradient id="mihi-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f6f8f2" />
          <stop offset="100%" stopColor="#e3e8db" />
        </linearGradient>
        <linearGradient id="mihi-cap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b0c992" />
          <stop offset="100%" stopColor="#5f7e3f" />
        </linearGradient>
      </defs>

      <ellipse cx="130" cy="152" rx="104" ry="12" fill="url(#mihi-shelf)" />

      {/* висока пляшка */}
      <g>
        <rect
          x="46"
          y="52"
          width="46"
          height="96"
          rx="16"
          fill="url(#mihi-glass)"
          stroke="#dfe4d7"
        />
        <rect
          x="60"
          y="40"
          width="18"
          height="16"
          rx="5"
          fill="url(#mihi-cap)"
        />
        <rect x="54" y="88" width="30" height="30" rx="6" fill="#f2f6ec" />
        <path
          d="M69 96 C62 100 61 110 68 114 C75 110 76 100 69 96 Z"
          fill="url(#mihi-cap)"
        />
        <rect
          x="52"
          y="60"
          width="8"
          height="60"
          rx="4"
          fill="#ffffff"
          opacity="0.7"
        />
      </g>

      {/* банка-крем */}
      <g>
        <rect
          x="102"
          y="88"
          width="58"
          height="60"
          rx="18"
          fill="url(#mihi-glass)"
          stroke="#dfe4d7"
        />
        <rect
          x="102"
          y="80"
          width="58"
          height="16"
          rx="8"
          fill="url(#mihi-cap)"
        />
        <rect x="112" y="108" width="38" height="24" rx="6" fill="#f2f6ec" />
        <text
          x="131"
          y="124"
          textAnchor="middle"
          fontFamily="Montserrat, sans-serif"
          fontSize="10"
          fontWeight="800"
          fill="#4b6532"
          letterSpacing="1.5"
        >
          MIHI
        </text>
      </g>

      {/* сироватка */}
      <g>
        <rect
          x="172"
          y="66"
          width="40"
          height="82"
          rx="14"
          fill="url(#mihi-glass)"
          stroke="#dfe4d7"
        />
        <rect
          x="184"
          y="48"
          width="16"
          height="20"
          rx="5"
          fill="url(#mihi-cap)"
        />
        <rect x="178" y="96" width="28" height="26" rx="6" fill="#f2f6ec" />
        <path
          d="M192 102 C186 106 185 114 191 118 C197 114 198 106 192 102 Z"
          fill="url(#mihi-cap)"
        />
        <rect
          x="177"
          y="74"
          width="7"
          height="52"
          rx="3.5"
          fill="#ffffff"
          opacity="0.7"
        />
      </g>

      {/* листочки */}
      <path
        d="M226 128 C214 132 210 144 220 150 C230 146 232 134 226 128 Z"
        fill="#91b06c"
        opacity="0.85"
      />
      <path
        d="M34 132 C24 136 21 146 30 151 C38 147 40 137 34 132 Z"
        fill="#b0c992"
        opacity="0.8"
      />
    </svg>
  );
}
