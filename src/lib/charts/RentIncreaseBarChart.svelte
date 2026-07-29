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

    let pctMode = 'raw';
    let rank    = $state('value');

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

    <p class="chart-source-note">
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
    }
</style>
