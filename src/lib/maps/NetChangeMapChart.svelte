<script>
    import CanadaGlyphMap from '$lib/maps/CanadaGlyphMap.svelte';

    /**
     * @prop {Object} data - vis1_net_change_map JSON ({ meta, cities, frames })
     */
    let { data } = $props();

    let { meta, cities, frames } = $derived(data);

    let legendTitle = $derived(`Net change in ${meta.bedroom} asking rent, ${meta.baseline_quarter} to ${meta.latest_quarter}`);
    let descriptor = $derived(`${meta.baseline_quarter} – ${meta.latest_quarter}`);
</script>

<div class="net-change-map">
    <p class="chart-legend-title legend-title">{legendTitle}</p>

    <CanadaGlyphMap
        {frames}
        {cities}
        tiltDeg={meta.arrow_tilt_deg}
        classBreaks={meta.class_breaks}
        {descriptor}
    />

    <p class="chart-source-note">
        Source: Statistics Canada, Table 46-10-0092-01. Asking rent for newly advertised {meta.bedroom}s,
        {meta.baseline_quarter} vs. {meta.latest_quarter}. Each arrow shows the net percentage change in asking rent over that period;
        longer, thicker and darker arrows mean a larger increase (under 25%, 25–50%, 50–75%, 75% or more). Arrows lean {Math.abs(meta.arrow_tilt_deg)}° only so they overlap less, and direction carries no information.
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
    p.legend-title {
        border-top: solid 1px var(--brandGray);
        padding-top: 8px;
        margin-top: 0;
        margin-bottom: 4px;
        line-height: 22px;
    }
</style>
