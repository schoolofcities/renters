<script>
    import ScatterPlot from './ScatterPlot.svelte';

    /**
     * VIS 3 — two scatter plots (annual rental-supply growth vs. annual rent growth), side by
     * side on desktop and stacked on mobile. Both share the same year → dot color mapping and a
     * mini legend explaining it; only 3A carries the y-axis label since 3B repeats it.
     *
     * @prop {Array} vis3aRaw - vis3a_supply_vs_rent_yoy JSON: { year, pct_units, pct_rent }
     * @prop {Array} vis3bRaw - vis3b_demand_adjusted_supply_vs_rent JSON: { year, delta_units_per_1k, pct_rent }
     */
    let { vis3aRaw = [], vis3bRaw = [] } = $props();

    // 2018 and 2025 (the endpoints of the post-deregulation window) get a permanent label,
    // hand-positioned per the design brief; every other year's label only appears on hover.
    function labelFor3a(year) {
        if (year === 2025) return { label: '2025', labelMode: 'always', labelDx: 6, labelDy: -9, labelAnchor: 'start' };
        if (year === 2018) return { label: '2018', labelMode: 'always', labelDx: -8, labelDy: 0, labelAnchor: 'end' };
        return { label: String(year), labelMode: 'hover' };
    }
    function labelFor3b(year) {
        if (year === 2025) return { label: '2025', labelMode: 'always', labelDx: 8, labelDy: 0, labelAnchor: 'start' };
        if (year === 2018) return { label: '2018', labelMode: 'always', labelDx: -8, labelDy: 0, labelAnchor: 'end' };
        return { label: String(year), labelMode: 'hover' };
    }

    let vis3aData = $derived(vis3aRaw.map(d => ({
        x: d.pct_units, y: d.pct_rent, highlight: d.year >= 2018, ...labelFor3a(d.year),
    })));
    let vis3bData = $derived(vis3bRaw.map(d => ({
        x: d.delta_units_per_1k, y: d.pct_rent, highlight: d.year >= 2018, ...labelFor3b(d.year),
    })));
</script>

<div class="vis3">
    <div class="mini-legend">
        <span class="legend-item">
            <span class="dot" style="background:#6FC7EA"></span>
            Each year from 1990–2017 is represented by a lighter dot
        </span>
        <span class="legend-item">
            <span class="dot" style="background:#007FA3"></span>
            and 2018–2025 by a darker dot
        </span>
    </div>

    <div class="scatter-row">
        <ScatterPlot
            data={vis3aData}
            xTicks={[-1, 0, 1, 2, 3]}
            yTicks={[0, 2, 4, 6, 8]}
            xLabel="Annual % change in primary rental units"
            yLabel="Annual % change in average rent"
            rValue={0.135}
            rSignificant={false}
        />
        <ScatterPlot
            data={vis3bData}
            xTicks={[-1.5, -1, -0.5, 0, 0.5]}
            yTicks={[0, 2, 4, 6, 8]}
            xLabel="Annual change in rental units per 1,000 residents"
            yLabel=""
            xTickFormat={(v) => v.toFixed(1)}
            rValue={-0.106}
            rSignificant={false}
        />
    </div>

    <p class="chart-source-note">
        Source: CMHC Rental Market Survey, Statistics Canada (Census of Population).
    </p>
</div>

<style>
    .vis3 {
        width: 100%;
        margin: 1.5rem 0;
    }

    .mini-legend {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 6px 24px;
        margin-bottom: 10px;
        font-family: OpenSans;
        font-size: 13px;
        color: var(--brandGray90);
        text-align: center;
    }

    .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1px solid white;
        outline: 1px solid var(--brandGray);
        flex-shrink: 0;
    }

    .scatter-row {
        display: flex;
        flex-direction: row;
        gap: 20px;
    }

    .scatter-row > :global(.scatter-outer) {
        flex: 1 1 0;
        min-width: 0;
    }

    @media (max-width: 700px) {
        .scatter-row {
            flex-direction: column;
        }
    }

    @media (max-width: 500px) {
        .mini-legend {
            font-size: 12px;
        }
    }
</style>
