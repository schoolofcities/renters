<script>
    import { scaleLinear } from 'd3-scale';
    import { capitalize } from '$lib/utils/format.js';

    /**
     * Generic reusable dual horizontal bar chart.
     *
     * Each data row: { label: string, primaryValue: number, secondaryValue: number|null, pct: number|null }.
     * primaryValue (total) is drawn as a lighter background bar; secondaryValue (excess) is drawn
     * on top as a darker bar. Both start from the same x-origin, so the shorter one is visually
     * nested inside the longer one.
     *
     * @prop {Array}    data           - Rows pre-sorted by the caller
     * @prop {string[]} colors         - Sequential colors for pct box classification (length n)
     * @prop {number[]} breakpoints    - Pct thresholds for color classification (length n-1)
     * @prop {number}   maxValue       - x-axis upper bound (falls back to primaryValue max)
     * @prop {string}   unit           - Prefix for axis labels (e.g. '$')
     * @prop {string}   primaryColor   - Color for the primary (total) bar
     * @prop {string}   secondaryColor - Color for the secondary (excess) bar, drawn on top
     *
     * In-chart annotation (replaces a separate legend, NYT-style): pick one row to demonstrate
     * "this is the total bar" and one to demonstrate "this is the excess bar", by city (not by
     * rank) so the callouts stay attached to the same bar length no matter how the caller re-sorts
     * the data — only their row position moves. Both get the same partial outline treatment:
     * just the right two-thirds, no left edge, so it never runs into the city name text. Row
     * spacing stays uniform — annotation text reads to the right of its bar, not above/below it,
     * so it never needs extra vertical room between rows.
     * @prop {string|null} annotateTotalCity   - city (matches `label`, case-insensitive) whose
     *                                           full bar gets the outline + label to its right
     * @prop {string|null} annotateExcessCity  - city whose excess bar gets the outline + label
     *                                           just past its end, nudged down and right
     * @prop {string} totalAnnotationText
     * @prop {string} excessAnnotationText
     */
    let {
        data           = [],
        colors         = [],
        breakpoints    = [],
        maxValue       = null,
        unit           = '$',
        primaryColor   = 'var(--brandGray)', // #D0D1C9 — light, full-width total bar
        secondaryColor = '#fca9a9',          // faint light red — distinct from primary, provides contrast while subtle
        annotateTotalCity   = null,
        annotateExcessCity  = null,
        totalAnnotationText  = 'Total rent increase',
        excessAnnotationText = 'Excess above rent control',
    } = $props();

    let chartWidth = $state(0);

    const PCT_BOX_W      = 50;  // colored classifier box width (far left)
    const X_START        = 60;  // x-offset where bars begin
    const BAR_GAP        = 24;  // vertical row height (px)
    const BAR_H          = 16;  // primary bar stroke-width
    const SEC_BAR_H      = 8;   // secondary bar stroke-width — half-height, centered inside primary
    const END_GAP        = 60;  // right-side padding after longest bar
    const X_AXIS_TOP     = 34;  // y where vertical grid lines (and axis labels) start
    const BAR_TOP        = X_AXIS_TOP + 18; // y-centre of first bar — 18px below axis label row
    const BAR_BOTTOM_PAD = 40;  // extra px below last bar

    let barAreaW  = $derived(Math.max(0, chartWidth - X_START - END_GAP));
    let svgHeight = $derived(BAR_GAP * data.length + BAR_BOTTOM_PAD);
    let dataMax   = $derived(maxValue ?? Math.max(...data.map(d => d.primaryValue ?? 0), 1));

    // Smallest clean step where step*4 >= dataMax, guaranteeing exactly 4 grid lines.
    let gridStep = $derived.by(() => {
        const raw  = dataMax / 4;
        const mag  = Math.pow(10, Math.floor(Math.log10(raw)));
        const candidates = [1, 2, 2.5, 3, 4, 5, 10].map(f => f * mag);
        return candidates.find(s => s * 4 >= dataMax) ?? (mag * 10);
    });

    // Scale domain is always step*4 so all 4 grid lines fit within the chart area.
    let xScale    = $derived(scaleLinear().domain([0, gridStep * 4]).range([0, barAreaW]));
    let gridLines = $derived([1, 2, 3, 4].map(i => i * gridStep));

    function getColor(pct) {
        if (pct == null) return colors[0];
        for (let i = 0; i < breakpoints.length; i++) {
            if (pct <= breakpoints[i]) return colors[i];
        }
        return colors[colors.length - 1];
    }

    function fmtPct(pct) {
        if (pct == null) return '';
        return pct.toFixed(1) + '%';
    }

    function fmtAxis(v) {
        const n = Math.round(v);
        if (n >= 1000) {
            const decimals = n % 1000 === 0 ? 0 : 1; // e.g. $1K vs $1.2K
            return unit + (n / 1000).toFixed(decimals) + 'K';
        }
        return unit + n;
    }

    function isCity(label, target) {
        return target && label?.toLowerCase() === target.toLowerCase();
    }

    function barY(i) { return BAR_TOP + i * BAR_GAP; }

    // Rough width estimate (avg char width at 12px bold OpenSans) — good enough to reserve
    // canvas space, not for pixel-perfect typesetting.
    function estTextWidth(str) { return str.length * 6.7; }

    // The annotation labels read past the end of their bar. On a narrow/mobile chart, the bar
    // area shrinks and that label can need more room than the container actually has — so instead
    // of clipping it, we let the <svg> itself grow wider than the container and rely on the
    // wrapper's existing horizontal scroll (already used for e.g. long city lists) to reveal it.
    // Bar proportions (xScale, barAreaW) stay tied to the real container width — only the canvas
    // and blank margin grow.
    let annotationReach = $derived.by(() => {
        let reach = 0;
        if (annotateTotalCity) {
            const row = data.find(d => isCity(d.label, annotateTotalCity));
            if (row) {
                const primaryW = xScale(Math.max(0, row.primaryValue ?? 0));
                reach = Math.max(reach, X_START + 1 + primaryW + 10 + estTextWidth(totalAnnotationText));
            }
        }
        if (annotateExcessCity) {
            const row = data.find(d => isCity(d.label, annotateExcessCity));
            if (row) {
                const secondaryW = xScale(Math.max(0, row.secondaryValue ?? 0));
                reach = Math.max(reach, X_START + 1 + secondaryW + 10 + estTextWidth(excessAnnotationText));
            }
        }
        return reach;
    });
    let svgWidth = $derived(Math.max(chartWidth, annotationReach + 12));
</script>

<div class="chart-outer">
    <div class="chart-wrapper" bind:offsetWidth={chartWidth}>
        {#if chartWidth > 0 && data.length > 0}
            <svg width={svgWidth} height={svgHeight} id="chart">

                <!-- 4 equally-spaced vertical grid lines with axis labels -->
                {#each gridLines as gl}
                    {@const gx = X_START + xScale(gl)}
                    <line class="grid-primary"
                        x1={gx} y1={X_AXIS_TOP}
                        x2={gx} y2={svgHeight}
                    />
                    <text class="chart-axis-label"
                        x={gx} y={X_AXIS_TOP - 4}
                        text-anchor="middle"
                    >{fmtAxis(gl)}</text>
                {/each}

                <!-- Data rows -->
                {#each data as d, i}
                    {@const by         = barY(i)}
                    {@const bclr       = getColor(d.pct)}
                    {@const primaryW   = xScale(Math.max(0, d.primaryValue ?? 0))}
                    {@const secondaryW = xScale(Math.max(0, d.secondaryValue ?? 0))}
                    {@const isTotalAnnotated  = isCity(d.label, annotateTotalCity)}
                    {@const isExcessAnnotated = isCity(d.label, annotateExcessCity)}

                    <!-- Primary (total) bar — lighter, always the full-width background bar -->
                    <line
                        x1={X_START + 1} y1={by}
                        x2={X_START + 1 + primaryW} y2={by}
                        stroke={primaryColor}
                        stroke-width={BAR_H}
                    />

                    <!-- Secondary (excess) bar — half-height, centered; omitted if zero or negative -->
                    {#if secondaryW > 0}
                        <line
                            x1={X_START + 1} y1={by}
                            x2={X_START + 1 + secondaryW} y2={by}
                            stroke={secondaryColor}
                            stroke-width={SEC_BAR_H}
                        />
                    {/if}

                    <!-- Colored pct classifier box -->
                    <rect class="bar-classifier-box"
                        x={0} y={by - 8}
                        width={PCT_BOX_W} height={16}
                        fill={bclr} stroke={bclr}
                    />
                    <text class="bar-classifier-text"
                        x={PCT_BOX_W / 2} y={by + 4}
                        text-anchor="middle" fill="white"
                    >{fmtPct(d.pct)}</text>

                    <!-- City name inside bar area -->
                    <text class="chart-axis-label bar-label"
                        x={X_START + 5} y={by + 5}
                    >{capitalize(d.label)}</text>

                    <!-- "Total rent increase" annotation: outline the bar's right half only (no
                         left edge, matching the excess treatment below), label to its right -->
                    {#if isTotalAnnotated}
                        {@const totLeft  = X_START + 1 + primaryW / 1.5}
                        {@const totRight = X_START + 1 + primaryW}
                        <path class="annotation-outline"
                            fill="none"
                            d="M {totLeft} {by - 8} L {totRight} {by - 8} L {totRight} {by + 8} L {totLeft} {by + 8}"
                        />
                        <text class="annotation-text"
                            x={totRight + 10} y={by}
                            dominant-baseline="middle"
                        >{totalAnnotationText}</text>
                    {/if}

                    <!-- "Excess above rent control" annotation: outline the bar's right half only
                         (no left edge) so it clears the city name; label sits just past the bar's
                         end, vertically centered on the bar itself — fine if that overlaps the
                         (lighter) total bar underneath it -->
                    {#if isExcessAnnotated && secondaryW > 0}
                        {@const excLeft  = X_START + 1 + secondaryW / 1.5}
                        {@const excRight = X_START + 1 + secondaryW}
                        <path class="annotation-outline"
                            fill="none"
                            d="M {excLeft} {by - 4} L {excRight} {by - 4} L {excRight} {by + 4} L {excLeft} {by + 4}"
                        />
                        <text class="annotation-text"
                            x={excRight + 8} y={by}
                            dominant-baseline="middle"
                        >{excessAnnotationText}</text>
                    {/if}
                {/each}

            </svg>
        {/if}
    </div>
</div>

<style>
    .chart-outer {
        width: 100%;
    }

    .chart-wrapper {
        margin: 0;
        margin-top: -20px; /* pulls chart up to absorb the SVG's built-in X_AXIS_TOP headroom */
        min-width: 250px;
        max-width: 100%;
        width: 100%;
        overflow-x: auto;
    }

    #chart {
        margin-top: 10px;
        margin-bottom: 10px;
        background-color: var(--brandWhite);
    }

    .grid-primary {
        stroke: var(--brandGray);
        stroke-width: 0.5px;
    }

    .bar-classifier-box {
        stroke-width: 1;
        stroke-opacity: 1;
    }

    .bar-classifier-text {
        font-size: 12px;
        font-family: OpenSans;
        font-weight: 600;
    }

    /* City-row label keeps the shared axis-label color/family but reads a size larger here */
    .bar-label {
        font-size: 14px;
    }

    .annotation-outline {
        fill: none;
        stroke: var(--brandGray90);
        stroke-width: 1;
        stroke-opacity: 0.65;
    }

    .annotation-text {
        fill: var(--brandGray90);
        font-size: 12px;
        font-family: OpenSans;
        font-weight: 600;
    }

    @media (max-width: 600px) {
        .annotation-text { font-size: 11px; }
    }

    @media (max-width: 400px) {
        .annotation-text { font-size: 10px; }
    }
</style>
