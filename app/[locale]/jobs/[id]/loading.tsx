import { getTranslations } from "next-intl/server";

export default async function JobDetailLoading() {
  const t = await getTranslations("app");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      <div className="motion-safe:animate-pulse motion-reduce:opacity-70">
        {/* Back link */}
        <div className="h-4 w-24 rounded bg-surface-muted" />

        {/* Header */}
        <div className="mt-6 flex flex-col gap-4 border-b border-border pb-8">
          <div className="flex gap-2">
            <div className="h-5 w-10 rounded-full bg-surface-muted" />
            <div className="h-5 w-16 rounded-full bg-surface-muted" />
          </div>
          <div className="h-9 w-3/4 rounded bg-surface-muted" />
          <div className="h-5 w-1/3 rounded bg-surface-muted" />
          <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-3 w-16 rounded bg-surface-muted" />
                <div className="h-4 w-32 rounded bg-surface-muted" />
              </div>
            ))}
          </div>
          <div className="mt-2 h-10 w-36 rounded-full bg-surface-muted" />
        </div>

        {/* Description */}
        <div className="mt-8 flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-surface-muted"
              style={{ width: `${70 + (i % 3) * 10}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
