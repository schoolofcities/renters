<script>
    import ButtonGroup from '$lib/chart-addons/ButtonGroup.svelte';
    import CanadaGlyphMap from '$lib/maps/CanadaGlyphMap.svelte';
    import { MAP_STYLE_OPTIONS } from '$lib/constants.js';

    /**
     * @prop {Object} data - vis1_net_change_map JSON ({ meta, cities, frames })
     */
    let { data } = $props();

    let style = $state('spike');

    let { meta, cities, frames } = $derived(data);

    // Every frame shares one length scale so a 50% spike is the same height in each
    let maxValue = $derived(meta.max_pct_change);

    let legendTitle = $derived(`Net change in ${meta.bedroom} asking rent, ${meta.baseline_quarter} to ${meta.latest_quarter}`);
    let descriptor = $derived(`${meta.baseline_quarter} – ${meta.latest_quarter}`);
    let shapeName = $derived(style === 'spike' ? 'spike' : 'arrow');
</script>

<div class="net-change-map">
    <div class="controls">
        <ButtonGroup
            options={MAP_STYLE_OPTIONS}
            bind:selectedValue={style}
            onSelect={(v) => (style = v)}
            label="Map style:"
        />
    </div>

    <p class="chart-legend-title legend-title">{legendTitle}</p>

    <CanadaGlyphMap
        {frames}
        {cities}
        mode={style}
        tiltDeg={meta.arrow_tilt_deg}
        {maxValue}
        {descriptor}
    />

    <p class="chart-source-note">
        Source: Statistics Canada, Table 46-10-0092-01. Asking rent for newly advertised {meta.bedroom}s,
        {meta.baseline_quarter} vs. {meta.latest_quarter}. Each {shapeName}'s {style === 'spike' ? 'height' : 'length'}
        shows the net percentage change in asking rent over that period{style === 'arrow' ? `; arrows lean ${Math.abs(meta.arrow_tilt_deg)}° only so they overlap less, and direction carries no information` : ''}.
        {meta.n_cities} cities shown; {meta.excluded.join(' and ')} lack enough two-bedroom data.
        Insets enlarge Southern BC, Southern Ontario with Ottawa, and Southern Quebec, where cities are too close together to read at national scale;
        the two eastern insets are rotated 30° (north arrow shown), and cities in an inset appear faintly on the national map.
        Ottawa and Gatineau are drawn slightly apart. Nominal values do not account for inflation.
    </p>
</div>

<style>
    .net-change-map {
        width: 100%;
        margin: 1.5rem 0;
    }
    .controls {
        display: block;
        border-top: solid 1px var(--brandGray);
        padding-top: 5px;
    }
    p.legend-title {
        margin-top: 14px;
        margin-bottom: 4px;
        line-height: 22px;
    }
</style>
