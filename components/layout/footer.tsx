import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/50 mt-24">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-1 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year })}</p>
          <p>{t("tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
