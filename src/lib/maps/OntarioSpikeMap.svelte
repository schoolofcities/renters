<script>
    import SpikeMap from '$lib/maps/SpikeMap.svelte';

    import southOutline   from '$data/rental-increases/ontario_south_pr.geo.json';
    import southCentroids from '$data/rental-increases/ontario_south_csd_centroids.geo.json';
    import southCsds      from '$data/rental-increases/ontario_south_csd.geo.json';
    import northOutline   from '$data/rental-increases/ontario_north_pr.geo.json';
    import northCentroids from '$data/rental-increases/ontario_north_csd_centroids.geo.json';
    import northCsds      from '$data/rental-increases/ontario_north_csd.geo.json';

    let { data = [], colorScale = null, descriptor = '' } = $props();

    // ── Ontario-specific corrections ──────────────────────────────────────────

    // Our city names vs. StatsCan CSDNAME spellings in the GeoJSON files
    const NAME_CORRECTIONS = {
        'st. catherines':  'st. catharines',
        'greater sudbury': 'greater sudbury / grand sudbury',
    };

    // Some city names match multiple CSDs (e.g. Hamilton city vs. Hamilton township).
    // Pin the right feature by CSDUID to avoid rendering duplicate highlights.
    const CSD_OVERRIDES = {
        'hamilton':                        '3525005',
        'greater sudbury / grand sudbury': '3553005',
    };

    // These 3 cities are in the north GeoJSON — all others go to the south map
    const NORTH_CITIES = new Set(['greater sudbury', 'sault ste. marie', 'thunder bay']);

    // Fixed view for the north inset, derived from actual city centroids + padding (EPSG:3857):
    //   Greater Sudbury:  [-9021702, 5875602]
    //   Sault Ste. Marie: [-9392664, 5868984]
    //   Thunder Bay:      [-9941903, 6178242]
    const NORTH_FIT = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-10200000, 5720000], [-8750000, 5720000],
                [-8750000,  6430000], [-10200000, 6430000],
                [-10200000, 5720000],
            ]],
        },
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    function correctName(city) {
        return NAME_CORRECTIONS[city.toLowerCase()] ?? city.toLowerCase();
    }

    // Filter CSD features to only cities present in the data, applying CSD_OVERRIDES
    // for any names that map to multiple features (e.g. Hamilton, Greater Sudbury)
    function filterCsdFeatures(csdGeoJson, dataItems) {
        const citySet = new Set(dataItems.map(d => d.city));
        return csdGeoJson.features.filter(f => {
            const name = f.properties.CSDNAME.trim().toLowerCase();
            if (!citySet.has(name)) return false;
            const override = CSD_OVERRIDES[name];
            return override ? f.properties.CSDUID === override : true;
        });
    }

    // ── Derived state ─────────────────────────────────────────────────────────

    // Split into north/south, applying name corrections so cities match GeoJSON CSDNAME
    let southData = $derived(
        data
            .filter(d => !NORTH_CITIES.has(d.city.toLowerCase()))
            .map(d => ({ ...d, city: correctName(d.city) }))
    );
    let northData = $derived(
        data
            .filter(d => NORTH_CITIES.has(d.city.toLowerCase()))
            .map(d => ({ ...d, city: correctName(d.city) }))
    );

    // Shared spike scale — same % value = same spike height in both maps
    let globalMax = $derived(Math.max(...data.map(d => d.value ?? 0), 1));

    // Pre-filter CSD outlines to only the cities present in the active dataset
    let southCsdFeatures = $derived(filterCsdFeatures(southCsds, southData));
    let northCsdFeatures = $derived(filterCsdFeatures(northCsds, northData));
</script>

<div class="ontario-map">
    <!-- Main southern Ontario map -->
    <SpikeMap
        data={southData}
        outline={southOutline}
        centroids={southCentroids}
        csdFeatures={southCsdFeatures}
        {colorScale}
        {globalMax}
        {descriptor}
    />

    <!-- Northern Ontario inset: Greater Sudbury, Sault Ste. Marie, Thunder Bay -->
    <div class="north-inset">
        <SpikeMap
            data={northData}
            outline={northOutline}
            centroids={northCentroids}
            csdFeatures={northCsdFeatures}
            {colorScale}
            {globalMax}
            {descriptor}
            spikeHeadroom={80}
            spikeWidth={3}
            fitTarget={NORTH_FIT}
        />
    </div>
</div>

<style>
    .ontario-map { position: relative; }
    .north-inset {
        position: absolute;
        top: 80px;       /* aligns with map land area — matches south spikeHeadroom */
        left: 0;
        width: 32%;
        max-width: 220px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 2px;
        overflow: hidden;
    }
    /* On mobile, stack the north inset below the south map instead of overlaying */
    @media (max-width: 600px) {
        .ontario-map { display: flex; flex-direction: column; }
        .north-inset { position: static; width: 65%; max-width: none; margin: 6px auto 0; }
    }
</style>
