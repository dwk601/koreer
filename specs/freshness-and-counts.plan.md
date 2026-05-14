# Freshness, Counts & Date Fallback — Test Plan

## Application Overview

Koreer is a Next.js 16 App Router job-search site for Korean speakers in the US.
It advertises "only listings posted within the last 60 days" but currently does NOT
inject `post_date_from` on any upstream API call. Jobs with no `post_date` render
an empty span. The `/jobs` page makes two identical-param upstream calls
(`/api/v1/jobs` + `/api/v1/jobs/facets`) when one would suffice.

### Baseline defects (captured 2026-05-14)

```
/api/v1/jobs?q=nurse&limit=20          → post_date_from: NO
/api/v1/jobs/facets?q=nurse&limit=20   → post_date_from: NO  (also redundant)
/api/v1/jobs/stats                     → unaffected (full-corpus count, intentional)
```

---

## Test Scenarios

### 1. Freshness injection

**Seed:** `tests/e2e/seed.spec.ts`

#### 1.1. injects-post-date-from

**File:** `tests/e2e/freshness/injects-post-date-from.spec.ts`

**Steps:**
1. Navigate to `/en/jobs` and collect all outgoing requests to `**/api/v1/jobs?**` and `**/api/v1/jobs/facets?**`
   - expect: every such request URL contains `post_date_from` equal to today − 60 days (YYYY-MM-DD)
2. Navigate to `/en/jobs?q=nurse` and collect requests
   - expect: `post_date_from` is still present alongside `q=nurse`
3. Collect requests to `**/api/v1/jobs/suggest?**` and `**/api/v1/jobs/{id}` (detail page)
   - expect: those requests do NOT carry `post_date_from`

---

### 2. Performance — no redundant facets call

**Seed:** `tests/e2e/seed.spec.ts`

#### 2.1. no-redundant-facets

**File:** `tests/e2e/performance/no-redundant-facets.spec.ts`

**Steps:**
1. Navigate to `/en/jobs` and collect all upstream requests
   - expect: exactly one request matches `/api/v1/jobs?` (the list call)
   - expect: zero requests match `/api/v1/jobs/facets?`
2. Verify the sidebar and result count both rendered (facets came from the list response)
   - expect: the "X results" count text is visible
   - expect: at least one sidebar filter section is visible

---

### 3. UI — missing post_date fallback

**Seed:** `tests/e2e/seed.spec.ts`

#### 3.1. missing-post-date-fallback

**File:** `tests/e2e/ui/missing-post-date-fallback.spec.ts`

**Steps:**
1. Mock `**/api/v1/jobs?**` to return a fixture list with two items: one with `post_date: "2026-05-10"`, one with `post_date: null`
2. Navigate to `/en/jobs`
   - expect: the card for the null-date job shows "Posting date not listed" in italic
   - expect: the card for the dated job shows a relative-time string (e.g. "4 days ago")
3. Switch locale to `/ko/jobs` (same mock)
   - expect: the null-date card shows "등록일 미기재" in italic
