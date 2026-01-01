import { Button } from "@/components/ui";
import { getTranslations } from "next-intl/server";

export async function CTASection() {
  const t = await getTranslations("home");

  return (
    <section className="w-full py-[100px] px-6 md:px-12 text-center bg-gradient-to-b from-transparent to-gold-400/[0.08]">
      <div className="max-w-[1000px] mx-auto">
        <h3 className="text-5xl font-light tracking-[-1px] mb-6 font-serif">
          {t("cta.title")}
        </h3>
        <p className="text-lg text-dark-300 mb-12">
          {t("cta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as="link" href="/explorer" size="lg">
            {t("cta.checkBalance")}
          </Button>
          <Button
            as="link"
            href="/wallet"
            variant="secondary"
            size="lg"
          >
            {t("cta.startHunting")}
          </Button>
        </div>
      </div>
    </section>
  );
}
