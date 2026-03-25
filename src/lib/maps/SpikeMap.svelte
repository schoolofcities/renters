<script>
    import { geoIdentity, geoPath, scaleLinear } from 'd3';
    import MapTooltip from '$lib/maps/MapTooltip.svelte';

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
        descriptor = '',    // shown in tooltip, e.g. "2018 – 2025 · total increase"
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

    // ── Tooltip ───────────────────────────────────────────────────────────────

    let tooltip = $state(null); // { clientX, clientY, city, value } or null

    function showTooltip(e, spike) {
        tooltip = { clientX: e.clientX, clientY: e.clientY, city: spike.city, value: spike.value };
    }

    // Title-case a lowercase city name for display (e.g. "st. catharines" → "St. Catharines")
    function titleCase(str) {
        return str.replace(/\b\w/g, c => c.toUpperCase());
    }

    function formatValue(v) {
        return (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
    }
</script>

<div class="spike-map" bind:offsetWidth={containerWidth} onclick={() => (tooltip = null)} role="presentation">
    {#if outline && width > 0}
        <svg {width} {height}>
            {#each outline.features as f}
                <path d={pathGen(f)} fill="#e2e2e2" stroke="white" stroke-width="0.5" />
            {/each}
            {#each csdFeatures as f}
                <path d={pathGen(f)} fill="#d2d2d2" stroke="white" stroke-width="0.5" />
            {/each}
            {#each spikes as spike}
                {@const { x, y, spikeH, value } = spike}
                <!-- Visible spike -->
                <polygon
                    points="{x - spikeWidth},{y} {x + spikeWidth},{y} {x},{y - spikeH}"
                    fill={colorScale ? colorScale(value ?? 0) : '#d73256'}
                    opacity="0.85"
                />
                <!-- Invisible hit area: wider + minimum height for easy hover/tap -->
                <rect
                    x={x - Math.max(spikeWidth * 3, 8)}
                    y={y - Math.max(spikeH, 16)}
                    width={Math.max(spikeWidth * 3, 8) * 2}
                    height={Math.max(spikeH, 16)}
                    fill="transparent"
                    style="cursor: pointer"
                    role="button"
                    tabindex="0"
                    aria-label="{titleCase(spike.city)}: {formatValue(spike.value)}"
                    onmouseenter={(e) => showTooltip(e, spike)}
                    onmouseleave={() => (tooltip = null)}
                    onclick={(e) => { e.stopPropagation(); showTooltip(e, spike); }}
                    onkeydown={(e) => {
                        if (e.key === 'Enter') {
                            const r = e.currentTarget.getBoundingClientRect();
                            showTooltip({ clientX: r.left + r.width / 2, clientY: r.top }, spike);
                        }
                    }}
                />
            {/each}
        </svg>

        {#if tooltip}
            <MapTooltip
                x={tooltip.clientX}
                y={tooltip.clientY}
                title={titleCase(tooltip.city)}
                value={formatValue(tooltip.value)}
                {descriptor}
                ondismiss={() => (tooltip = null)}
            />
        {/if}
    {/if}
</div>

<style>
    .spike-map { width: 100%; min-width: 250px; position: relative; }
    svg { display: block; }
</style>
