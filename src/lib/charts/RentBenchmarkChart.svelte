<script>
    import { scaleLinear } from 'd3-scale';
    import { line as d3line } from 'd3-shape';
    import benchmarkData from '$data/rising-rents-supply/vis1_benchmark_index.json';

    // ─── colours ─── bright, drawn from the brand palette; rent reads as the headline series ──
    const C_RENT      = '#DC4633'; // brandRed
    const C_GUIDELINE = '#EBA00F'; // brandOrange
    const C_CPI       = '#007FA3'; // brandMedBlue
    const C_INCOME    = '#00A189'; // brandMedGreen

    const SERIES = [
        { key: 'rent_index',         label: 'Average rent',    color: C_RENT,      dashed: true,  anchor: 'start', dx: 0,  nameGap: 12,  valueGap: 26 },
        { key: 'rent_control_index', label: 'Rent Control',    color: C_GUIDELINE, dashed: false, anchor: 'start', dx: 0, nameGap: -24, valueGap: -10  },
        { key: 'income_index',       label: 'Income',          color: C_INCOME,    dashed: false, anchor: 'start', dx: 8,  nameGap: -4,  valueGap: 10 },
        { key: 'cpi_index',          label: 'Inflation (CPI)', color: C_CPI,       dashed: false, anchor: 'start', dx: 0, nameGap: 12,  valueGap: 26 },
    ];

    // ─── layout ────────────────────────────────────────────────────────────────
    // Right margin sized to the widest thing it has to hold: "Inflation (CPI)" is now the
    // longest left-aligned label reading rightward, so it's the binding constraint.
    const MARGIN   = { top: 16, right: 80, bottom: 36, left: 56 };
    const CHART_H  = 340;
    const Y_DOMAIN = [500, 1750];
    const Y_TICKS  = [500, 750, 1000, 1250, 1500, 1750];
    const X_TICKS  = [1990, 1997, 2004, 2011, 2018, 2025];

    // ─── reactive state ────────────────────────────────────────────────────────
    let containerW = $state(0);
    let innerW     = $derived(Math.max(0, containerW - MARGIN.left - MARGIN.right));
    let innerH     = $derived(CHART_H - MARGIN.top - MARGIN.bottom);

    let xScale = $derived(scaleLinear().domain([1990, 2025]).range([0, innerW]));
    let yScale = $derived(scaleLinear().domain(Y_DOMAIN).range([innerH, 0]));

    let paths = $derived.by(() => {
        const xs = xScale, ys = yScale;
        return Object.fromEntries(SERIES.map(s => [
            s.key,
            d3line().defined(d => Number.isFinite(d[s.key])).x(d => xs(d.index)).y(d => ys(d[s.key]))(benchmarkData),
        ]));
    });

    // End-of-line labels: last defined point per series, positioned per its hand-tuned config.
    let endLabels = $derived.by(() => {
        const xs = xScale, ys = yScale;
        return SERIES.map(s => {
            const last = [...benchmarkData].reverse().find(d => Number.isFinite(d[s.key]));
            const dotX = xs(last.index);
            const dotY = ys(last[s.key]);
            const x = dotX + s.dx;
            const nameY  = dotY + s.nameGap;
            const valueY = dotY + s.valueGap;

            return { ...s, year: last.index, value: last[s.key], dotX, dotY, x, nameY, valueY };
        });
    });

    function fmtY(v) {
        return `$${v.toLocaleString()}`;
    }

    function fmtValue(v) {
        return `$${Math.round(v).toLocaleString()}`;
    }
</script>

<div class="chart-outer">

    <!-- ── SVG chart ───────────────────────────────────────────────────────── -->
    <div class="chart-wrap" bind:offsetWidth={containerW}>
        {#if containerW > 0}
        <svg width={containerW} height={CHART_H}>
            <g transform="translate({MARGIN.left},{MARGIN.top})">

                <!-- Y grid lines + labels -->
                {#each Y_TICKS as tick}
                    <line
                        x1={0}      y1={yScale(tick)}
                        x2={innerW} y2={yScale(tick)}
                        class="grid-line"
                    />
                    <text x={-9} y={yScale(tick)} class="chart-axis-label"
                        text-anchor="end" dominant-baseline="middle"
                    >{fmtY(tick)}</text>
                {/each}

                <!-- X baseline + year labels -->
                <line x1={0} y1={innerH} x2={innerW} y2={innerH} class="grid-line" />
                {#each X_TICKS as tick}
                    <text
                        x={xScale(tick)} y={innerH + 22}
                        class="chart-axis-label"
                        text-anchor="middle"
                    >{tick}</text>
                {/each}

                <!-- Benchmark lines (solid), drawn first -->
                {#each SERIES.filter(s => !s.dashed) as s}
                    <path d={paths[s.key]} class="line" fill="none" stroke={s.color} />
                {/each}

                <!-- Rent line (dashed), drawn last so it reads on top -->
                {#each SERIES.filter(s => s.dashed) as s}
                    <path d={paths[s.key]} class="line rent-line" fill="none" stroke={s.color} />
                {/each}

                <!-- End-of-line markers + labels: name row above, value row below -->
                {#each endLabels as d}
                    <circle cx={d.dotX} cy={d.dotY} r="3.5" fill={d.color} />
                    <text x={d.x} y={d.nameY}  class="end-label" text-anchor={d.anchor} fill={d.color} dominant-baseline="middle">{d.label}</text>
                    <text x={d.x} y={d.valueY} class="end-label" text-anchor={d.anchor} fill={d.color} dominant-baseline="middle">{fmtValue(d.value)}</text>
                {/each}

            </g>
        </svg>
        {/if}
    </div>

    <p class="chart-source-note">
        Source: CMHC Rental Market Survey, Statistics Canada, Ontario Ministry of Municipal Affairs and Housing.
        Average rent begins at Ontario's actual average rent in 1990 ($576); CPI, the rent-control guideline, and
        income are each pegged to that same starting value so their growth since 1990 can be compared directly in
        dollar terms. Income data is not yet available for 2025. Nominal values do not account for inflation
        except where noted.
    </p>

</div>

<style>
    .chart-outer {
        width: 100%;
        margin: 1.5rem 0;
    }

    /* ── SVG helpers ─────────────────────────────────────────────────────── */
    .chart-wrap {
        width: 100%;
    }

    .grid-line {
        stroke: var(--brandGray);
        stroke-width: 0.5;
    }

    .line {
        stroke-width: 2.75;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .rent-line {
        stroke-dasharray: 7 5;
    }

    .end-label {
        font-family: OpenSans;
        font-size: 12px;
        font-weight: 600;
    }

    /* ── Responsive ──────────────────────────────────────────────────────── */
    @media (max-width: 600px) {
        .end-label { font-size: 11px; }
    }

    @media (max-width: 420px) {
        .end-label { font-size: 10px; }
    }
</style>
