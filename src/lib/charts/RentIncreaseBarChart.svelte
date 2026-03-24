<script>
    import ButtonGroup from '$lib/chart-addons/ButtonGroup.svelte';
    import HorizontalBarChart from './HorizontalBarChart.svelte';
    import {
        PERIOD_OPTIONS,
        MODE_OPTIONS,
        RANK_OPTIONS,
        COLORS,
        PCT_BREAKPOINTS,
        MAX_VALUES,
        LEGEND_TITLES,
    } from '$lib/constants.js';

    /**
     * @prop {Array} rawData    - total_increase_raw JSON (all cities, may have nulls)
     * @prop {Array} excessData - total_increase_excess JSON (all cities, may have nulls)
     */
    let { rawData = [], excessData = [], rawPctData = [], excessPctData = [] } = $props();

    let period = $state('2018_2025');
    let mode   = $state('raw');
    let rank   = $state('value');

    let configKey = $derived(`${mode}_${period}`);

    let chartData = $derived.by(() => {
        const totalSrc = mode === 'raw' ? rawData : excessData;
        const pctSrc   = mode === 'raw' ? rawPctData : excessPctData;
        const pctMap   = Object.fromEntries(pctSrc.map(d => [d.city, d[period]]));
        return totalSrc
            .map(d => ({ label: d.city, value: d[period], pct: pctMap[d.city] ?? null }))
            .filter(d => d.value !== null && d.value !== undefined)
            .sort((a, b) => rank === 'pct' ? (b.pct ?? 0) - (a.pct ?? 0) : b.value - a.value);
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
            bind:selectedValue={mode}
            onSelect={(v) => (mode = v)}
            label="Measure:"
        />
        <ButtonGroup
            options={RANK_OPTIONS}
            bind:selectedValue={rank}
            onSelect={(v) => (rank = v)}
            label="Rank cities by:"
        />
    </div>

    <HorizontalBarChart
        data={chartData}
        colors={COLORS}
        breakpoints={PCT_BREAKPOINTS[configKey]}
        maxValue={MAX_VALUES[configKey]}
        unit="$"
        legendTitle={LEGEND_TITLES[configKey]}
        legendPercent={true}
    />

    <p class="source-note">
        Source: CMHC Rental Market Survey. Average rent for all bedroom types, October surveys.
        Cities with incomplete data for the selected period are excluded.
        {chartData.length} of {rawData.length} cities shown.
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
