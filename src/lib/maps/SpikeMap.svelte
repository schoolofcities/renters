<script>
    import { geoIdentity, geoPath, scaleLinear } from 'd3';

    let {
        data = [],          // [{ city, value }] — city must already match centroid CSDNAME (lowercase)
        outline,            // GeoJSON FeatureCollection — background region polygons
        centroids,          // GeoJSON FeatureCollection — point features with CSDNAME property
        csdFeatures = [],   // pre-filtered CSD polygon features to highlight (pass from parent)
        colorScale = null,
        spikeHeadroom = 80, // px above map reserved for spikes
        spikeWidth = 3,     // px half-width of spike base
        globalMax = null,   // override local max so north/south spikes share one scale
        fitTarget = null,   // GeoJSON to fit projection to; defaults to outline
    } = $props();

    // centroid lookup: lowercase CSDNAME → EPSG:3857 [x, y]
    const centroidLookup = Object.fromEntries(
        (centroids?.features ?? []).map(f => [
            f.properties.CSDNAME.trim().toLowerCase(),
            f.geometry.coordinates,
        ])
    );

    // Gap in px between the tallest possible spike tip and the top edge of the SVG
    const SPIKE_TIP_GAP = 8;

    // Compute width/height aspect ratio from the bounding box of a GeoJSON object
    function bboxAspect(src) {
        if (!src) return 1.5;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const f of src.features ?? [src]) {
            const pts = f.geometry.type === 'Polygon'
                ? f.geometry.coordinates.flat(1)
                : f.geometry.coordinates.flat(2);
            for (const [x, y] of pts) {
                if (x < minX) minX = x;  if (x > maxX) maxX = x;
                if (y < minY) minY = y;  if (y > maxY) maxY = y;
            }
        }
        return (maxX - minX) / (maxY - minY);
    }

    let containerWidth = $state(null);
    let aspect = $derived(bboxAspect(fitTarget ?? outline));
    let width  = $derived(containerWidth ?? 700);
    let mapH   = $derived((width - 20) / aspect);
    let height = $derived(mapH + spikeHeadroom);

    let projection = $derived.by(() => {
        if (!outline || width <= 0) return geoIdentity().reflectY(true);
        return geoIdentity().reflectY(true).fitExtent(
            [[10, spikeHeadroom], [width - 10, height - 5]],
            fitTarget ?? outline
        );
    });
    let pathGen = $derived(geoPath(projection));

    // Spike height scale: 0 → 0px, maxVal → (spikeHeadroom - SPIKE_TIP_GAP)px
    let maxVal     = $derived(globalMax ?? Math.max(...data.map(d => d.value ?? 0), 1));
    let spikeScale = $derived(scaleLinear().domain([0, maxVal]).range([0, spikeHeadroom - SPIKE_TIP_GAP]));

    let spikes = $derived.by(() => {
        const result = [];
        for (const d of data) {
            const coords = centroidLookup[d.city.toLowerCase()];
            if (!coords) continue;
            const pt = projection(coords);
            if (!pt) continue;
            result.push({ ...d, x: pt[0], y: pt[1], spikeH: spikeScale(d.value ?? 0) });
        }
        return result;
    });
</script>

<div class="spike-map" bind:offsetWidth={containerWidth}>
    {#if outline && width > 0}
        <svg {width} {height}>
            {#each outline.features as f}
                <path d={pathGen(f)} fill="#e2e2e2" stroke="white" stroke-width="0.5" />
            {/each}
            {#each csdFeatures as f}
                <path d={pathGen(f)} fill="#d2d2d2" stroke="white" stroke-width="0.5" />
            {/each}
            {#each spikes as { x, y, spikeH, value }}
                <polygon
                    points="{x - spikeWidth},{y} {x + spikeWidth},{y} {x},{y - spikeH}"
                    fill={colorScale ? colorScale(value ?? 0) : '#d73256'}
                    opacity="0.85"
                />
            {/each}
        </svg>
    {/if}
</div>

<style>
    .spike-map { width: 100%; min-width: 250px; }
    svg { display: block; }
</style>
