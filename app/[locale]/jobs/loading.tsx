import { getTranslations } from "next-intl/server";

export default async function JobsLoading() {
  const t = await getTranslations("app");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      <div className="flex flex-col gap-5 border-b border-border pb-8">
        <div className="h-7 w-36 motion-safe:animate-pulse motion-reduce:opacity-70 rounded bg-surface-muted" />
        <div className="h-11 motion-safe:animate-pulse motion-reduce:opacity-70 rounded-full border border-border bg-surface" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <div className="motion-safe:animate-pulse motion-reduce:opacity-70 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 border-b border-border py-3">
              <div className="h-3 w-24 rounded bg-surface-muted" />
              <div className="h-3 w-full rounded bg-surface-muted/60" />
              <div className="h-3 w-3/4 rounded bg-surface-muted/60" />
              <div className="h-3 w-1/2 rounded bg-surface-muted/60" />
            </div>
          ))}
        </div>
        <div className="motion-safe:animate-pulse motion-reduce:opacity-70">
          <div className="h-4 w-56 rounded bg-surface-muted" />
          <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="h-[152px] rounded-xl border border-border bg-surface"
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
