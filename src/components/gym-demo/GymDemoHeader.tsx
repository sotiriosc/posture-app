import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/pilot", label: "Pilot" },
  { href: "/gym-demo", label: "Demo Overview" },
  { href: "/gym-demo/member", label: "Member Demo" },
  { href: "/gym-demo/admin", label: "Admin Dashboard" },
];

type GymDemoHeaderProps = {
  activeHref?: string;
  badge?: string;
};

export default function GymDemoHeader({
  activeHref,
  badge,
}: GymDemoHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <Link
        href="/pilot"
        aria-label="Praxis for Gyms"
        className="inline-flex h-9 w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E3E9EE] bg-[#1F2A33] px-2 shadow-[0_12px_34px_rgba(31,42,51,0.12)] sm:h-10 sm:w-[180px] md:h-11 md:w-[210px] lg:h-12 lg:w-[240px] xl:h-14 xl:w-[270px]"
      >
        <Image
          src="/icons/praxis-logo-full.png"
          alt="Praxis"
          width={440}
          height={132}
          className="h-full w-full scale-[2.7] object-contain object-center sm:scale-[2.6] md:scale-[2.5] lg:scale-[2.4]"
          priority
        />
      </Link>

      <div className="flex flex-col gap-3 sm:items-end">
        {badge ? (
          <span className="w-fit rounded-full border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-2 text-xs font-semibold uppercase text-[#5B8FA8]">
            {badge}
          </span>
        ) : null}
        <nav
          aria-label="Praxis for Gyms demo navigation"
          className="flex flex-wrap gap-2 text-sm"
        >
          {navLinks.map((link) => {
            const active = activeHref === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg border px-3 py-2 font-semibold transition sm:px-4 ${
                  active
                    ? "border-[#5B8FA8]/55 bg-[#5B8FA8]/10 text-[#1F2A33]"
                    : "border-[#E3E9EE] bg-white text-[#1F2A33] hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
