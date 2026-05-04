<script>
    import { scaleLinear } from 'd3-scale';
    import { line as d3line } from 'd3-shape';
    import rentPathData from '$data/rental-increases/rent_path.json';

    // ─── colours ───────────────────────────────────────────────────────────────
    const C_ACTUAL    = '#d73256';
    const C_GUIDELINE = '#808080';
    const C_UNITS     = '#1a5fa8';

    // ─── policy event annotations ──────────────────────────────────────────────
    // row 0 = standard height; row 1 = elevated (used for 2017, neighbour of 2018)
    const EVENTS = [
        { year: 1992, label: 'AGIs introduced; new unit exemption (5 yrs)',  row: 0 },
        { year: 1998, label: 'Vacancy decontrol; post-1992 unit exemption',  row: 0 },
        { year: 2006, label: 'Guideline pegged to inflation (CPI)',           row: 0 },
        { year: 2017, label: 'Date-based exemption ends',                     row: 1 },
        { year: 2018, label: 'Post-2018 units deregulated',                   row: 0 },
    ];

    // ─── layout ────────────────────────────────────────────────────────────────
    const MARGIN   = { top: 52, right: 16, bottom: 36, left: 52 };
    const CHART_H  = 320;
    const Y_DOMAIN = [450, 1650];
    const Y_TICKS  = [500, 750, 1000, 1250, 1500];
    const X_TICKS  = [1990, 2000, 2010, 2020, 2025];

    const MR    = 7;          // marker circle radius
    const M_Y   = [-14, -32]; // marker centre-y (px) for row 0 and row 1

    // ─── units axis config ─────────────────────────────────────────────────────
    // Each units tick is paired with the rent tick it must align with.
    // 650K ↔ $500, 675K ↔ $750, 700K ↔ $1000, 725K ↔ $1250, 750K ↔ $1500
    const TICK_PAIRS = [
        { rent: 500,  units: 650_000 },
        { rent: 750,  units: 675_000 },
        { rent: 1000, units: 700_000 },
        { rent: 1250, units: 725_000 },
        { rent: 1500, units: 750_000 },
    ];
    // Translate num_units into the rent coordinate space so yScale handles both.
    // 650K → 500, 750K → 1500  (linear: every 25K = 250 rent)
    function unitsToRent(u) { return 500 + (u - 650_000) / 25_000 * 250; }

    const MARGIN_RIGHT = 60; // extra right margin for units axis labels

    // ─── reactive state ────────────────────────────────────────────────────────
    let containerW = $state(0);
    let innerW     = $derived(Math.max(0, containerW - MARGIN.left - MARGIN.right - MARGIN_RIGHT));
    let innerH     = $derived(CHART_H - MARGIN.top - MARGIN.bottom);

    let xScale = $derived(scaleLinear().domain([1990, 2025]).range([0, innerW]));
    let yScale = $derived(scaleLinear().domain(Y_DOMAIN).range([innerH, 0]));

    // Capture scale references explicitly so Svelte 5 tracks the reactive reads.
    let pathActual = $derived.by(() => {
        const xs = xScale, ys = yScale;
        return d3line().x(d => xs(d.year)).y(d => ys(d.actual))(rentPathData);
    });
    let pathGuideline = $derived.by(() => {
        const xs = xScale, ys = yScale;
        return d3line().x(d => xs(d.year)).y(d => ys(d.guideline))(rentPathData);
    });
    let pathUnits = $derived.by(() => {
        const xs = xScale, ys = yScale;
        return d3line().x(d => xs(d.year)).y(d => ys(unitsToRent(d.num_units)))(rentPathData);
    });

    function fmtY(v) {
        if (v < 1000) return `$${v}`;
        const k = v / 1000;
        const s = k % 1 === 0 ? `${k}` : `${k.toFixed(2).replace(/\.?0+$/, '')}`;
        return `$${s}K`;
    }

    function fmtUnits(v) {
        return `${(v / 1000).toFixed(0)}K`;
    }
</script>

<div class="chart-outer">

    <!-- ── Line legend ─────────────────────────────────────────────────────── -->
    <div class="line-legend">
        <span class="legend-item">
            <span class="swatch solid" style="background:{C_ACTUAL}"></span>
            Actual rent path
        </span>
        <span class="legend-item">
            <span class="swatch dashed"></span>
            Guideline rent path (if rent control had been followed)
        </span>
        <span class="legend-item">
            <span class="swatch units-swatch"></span>
            Number of rental units
        </span>
    </div>

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
                    <text x={-7} y={yScale(tick)} class="y-label"
                        text-anchor="end" dominant-baseline="middle"
                    >{fmtY(tick)}</text>
                {/each}

                <!-- X baseline + year labels -->
                <line x1={0} y1={innerH} x2={innerW} y2={innerH} class="grid-line" />
                {#each X_TICKS as tick}
                    <text
                        x={xScale(tick)} y={innerH + 22}
                        class="x-label"
                        text-anchor={tick === 2025 ? 'end' : 'middle'}
                    >{tick}</text>
                {/each}

                <!-- Policy event: vertical dashed line + numbered circle marker -->
                {#each EVENTS as ev, i}
                    {@const ex = xScale(ev.year)}
                    {@const my = M_Y[ev.row]}
                    <!-- Line from just below the marker circle down to x-axis -->
                    <line
                        x1={ex} y1={my + MR + 2}
                        x2={ex} y2={innerH}
                        class="event-line"
                    />
                    <!-- Numbered circle badge -->
                    <circle cx={ex} cy={my} r={MR} class="event-marker" />
                    <text
                        x={ex} y={my + 1}
                        class="marker-num"
                        text-anchor="middle" dominant-baseline="middle"
                    >{i + 1}</text>
                {/each}

                <!-- Number of units path (right axis) — drawn first, sits behind rent lines -->
                <path
                    d={pathUnits}
                    fill="none"
                    stroke={C_UNITS}
                    stroke-width="2.5"
                />

                <!-- Guideline path (drawn second — sits behind actual) -->
                <path
                    d={pathGuideline}
                    fill="none"
                    stroke={C_GUIDELINE}
                    stroke-width="2.5"
                    stroke-dasharray="5,3"
                />

                <!-- Actual rent path (on top) -->
                <path
                    d={pathActual}
                    fill="none"
                    stroke={C_ACTUAL}
                    stroke-width="2.5"
                />

                <!-- Right Y axis: units ticks + labels (aligned to left ticks) -->
                {#each TICK_PAIRS as pair}
                    <text
                        x={innerW + 10} y={yScale(pair.rent)}
                        class="y-label y-label-right"
                        text-anchor="start" dominant-baseline="middle"
                    >{fmtUnits(pair.units)}</text>
                {/each}
                <!-- Right axis label -->
                <text
                    class="axis-label"
                    text-anchor="middle"
                    transform="translate({innerW + MARGIN_RIGHT - 8},{innerH / 2}) rotate(90)"
                >Rental units</text>

            </g>
        </svg>
        {/if}
    </div>

    <!-- ── Numbered event key ──────────────────────────────────────────────── -->
    <div class="event-grid">
        {#each EVENTS as ev, i}
            <div class="event-row">
                <span class="badge">{i + 1}</span>
                <span class="ev-desc"><strong>{ev.year}</strong> - {ev.label}</span>
            </div>
        {/each}
    </div>

    <p class="src">
        Both rent paths start from a hypothetical $500/month rent in 1990. These are the most significant
        policy changes; for a full history see the
        <a href="https://policyalternatives.ca/sites/default/files/uploads/publications/Ontario%20Office/2024/04/rent-control-in-ontario.pdf"
           target="_blank" rel="noopener">CCPA Ontario Office (2024)</a>.
    </p>

</div>

<style>
    .chart-outer {
        width: 100%;
        margin: 1.5rem 0;
    }

    /* ── Line legend ─────────────────────────────────────────────────────── */
    .line-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 20px;
        margin-bottom: 4px;
        padding-top: 5px;
        border-top: 1px solid var(--brandGray);
        font-family: OpenSans;
        font-size: 14px;
        color: var(--brandGray90);
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* Solid swatch: color applied inline via style attribute */
    .swatch {
        display: inline-block;
        width: 36px;
        height: 3px;
        flex-shrink: 0;
        border-radius: 1px;
    }

    /* Dashed swatch for guideline line */
    .swatch.dashed {
        background: none;
        border-top: 2.5px dashed #808080;
        height: 0;
    }

    /* Solid swatch for units line */
    .swatch.units-swatch {
        background: #1a5fa8;
        height: 3px;
    }

    /* ── SVG helpers ─────────────────────────────────────────────────────── */
    .chart-wrap {
        width: 100%;
    }

    .grid-line {
        stroke: var(--brandGray);
        stroke-width: 0.5;
    }

    .y-label {
        font-family: OpenSans;
        font-size: 12px;
        fill: var(--brandGray70);
    }

    .y-label-right {
        fill: #1a5fa8;
    }

    .axis-label {
        font-family: OpenSans;
        font-size: 11px;
        fill: #1a5fa8;
    }

    .x-label {
        font-family: OpenSans;
        font-size: 12px;
        fill: var(--brandGray70);
    }

    .event-line {
        stroke: var(--brandGray70);
        stroke-width: 1;
        stroke-dasharray: 3,3;
        opacity: 0.6;
    }

    .event-marker {
        fill: var(--brandGray70);
    }

    .marker-num {
        font-family: OpenSans;
        font-size: 9px;
        font-weight: bold;
        fill: white;
        pointer-events: none;
    }

    /* ── Numbered event key ──────────────────────────────────────────────── */
    .event-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 20px;
        margin-top: 10px;
    }

    .event-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-family: OpenSans;
        font-size: 13px;
        color: var(--brandGray70);
        line-height: 1.4;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--brandGray70);
        color: white;
        font-size: 10px;
        font-weight: bold;
        font-family: OpenSans;
        flex-shrink: 0;
        margin-top: 1px;
    }

    .ev-desc strong {
        color: var(--brandGray90);
    }

    /* ── Source note ─────────────────────────────────────────────────────── */
    .src {
        font-family: OpenSans;
        font-size: 12px;
        color: var(--brandGray70);
        margin-top: 10px;
        line-height: 1.5;
    }

    .src a {
        color: inherit;
        text-decoration: underline;
    }

    /* ── Responsive ──────────────────────────────────────────────────────── */
    @media (max-width: 600px) {
        .event-grid      { grid-template-columns: 1fr; }
        .line-legend     { font-size: 13px; }
        .event-row       { font-size: 12px; }
    }

    @media (max-width: 400px) {
        .event-row       { font-size: 11px; }
        .line-legend     { font-size: 12px; }
    }
</style>
