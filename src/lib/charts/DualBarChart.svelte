<script>
    import { scaleLinear } from 'd3-scale';

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
     */
    let {
        data           = [],
        colors         = [],
        breakpoints    = [],
        maxValue       = null,
        unit           = '$',
        primaryColor   = 'var(--brandGray)', // #D0D1C9 — light, full-width total bar
        secondaryColor = '#fca9a9',          // faint light red — distinct from primary, provides contrast while subtle
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

    function capitalize(s) {
        return s.replace(/\b\w/g, c => c.toUpperCase());
    }

    function barY(i) { return BAR_TOP + i * BAR_GAP; }
</script>

<div class="chart-outer">
    <div class="chart-wrapper" bind:offsetWidth={chartWidth}>
        {#if chartWidth > 0 && data.length > 0}
            <svg width={chartWidth} height={svgHeight} id="chart">

                <!-- 4 equally-spaced vertical grid lines with axis labels -->
                {#each gridLines as gl}
                    {@const gx = X_START + xScale(gl)}
                    <line class="grid-primary"
                        x1={gx} y1={X_AXIS_TOP}
                        x2={gx} y2={svgHeight}
                    />
                    <text class="axis-label"
                        x={gx} y={X_AXIS_TOP - 4}
                        text-anchor="middle"
                    >{fmtAxis(gl)}</text>
                {/each}

                <!-- Data rows -->
                {#each data as d, i}
                    {@const by         = barY(i)}
                    {@const bclr       = getColor(d.pct)}
                    {@const primaryW   = xScale(d.primaryValue ?? 0)}
                    {@const secondaryW = xScale(Math.max(0, d.secondaryValue ?? 0))}

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
                    <text class="bar-label"
                        x={X_START + 5} y={by + 5}
                    >{capitalize(d.label)}</text>
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

    .axis-label {
        fill: var(--brandBlack);
        font-size: 12px;
        font-family: OpenSans;
    }

    .bar-classifier-box {
        stroke-width: 1;
        stroke-opacity: 1;
    }

    .bar-classifier-text {
        font-size: 12px;
        font-family: OpenSans;
        font-weight: bold;
    }

    .bar-label {
        fill: var(--brandGray70);
        font-size: 14px;
        font-family: OpenSans;
    }
</style>
