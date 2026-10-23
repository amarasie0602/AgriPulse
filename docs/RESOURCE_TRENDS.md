# Resource consumption history

The resource-trends repair keeps the existing React/SVG implementation and resource APIs. No charting dependency, backend route, authentication, MongoDB, or Docker configuration changed.

## Findings

- `Analytics.tsx` used `Sparkline`, which deliberately suppressed date labels and gridlines. It supplied no vertical scale or useful interaction beyond SVG titles.
- Month aggregation inserted a numeric zero for every unrecorded month from the earliest resource record through today. One later observation therefore looked like a diagonal increase from zero. Several resources had only one record in the local database, so the apparent history was unsupported.
- The sparkline combined a fixed-height wrapper with a percentage-height SVG and a global SVG sizing rule. Intrinsic percentage-height sizing produced inconsistent chart/card proportions.
- The dashboard combined resource series with incompatible units on one numeric scale.
- `GET /resources` returns at most 200 records, newest usage date first. This existing limit is retained and disclosed; filters operate on loaded records, not the entire database.

## Behavior

`resourceHistory.ts` groups actual usage dates into UTC calendar days, Monday-start weeks, or calendar months. It sums matching resource/unit groups, normalizes case and surrounding whitespace, and keeps different units separate without guessing conversion factors. Invalid quantities, dates, or empty units are excluded. Missing periods use null gaps rather than zero. Gaps are represented sparsely, so decades of missing history do not create thousands of points.

The five principal resources remain visible with explicit empty states. A single observed period displays a dated point and a limited-history message. Multiple observed periods show exact points with linear segments only across adjacent periods. No smoothing, gradient fill, inferred history, or percentage comparisons are generated.

Each chart has its own zero-based rounded scale, readable dates, subtle gridlines, pointer/touch feedback, keyboard-navigable points, and an expandable HTML data table. Charts use measured widths and a fixed 210px plot height, within a two-column desktop/single-column mobile grid. The forest, sage, cream, and dark-theme tokens are retained.

Dashboard resource trends use the same aggregation and a resource/unit selector, so incompatible units never share a scale. Carbon history reuses the existing emission factors and also preserves missing periods.

## Verification

Run the aggregation regression suite using the existing TypeScript runner:

```powershell
node --import ./backend/node_modules/tsx/dist/loader.mjs --test frontend/tests/resourceHistory.test.ts
npm.cmd --prefix frontend run build
```

Thirteen regression cases cover sorting, recorded dates, same-period sums, single observations, explicit zero versus absent records, unit separation, week/year boundaries, missing months, sparse ranges, invalid data, all five resource types, dashboard aggregation, and existing carbon factors.

Chrome verification uses a temporary authenticated account and records saved through the existing API, then deletes only that account's test data. It checks empty and limited history, distinct five-resource histories, exact totals, tooltip and keyboard values, data tables, 1366/768/390px layouts, monthly aggregation, missing-month gaps, mixed units, date filters, dark mode, and the resource-tracking page. The generated values are test fixtures and are never inserted into a farmer's account or included in application code.
