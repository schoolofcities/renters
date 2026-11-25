<script>
    import SegmentedToggle from '$lib/chart-addons/SegmentedToggle.svelte';
    import ChartHeader from '$lib/chart-addons/ChartHeader.svelte';
    import CanadaGlyphMap from '$lib/maps/CanadaGlyphMap.svelte';

    /**
     * @prop {Object} data - vis1_net_change_map JSON ({ meta, cities, frames })
     */
    let { data } = $props();

    let { meta, cities, frames } = $derived(data);

    // After inflation (starting rents restated in latest-CPI dollars) is the default view; before inflation = rents as advertised
    const MEASURES = [
        { label: 'After inflation', value: 'real' },
        { label: 'Before inflation', value: 'nominal' },
    ];
    let measure = $state('real');

    let real = $derived(measure === 'real');

    // Dollar scale shared by every pop-up bar: how much an increase / a decrease needs to fill its side of the line (rounded up to $50), so bar lengths compare across cities
    let deltas    = $derived(cities.flatMap(r => [r.latest_rent - r.base_rent, r.latest_rent - r.real_base_rent]));
    let scaleUp   = $derived(Math.ceil(Math.max(...deltas, 0) / 50) * 50);
    let scaleDown = $derived(Math.ceil(Math.max(...deltas.map(d => -d), 0) / 50) * 50);
    let legendBase  = $derived(`Net change in ${meta.bedroom} asking rent, ${meta.baseline_quarter} to ${meta.latest_quarter}`);
    let legendTitle = $derived(`${legendBase}${real ? ', after inflation' : ', before inflation'}`);
    // legend caption, split over two lines after inflation
    let keyTitle = $derived(real ? ['Net change in asking rent,', 'adjusted for inflation, %'] : ['Net change in asking rent, %']);
</script>

<div class="net-change-map">
    <ChartHeader title={legendTitle} titleLongest="{legendBase}, after inflation" hint="Hover or tap an arrow for details.">
        {#snippet controls()}
            <SegmentedToggle options={MEASURES} bind:value={measure} label="Show net change as" />
        {/snippet}
    </ChartHeader>

    <CanadaGlyphMap
        {frames}
        {cities}
        {measure}
        tiltDeg={meta.arrow_tilt_deg}
        classBreaksNominal={meta.class_breaks}
        classBreaksReal={meta.class_breaks_real}
        {keyTitle}
        baseQuarter={meta.baseline_quarter}
        latestQuarter={meta.latest_quarter}
        realYear={meta.real_dollar_year}
        {scaleUp}
        {scaleDown}
    />

    <p class="chart-source-note">
        Source: Statistics Canada, Table 46-10-0092-01 and consumer price indexes. Arrows show each city's net change in {meta.bedroom} asking rent, {meta.baseline_quarter} to {meta.latest_quarter}, in {meta.real_dollar_year} dollars after inflation;
        longer, darker arrows mean a larger increase, blue a decline. Insets enlarge crowded areas.
    </p>
</div>

<style>
    .net-change-map {
        width: 100%;
        margin: 1.5rem 0;
    }
</style>
