<script>
    import ButtonGroup from '$lib/chart-addons/ButtonGroup.svelte';
    import DualBarChart from './DualBarChart.svelte';
    import LegendGraduatedBreakpoints from '$lib/chart-addons/LegendGraduatedBreakpoints.svelte';
    import LegendDualBar from '$lib/chart-addons/LegendDualBar.svelte';
    import {
        PERIOD_OPTIONS,
        MODE_OPTIONS,
        RANK_OPTIONS,
        COLORS,
        PCT_BREAKPOINTS,
        MAX_VALUES,
        BAR_LEGEND_TITLES,
    } from '$lib/constants.js';

    /**
     * @prop {Array} rawData      - total_increase_raw JSON   (dollar amounts, all cities)
     * @prop {Array} excessData   - total_increase_excess JSON (dollar amounts, all cities)
     * @prop {Array} rawPctData   - pct_increase_raw JSON      (percentages, all cities)
     * @prop {Array} excessPctData- pct_increase_excess JSON   (percentages, all cities)
     */
    let { rawData = [], excessData = [], rawPctData = [], excessPctData = [] } = $props();

    let period  = $state('2018_2025');
    let pctMode = $state('raw');   // controls which % is shown in the left classifier box
    let rank    = $state('value');

    // configKey drives pct color breakpoints and legend title for whichever % is selected.
    // maxKey always uses raw totals for the x-axis range, since the primary bar is always total.
    let configKey = $derived(`${pctMode}_${period}`);
    let maxKey    = $derived(`raw_${period}`);

    let chartData = $derived.by(() => {
        const pctSrc    = pctMode === 'raw' ? rawPctData : excessPctData;
        const pctMap    = Object.fromEntries(pctSrc.map(d => [d.city, d[period]]));
        const excessMap = Object.fromEntries(excessData.map(d => [d.city, d]));

        return rawData
            .map(d => ({
                label:          d.city,
                primaryValue:   d[period],                           // total dollar increase
                secondaryValue: excessMap[d.city]?.[period] ?? null, // excess dollar increase
                pct:            pctMap[d.city] ?? null,
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
            options={PERIOD_OPTIONS}
            bind:selectedValue={period}
            onSelect={(v) => (period = v)}
            label="Time period:"
        />
        <ButtonGroup
            options={MODE_OPTIONS}
            bind:selectedValue={pctMode}
            onSelect={(v) => (pctMode = v)}
            label="Show % as:"
        />
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

    <LegendDualBar
        primaryLabel="Total rent increase"
        secondaryLabel="Excess above rent control"
    />

    <DualBarChart
        data={chartData}
        colors={COLORS}
        breakpoints={PCT_BREAKPOINTS[configKey]}
        maxValue={MAX_VALUES[maxKey]}
        unit="$"
    />

    <p class="source-note">
        Source: CMHC Rental Market Survey. Average rent for all bedroom types, October surveys.
        Cities with incomplete data for the selected period are excluded.
        {chartData.length} cities shown. Values are nominal and do not account for inflation.
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
