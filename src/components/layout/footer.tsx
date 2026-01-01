import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { PdfIcon, GithubIcon, WalletIcon, ExplorerIcon, ZeldAIIcon } from "@/components/ui";

type FooterLink = {
  href: string;
  labelKey: string;
  external?: boolean;
  icon?: "wallet" | "explorer" | "zeldai" | "pdf" | "github";
};

export async function Footer() {
  const t = await getTranslations("common");
  const locale = await getLocale();

  const FOOTER_LINKS: FooterLink[] = [
    { href: "/wallet", labelKey: "nav.wallet", icon: "wallet" },
    { href: "/explorer", labelKey: "nav.explorer", icon: "explorer" },
    { href: "/faq", labelKey: "nav.zeldai", icon: "zeldai" },
    { href: `/whitepaper/zeldhash-whitepaper-${locale}.pdf`, labelKey: "nav.whitepaper", external: true, icon: "pdf" },
    { href: "https://github.com/ouziel-slama/zeldhash/", labelKey: "nav.github", external: true, icon: "github" },
  ];

  const renderIcon = (icon?: FooterLink["icon"]) => {
    switch (icon) {
      case "wallet":
        return <WalletIcon className="w-4 h-4" />;
      case "explorer":
        return <ExplorerIcon className="w-4 h-4" />;
      case "zeldai":
        return <ZeldAIIcon className="w-4 h-4" />;
      case "pdf":
        return <PdfIcon className="w-5 h-5" />;
      case "github":
        return <GithubIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <footer className="px-6 md:px-12 py-12 border-t border-gold-400/10 text-center">
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-6 text-sm uppercase tracking-[1px]">
        {FOOTER_LINKS.map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-500 hover:text-gold-400 transition-colors flex items-center gap-1.5"
            >
              {renderIcon(link.icon)}
              {t(link.labelKey)}
            </a>
          ) : (
            <Link key={link.href} href={link.href} className="text-dark-500 hover:text-gold-400 transition-colors flex items-center gap-1.5">
              {renderIcon(link.icon)}
              {t(link.labelKey)}
            </Link>
          )
        )}
      </div>
      <p className="text-[13px] text-dark-700">
        {t("footer.motto")}
      </p>
    </footer>
  );
}

