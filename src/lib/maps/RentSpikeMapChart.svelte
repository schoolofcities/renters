<script>
    import { scaleLinear } from 'd3';
    import ButtonGroup from '$lib/chart-addons/ButtonGroup.svelte';
    import OntarioSpikeMap from '$lib/maps/OntarioSpikeMap.svelte';
    import LegendGradientContinuous from '$lib/chart-addons/LegendGradientContinuous.svelte';
    import { MODE_OPTIONS, SPIKE_PERIOD_OPTIONS, COLORS } from '$lib/constants.js';

    let { rawPctData = [], excessPctData = [] } = $props();

    let period = $state('2018_2025');
    let mode   = $state('raw');

    // Observed data max is ~76.6%.
    const COLOR_MAX = 60; // %

    // Color scale: COLORS[0] at 0%, COLORS[4] at COLOR_MAX%. Negatives clamp to COLORS[0].
    const colorScale = scaleLinear()
        .domain(COLORS.map((_, i) => (i / (COLORS.length - 1)) * COLOR_MAX))
        .range(COLORS)
        .clamp(true);

    // Slice the active dataset down to { city, value } for the selected period
    let mapData = $derived.by(() => {
        const src = mode === 'raw' ? rawPctData : excessPctData;
        return src
            .map(d => ({ city: d.city, value: d[period] }))
            .filter(d => d.value !== null && d.value !== undefined);
    });

    // Tooltip descriptor: shown as small text below the value, e.g. "2018 – 2025 · total increase"
    let descriptor = $derived.by(() => {
        const periodLabel = SPIKE_PERIOD_OPTIONS.find(o => o.value === period)?.label ?? period;
        const modeLabel   = MODE_OPTIONS.find(o => o.value === mode)?.label.toLowerCase() ?? mode;
        return `${periodLabel} · ${modeLabel}`;
    });
</script>

<div class="rent-spike-map">
    <div class="controls">
        <ButtonGroup
            options={SPIKE_PERIOD_OPTIONS}
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
    </div>

    <LegendGradientContinuous
        colors={COLORS}
        min={0}
        max={COLOR_MAX}
        title="Rent increase (%)"
        percent={true}
        nTicks={5}
    />

    <OntarioSpikeMap data={mapData} {colorScale} {descriptor} globalMax={COLOR_MAX} />

    <p class="source-note">
        Source: CMHC Rental Market Survey. Average rent for all bedroom types, October surveys.
        Spike heights are proportional to the percentage increase over the selected period.
        {mapData.length} cities shown.
    </p>
</div>

<style>
    .rent-spike-map {
        width: 100%;
        margin: 1.5rem 0;
    }
    .controls {
        display: block;
        border-top: solid 1px var(--brandGray);
        padding-top: 5px;
    }
    .source-note {
        font-family: OpenSans, sans-serif;
        font-size: 12px;
        color: var(--brandGray70);
        margin-top: 0.5rem;
    }
</style>
