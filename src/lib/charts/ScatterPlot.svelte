<script>
    import { scaleLinear } from 'd3-scale';
    import { linearRegression } from '$lib/utils/regression.js';

    /**
     * Reusable scatter plot with a linear trend line, an r-value caption, and optional per-point
     * labels (shown always, or only on hover/tap — tapping a point shows its label, tapping
     * elsewhere or another point dismisses/switches it, so this also works on touch devices).
     *
     * @prop {Array} data - [{
     *   x, y, highlight?,        // highlight draws that dot in `darkColor`
     *   label?, labelMode?,      // labelMode: 'always' (default) or 'hover'
     *   labelDx?, labelDy?, labelAnchor?, // px offset + text-anchor for the label, relative to the dot
     * }]
     * @prop {number[]|null} xTicks  - fixed gridline positions; omit to auto-generate "nice" ticks
     * @prop {number[]|null} yTicks  - same, for the y-axis
     * @prop {string} xLabel         - semantic axis label, e.g. "Annual % change in rental units"
     * @prop {string} yLabel         - pass '' to omit (e.g. a second plot in a row that repeats the first's)
     * @prop {(v:number)=>string} xTickFormat
     * @prop {(v:number)=>string} yTickFormat
     * @prop {number} rValue         - pre-computed correlation coefficient (caller supplies this)
     * @prop {boolean} rSignificant
     * @prop {number} height         - plot height in px (width is responsive)
     * @prop {string} lightColor     - dot color for non-highlighted points
     * @prop {string} darkColor      - dot color for highlighted points
     */
    let {
        data           = [],
        xTicks         = null,
        yTicks         = null,
        xLabel         = '',
        yLabel         = '',
        xTickFormat    = (v) => `${v}%`,
        yTickFormat    = (v) => `${v}%`,
        rValue         = 0,
        rSignificant   = false,
        height         = 300,
        lightColor     = '#6FC7EA', // brandLightBlue — points before the highlighted group
        darkColor      = '#007FA3', // brandMedBlue — highlighted points (e.g. post-2018)
    } = $props();

    const MARGIN = { top: 10, right: 10, bottom: 40, left: 48 };
    const clipId = `scatter-clip-${Math.random().toString(36).slice(2)}`; // unique per instance so multiple plots on one page don't share a <clipPath> id

    let containerW = $state(0);
    let innerW = $derived(Math.max(0, containerW - MARGIN.left - MARGIN.right));
    let innerH = $derived(height - MARGIN.top - MARGIN.bottom);

    let hoveredIndex = $state(null);

    // Domain includes both the data's own extent and any fixed ticks the caller wants shown
    // (some data points fall outside the labeled tick range, e.g. an outlier year) — padded just
    // enough that a point sitting exactly on a tick isn't drawn flush against the plot edge. When
    // no fixed ticks are given, fall back to d3's "nice" rounding so auto-ticks land on clean numbers.
    const EDGE_PAD_FRACTION = 0.03;

    function computeAxis(values, fixedTicks) {
        const dataMin = Math.min(...values);
        const dataMax = Math.max(...values);
        if (fixedTicks && fixedTicks.length) {
            const all = [...values, ...fixedTicks];
            const min = Math.min(...all), max = Math.max(...all);
            const pad = (max - min) * EDGE_PAD_FRACTION || 1;
            return { domain: [min - pad, max + pad], ticks: fixedTicks };
        }
        const pad = (dataMax - dataMin) * EDGE_PAD_FRACTION || 1;
        const scale = scaleLinear().domain([dataMin - pad, dataMax + pad]).nice();
        return { domain: scale.domain(), ticks: scale.ticks(5) };
    }

    let xAxis = $derived(computeAxis(data.map(d => d.x), xTicks));
    let yAxis = $derived(computeAxis(data.map(d => d.y), yTicks));

    let xScale = $derived(scaleLinear().domain(xAxis.domain).range([0, innerW]));
    let yScale = $derived(scaleLinear().domain(yAxis.domain).range([innerH, 0]));

    let trend = $derived(data.length > 1 ? linearRegression(data) : null);
    let trendLine = $derived.by(() => {
        if (!trend) return null;
        const [x0, x1] = xAxis.domain;
        return {
            x1: xScale(x0), y1: yScale(trend.slope * x0 + trend.intercept),
            x2: xScale(x1), y2: yScale(trend.slope * x1 + trend.intercept),
        };
    });

    function fmtR(v) {
        const sign = v > 0 ? '+' : v < 0 ? '−' : '';
        return `r = ${sign}${Math.abs(v).toFixed(2)}`;
    }

    function showLabel(d, i) {
        return d.label && (d.labelMode !== 'hover' || hoveredIndex === i);
    }
</script>

<div class="scatter-outer">
    <div class="scatter-wrap" bind:offsetWidth={containerW}>
        {#if containerW > 0}
            <svg width={containerW} {height} onclick={() => (hoveredIndex = null)}>
                <defs>
                    <clipPath id={clipId}>
                        <rect x="0" y="0" width={innerW} height={innerH} />
                    </clipPath>
                </defs>
                <g transform="translate({MARGIN.left},{MARGIN.top})">

                    <!-- Gridlines + tick labels (the zero line, if shown, reads slightly darker) -->
                    {#each xAxis.ticks as t}
                        <line class="grid-line" class:zero-line={t === 0} x1={xScale(t)} y1={0} x2={xScale(t)} y2={innerH} />
                        <text class="chart-axis-label" x={xScale(t)} y={innerH + 16} text-anchor="middle">{xTickFormat(t)}</text>
                    {/each}
                    {#each yAxis.ticks as t}
                        <line class="grid-line" class:zero-line={t === 0} x1={0} y1={yScale(t)} x2={innerW} y2={yScale(t)} />
                        <text class="chart-axis-label" x={-6} y={yScale(t)} text-anchor="end" dominant-baseline="middle">{yTickFormat(t)}</text>
                    {/each}

                    <!-- Trend line -->
                    {#if trendLine}
                        <line class="trend-line"
                            x1={trendLine.x1} y1={trendLine.y1}
                            x2={trendLine.x2} y2={trendLine.y2}
                            clip-path="url(#{clipId})"
                        />
                    {/if}

                    <!-- Dots -->
                    {#each data as d, i}
                        <circle
                            cx={xScale(d.x)} cy={yScale(d.y)}
                            r={hoveredIndex === i ? 6.5 : 5}
                            fill={d.highlight ? darkColor : lightColor}
                            fill-opacity="0.75"
                            stroke="white" stroke-width="1"
                            class:hoverable={d.label && d.labelMode === 'hover'}
                            onmouseenter={() => (hoveredIndex = i)}
                            onmouseleave={() => (hoveredIndex = null)}
                            onclick={(e) => { e.stopPropagation(); hoveredIndex = i; }}
                        />
                    {/each}

                    <!-- Point labels — drawn in their own pass, after every dot, so a label is
                         never painted underneath a later dot in the data array -->
                    {#each data as d, i}
                        {#if showLabel(d, i)}
                            <text class="point-label"
                                x={xScale(d.x) + (d.labelDx ?? 8)} y={yScale(d.y) + (d.labelDy ?? 0)}
                                text-anchor={d.labelAnchor ?? 'start'} dominant-baseline="middle"
                            >{d.label}</text>
                        {/if}
                    {/each}

                    <!-- Axis labels -->
                    <text class="chart-axis-title" x={innerW / 2} y={innerH + 34} text-anchor="middle">{xLabel}</text>
                    {#if yLabel}
                        <text class="chart-axis-title" text-anchor="middle"
                            transform="translate({-MARGIN.left + 8},{innerH / 2}) rotate(-90)"
                        >{yLabel}</text>
                    {/if}

                </g>
            </svg>
        {/if}
    </div>

    <!-- Correlation caption commented out for now — re-enable by uncommenting this line.
    <p class="corr-note">{fmtR(rValue)} — {rSignificant ? 'statistically significant' : 'not statistically significant'}</p>
    -->
</div>

<style>
    .scatter-outer {
        width: 100%;
    }

    .scatter-wrap {
        width: 100%;
    }

    .grid-line {
        stroke: var(--brandGray);
        stroke-width: 0.5;
    }

    .zero-line {
        stroke: var(--brandGray70);
        stroke-width: 1;
    }

    .trend-line {
        stroke: var(--brandGray80);
        stroke-width: 1.5;
        stroke-dasharray: 5 3;
    }

    .point-label {
        font-family: OpenSans;
        font-size: 11px;
        font-weight: 600;
        fill: var(--brandGray90);
        pointer-events: none;
    }

    .hoverable {
        cursor: pointer;
    }

    .corr-note {
        font-family: OpenSans;
        font-size: 12px;
        color: var(--brandGray70);
        margin: 0 0 2px;
        text-align: center;
    }
</style>
