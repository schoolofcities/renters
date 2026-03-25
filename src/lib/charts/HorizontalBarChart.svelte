<script>
    import { scaleLinear } from 'd3-scale';

    /**
     * Generic reusable horizontal bar chart.
     *
     * Each data row has the shape { label: string, value: number, pct: number|null }.
     * Bar length encodes `value`; the colored classifier box on the left encodes `pct`.
     *
     * @prop {Array}    data          - Rows pre-sorted by the caller
     * @prop {string[]} colors        - Sequential colors, low → high (length n)
     * @prop {number[]} breakpoints   - Pct thresholds for color classification (length n-1)
     * @prop {number}   maxValue      - x-axis upper bound (falls back to data max)
     * @prop {string}   unit          - Prefix for value axis labels (e.g. '$')
     */
    let {
        data          = [],
        colors        = [],
        breakpoints   = [],
        maxValue      = null,
        unit          = '$',
    } = $props();

    let chartWidth = $state(0);

    const PCT_BOX_W  = 50;   // colored classifier box width (far left)
    const X_START    = 60;   // x-offset where bars begin
    const BAR_GAP    = 24;   // vertical row height (px)
    const BAR_TOP    = 52;   // y-centre of first bar
    const BAR_H      = 16;   // bar stroke-width
    const END_GAP    = 60;   // right-side padding after longest bar
    const X_AXIS_TOP = 34;   // y where vertical grid lines start

    let barAreaW = $derived(Math.max(0, chartWidth - X_START - END_GAP));
    let svgHeight = $derived(BAR_GAP * data.length + 40);
    let dataMax  = $derived(maxValue ?? Math.max(...data.map(d => d.value), 1));

    // Smallest clean step where step*4 >= dataMax, guaranteeing exactly 4 grid lines.
    // Candidates are standard multiples of the leading power of ten.
    let gridStep = $derived.by(() => {
        const raw  = dataMax / 4;
        const mag  = Math.pow(10, Math.floor(Math.log10(raw)));
        const candidates = [1, 2, 2.5, 3, 4, 5, 10].map(f => f * mag);
        return candidates.find(s => s * 4 >= dataMax) ?? (mag * 10);
    });

    // Scale domain is always step*4 so all 4 lines fit within the chart area.
    let xScale = $derived(
        scaleLinear().domain([0, gridStep * 4]).range([0, barAreaW])
    );

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
        return unit + (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K' : n.toString());
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
                    {@const bw   = xScale(d.value)}
                    {@const by   = barY(i)}
                    {@const bclr = getColor(d.pct)}

                    <!-- Static gray bar -->
                    <line class="bar-data"
                        x1={X_START + 1} y1={by}
                        x2={X_START + 1 + bw} y2={by}
                        stroke-width={BAR_H}
                    />

                    <!-- Colored value box on far left -->
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
        margin-top: -20px;
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

    .bar-data {
        stroke: var(--brandGray);
        stroke-opacity: 1;
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
