<script>
    import ButtonGroup from '$lib/chart-addons/ButtonGroup.svelte';
    import DualBarChart from './DualBarChart.svelte';
    import LegendGraduatedBreakpoints from '$lib/chart-addons/LegendGraduatedBreakpoints.svelte';
    import {
        RANK_OPTIONS,
        COLORS,
        PCT_BREAKPOINTS,
        BAR_LEGEND_TITLES,
    } from '$lib/constants.js';

    /**
     * @prop {Array} data - vis2_city_rent_vs_guideline JSON (2018–2025 only, all cities)
     */
    let { data = [] } = $props();

    // Data only covers the single 2018–2025 period, so there's no period selector.
    // % mode is likewise fixed to the total/raw increase for now. To bring back the toggle
    // between total and excess-above-guideline: make pctMode a $state, re-add a ButtonGroup
    // (bind:selectedValue={pctMode}, import + options={MODE_OPTIONS} from constants.js), and
    // pctMode already flows straight through to configKey and the pct field below.
    let pctMode = 'raw';
    let rank    = $state('value');

    // The separate dual-bar legend was replaced with in-chart annotation (see DualBarChart):
    // one example city's full bar is outlined + labeled "Total rent increase", and one example
    // city's excess bar is outlined + labeled "Excess above rent control". Bound to specific
    // cities (not rank), so the callouts stay put regardless of how `rank` re-sorts the list.
    const ANNOTATE_TOTAL_CITY  = 'kitchener';    // mid-table bar, plenty of blank space to its right
    const ANNOTATE_EXCESS_CITY = 'guelph'; // largest excess bar, clearly demonstrates the concept

    let configKey = `${pctMode}_2018_2025`;

    let chartData = $derived.by(() => {
        return data
            .map(d => ({
                label:          d.city,
                primaryValue:   d.actual_rent_increase,
                secondaryValue: d.actual_rent_increase - d.guideline_rent_increase, // excess $ above guideline
                pct:            pctMode === 'raw' ? d.actual_pct_increase : d.excess_pct_increase,
            }))
            .filter(d => d.primaryValue !== null && d.primaryValue !== undefined)
            .sort((a, b) => {
                if (rank === 'pct')    return (b.pct ?? 0) - (a.pct ?? 0);
                if (rank === 'excess') return (b.secondaryValue ?? 0) - (a.secondaryValue ?? 0);
                return b.primaryValue - a.primaryValue; // 'value' — rank by total
            });
    });
</script>

<div class="rent-chart">
    <div class="controls">
        <!-- Period selector removed: this dataset only covers 2018–2025. -->
        <!-- <ButtonGroup options={PERIOD_OPTIONS} bind:selectedValue={period} onSelect={(v) => (period = v)} label="Time period:" /> -->
       
        <!-- "Show % as" toggle disabled for now — pctMode is fixed to 'raw' above. -->
        <!-- <ButtonGroup options={MODE_OPTIONS} bind:selectedValue={pctMode} onSelect={(v) => (pctMode = v)} label="Show % as:" /> -->
       
        <ButtonGroup
            options={RANK_OPTIONS}
            bind:selectedValue={rank}
            onSelect={(v) => (rank = v)}
            label="Rank cities by:"
        />
    </div>

    <LegendGraduatedBreakpoints
        colors={COLORS}
        breakpoints={PCT_BREAKPOINTS[configKey]}
        title={BAR_LEGEND_TITLES[configKey]}
        percent={true}
    />

    <DualBarChart
        data={chartData}
        colors={COLORS}
        breakpoints={PCT_BREAKPOINTS[configKey]}
        maxValue={1000}
        unit="$"
        annotateTotalCity={ANNOTATE_TOTAL_CITY}
        annotateExcessCity={ANNOTATE_EXCESS_CITY}
    />

    <p class="source-note">
        Source: CMHC Rental Market Survey, Ontario Ministry of Municipal Affairs and Housing. Average rent
        for all bedroom types, October surveys, 2018–2025. {chartData.length} cities shown. Nominal values
        do not account for inflation.
    </p>
</div>

<style>
    .rent-chart {
        width: 100%;
        margin: 1.5rem 0;
    }

    .controls {
        display: block;
        border-top: solid 1px var(--brandGray);
        padding-top: 5px;
    }

    .source-note {
        font-size: 12px;
        font-family: OpenSans;
        color: var(--brandGray70);
        margin-top: 0.75rem;
        line-height: 1.5;
    }
</style>
