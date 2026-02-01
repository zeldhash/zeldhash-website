import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { PdfIcon, GithubIcon, XIcon, WalletIcon, ExplorerIcon, ZeldAIIcon } from "@/components/ui";

type FooterLink = {
  href: string;
  labelKey?: string;
  label?: string;
  external?: boolean;
  icon?: "wallet" | "explorer" | "zeldai" | "pdf" | "github" | "x" | "legacy";
};

export async function Footer() {
  const t = await getTranslations("common");
  const locale = await getLocale();

  const FOOTER_LINKS: FooterLink[] = [
    { href: "/wallet", labelKey: "nav.wallet", icon: "wallet" },
    { href: "/explorer", labelKey: "nav.explorer", icon: "explorer" },
    { href: "/faq", labelKey: "nav.zeldai", icon: "zeldai" },
    { href: "/legacy-wallet", labelKey: "nav.legacyWallet", icon: "legacy" },
    { href: `/whitepaper/zeldhash-whitepaper-${locale}.pdf`, labelKey: "nav.whitepaper", external: true, icon: "pdf" },
    { href: "https://x.com/ZeldHash", label: "X", external: true, icon: "x" },
    { href: "https://github.com/zeldhash/zeldhash/", labelKey: "nav.github", external: true, icon: "github" },
  ];

  const renderIcon = (icon?: FooterLink["icon"]) => {
    switch (icon) {
      case "wallet":
        return <WalletIcon className="w-4 h-4 text-gold-400" />;
      case "explorer":
        return <ExplorerIcon className="w-4 h-4 text-gold-400" />;
      case "zeldai":
        return <ZeldAIIcon className="w-4 h-4 text-gold-400" />;
      case "legacy":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gold-400">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.145c.18-.097.403-.225.652-.39.493-.325 1.08-.786 1.65-1.33.609-.58 1.29-1.376 1.757-2.323C15.178 13.688 15.5 12.516 15.5 11c0-3.47-2.66-6.57-5.5-6.97V2.75a.75.75 0 00-1.5 0v1.28C5.66 4.43 3 7.53 3 11c0 1.516.322 2.688.826 3.734.467.947 1.148 1.743 1.757 2.323.57.544 1.157 1.005 1.65 1.33.249.165.472.293.652.39a6.67 6.67 0 00.3.153l.006.003.002.001a.75.75 0 00.498.002z" clipRule="evenodd" />
          </svg>
        );
      case "pdf":
        return <PdfIcon className="w-5 h-5" />;
      case "x":
        return <XIcon className="w-5 h-5" />;
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
              {link.label ?? t(link.labelKey!)}
            </a>
          ) : (
            <Link key={link.href} href={link.href} className="text-dark-500 hover:text-gold-400 transition-colors flex items-center gap-1.5">
              {renderIcon(link.icon)}
              {link.label ?? t(link.labelKey!)}
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

