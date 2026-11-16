<script>
    import SmallMultiple from '$lib/charts/SmallMultiple.svelte';
    import SegmentedToggle from '$lib/chart-addons/SegmentedToggle.svelte';
    import ChartHeader from '$lib/chart-addons/ChartHeader.svelte';
    import RentTooltipBody from '$lib/chart-addons/RentTooltipBody.svelte';
    import MapTooltip from '$lib/maps/MapTooltip.svelte';

    /**
     * @prop {Object} data - vis2_city_trajectories JSON ({ meta, canada, featured, others })
     */
    let { data } = $props();

    let { meta, canada, featured, others } = $derived(data);

    // ─── nominal / after inflation ─────────────────────────────────────────────
    const MEASURES = [
        { label: 'Nominal', value: 'nominal' },
        { label: 'After inflation', value: 'real' },
    ];
    let measure = $state('nominal');
    let real = $derived(measure === 'real');

    const valuesOf = (rec) => (real ? rec.values_real : rec.values);
    let yDomain = $derived(real ? meta.y_domain_real : meta.y_domain);
    let yTicks  = $derived(real ? meta.y_ticks_real : meta.y_ticks);
    let referenceValues = $derived(valuesOf(canada));

    // ─── layout ────────────────────────────────────────────────────────────────
    // Featured block, at every width: a 4-column grid in which Canada takes the left half (2 × 2 panels) and the four featured
    // cities fill a 2 × 2 block on the right. On a phone the panels simply shrink (smaller titles, no year labels).
    // Tiny panels: 36 of them — 9 per row on desktop (4 rows), 6 per row below that (6 rows), so a phone doesn't scroll for ages.
    const FEATURED_ROW_GAP = 14;
    const TINY_GAP         = 6;

    let gridW = $state(0);

    let featuredGap = $derived(gridW >= 500 ? 10 : 8);
    let featuredW   = $derived(Math.floor((gridW - featuredGap * 3) / 4));
    let compactFeatured = $derived(featuredW < 110);          // phone-sized panels
    let featuredH   = $derived(Math.round(featuredW * (compactFeatured ? 0.98 : 0.82)));
    let canadaW     = $derived(featuredW * 2 + featuredGap);
    let canadaH     = $derived(featuredH * 2 + (compactFeatured ? featuredGap : FEATURED_ROW_GAP));

    let tinyCols = $derived(gridW >= 620 ? 9 : 6);
    let tinyW    = $derived(Math.floor((gridW - TINY_GAP * (tinyCols - 1)) / tinyCols));
    // the names shrink as the panels narrow (and are squeezed a little further if one still doesn't fit), so none runs into its neighbour
    let tinyLabelSize = $derived(Math.max(8, Math.min(10.5, tinyW * 0.145)));
    let compactTiny   = $derived(tinyW < 62);
    // height includes the strip above the graph for the city's name; phone-sized panels are a little less tall, so six rows stay short
    let tinyH = $derived(compactTiny ? Math.round(Math.round(tinyLabelSize * 1.3) + 3 + tinyW * 0.7) : Math.round(tinyW * 0.84));

    // ─── hover / tap ───────────────────────────────────────────────────────────
    // A panel's pop-up (and, for tiny panels, its y-axis numbers) appears while it is active.
    let active  = $state(null);   // city name
    let tooltip = $state(null);   // { x, y, rec }

    function activate(rec, x, y) {
        active = rec.city;
        tooltip = { x, y, rec };
    }
    function deactivate() {
        active = null;
        tooltip = null;
    }
    function onEnter(rec, e) {
        if (e.pointerType === 'mouse') activate(rec, e.clientX, e.clientY);
    }
    function onLeave(e) {
        if (e.pointerType === 'mouse') deactivate();
    }
    function onTap(rec, e) {
        e.stopPropagation();
        activate(rec, e.clientX, e.clientY);
    }
    function onFocus(rec, e) {
        const r = e.currentTarget.getBoundingClientRect();
        activate(rec, r.left + r.width / 2, r.top);
    }

    const pct = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + '%';
    // year labels printed under each featured panel: the first and last quarters
    let endTicks = $derived([meta.year_ticks[0], { label: meta.quarters[meta.quarters.length - 1].split(' ')[1], i: meta.quarters.length - 1 }]);

    // Dollar scale shared by every pop-up bar: how much an increase / a decrease needs to fill its side of the line (rounded up to $50), so bar lengths compare across cities
    let deltas    = $derived([canada, ...featured, ...others].flatMap(r => [r.latest_rent - r.base_rent, r.latest_rent - r.real_base_rent]));
    let scaleUp   = $derived(Math.ceil(Math.max(...deltas, 0) / 50) * 50);
    let scaleDown = $derived(Math.ceil(Math.max(...deltas.map(d => -d), 0) / 50) * 50);
    const latestOf = (rec) => (real ? rec.real_pct : rec.latest);

</script>

<div class="trajectories">
    <ChartHeader
        title="Net change in {meta.bedroom} asking rent since {meta.baseline_quarter}{real ? ', after inflation' : ''}"
        titleLongest="Net change in {meta.bedroom} asking rent since {meta.baseline_quarter}, after inflation"
        hint="Hover or tap any chart for details."
    >
        {#snippet controls()}
            <SegmentedToggle options={MEASURES} bind:value={measure} label="Show net change as" />
        {/snippet}
        {#snippet legend()}
            <span class="swatches">
                <span class="swatch"><svg width="22" height="8" aria-hidden="true"><line x1="1" x2="21" y1="4" y2="4" stroke="#bf2150" stroke-width="2.2" stroke-linecap="round" /></svg>City</span>
                <span class="swatch"><svg width="22" height="8" aria-hidden="true"><line x1="1" x2="21" y1="4" y2="4" stroke="#c3c3c3" stroke-width="1.6" stroke-linecap="round" /></svg>Canada</span>
            </span>
        {/snippet}
    </ChartHeader>

    <div class="grid-measure" bind:clientWidth={gridW} onclick={deactivate} role="presentation">
        {#if gridW > 0}
            <div class="featured-grid" style="grid-template-columns: repeat(4, {featuredW}px); gap: {compactFeatured ? featuredGap : FEATURED_ROW_GAP}px {featuredGap}px;">
                <!-- Canada: the size of four panels -->
                <div
                    class="cell canada-cell"
                    role="button"
                    tabindex="0"
                    aria-label="{canada.city}: {pct(latestOf(canada))} since {meta.baseline_quarter}"
                    onpointerenter={(e) => onEnter(canada, e)}
                    onpointerleave={onLeave}
                    onclick={(e) => onTap(canada, e)}
                    onfocus={(e) => onFocus(canada, e)}
                    onblur={deactivate}
                    onkeydown={(e) => { if (e.key === 'Escape') deactivate(); }}
                >
                    <SmallMultiple
                        width={canadaW}
                        height={canadaH}
                        values={valuesOf(canada)}
                        reference={null}
                        {yDomain}
                        {yTicks}
                        variant="featured"
                        large
                        title={canada.city}
                        yLabels
                        xTicks={endTicks}
                    />
                </div>

                {#each featured as rec, i (rec.city)}
                    <div
                        class="cell"
                        role="button"
                        tabindex="0"
                        aria-label="{rec.city}: {pct(latestOf(rec))} since {meta.baseline_quarter}"
                        onpointerenter={(e) => onEnter(rec, e)}
                        onpointerleave={onLeave}
                        onclick={(e) => onTap(rec, e)}
                        onfocus={(e) => onFocus(rec, e)}
                        onblur={deactivate}
                        onkeydown={(e) => { if (e.key === 'Escape') deactivate(); }}
                    >
                        <SmallMultiple
                            width={featuredW}
                            height={featuredH}
                            values={valuesOf(rec)}
                            reference={referenceValues}
                            {yDomain}
                            {yTicks}
                            variant="featured"
                            compact={compactFeatured}
                            title={rec.city}
                            yLabels={!compactFeatured && i % 2 === 0}
                            xTicks={compactFeatured ? [] : endTicks}
                        />
                    </div>
                {/each}
            </div>

            <!-- every other city, A–Z -->
            <div class="tiny-grid" class:compact={compactTiny} style="grid-template-columns: repeat({tinyCols}, {tinyW}px); gap: {compactTiny ? 7 : 10}px {TINY_GAP}px;">
                {#each others as rec (rec.city)}
                    <div
                        class="cell tiny-cell"
                        class:active={active === rec.city}
                        role="button"
                        tabindex="0"
                        aria-label="{rec.city}: {pct(latestOf(rec))} since {meta.baseline_quarter}"
                        onpointerenter={(e) => onEnter(rec, e)}
                        onpointerleave={onLeave}
                        onclick={(e) => onTap(rec, e)}
                        onfocus={(e) => onFocus(rec, e)}
                        onblur={deactivate}
                        onkeydown={(e) => { if (e.key === 'Escape') deactivate(); }}
                    >
                        <SmallMultiple
                            width={tinyW}
                            height={tinyH}
                            values={valuesOf(rec)}
                            reference={referenceValues}
                            {yDomain}
                            {yTicks}
                            variant="tiny"
                            title={rec.city}
                            label={rec.short}
                            labelSize={tinyLabelSize}
                            active={active === rec.city}
                        />
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    {#if tooltip}
        {@const rec = tooltip.rec}
        <MapTooltip x={tooltip.x} y={tooltip.y} title={rec.city} width={276} ondismiss={deactivate}>
            <RentTooltipBody
                nominalPct={rec.latest}
                realPct={rec.real_pct}
                baseRent={rec.base_rent}
                latestRent={rec.latest_rent}
                realBaseRent={rec.real_base_rent}
                realYear={meta.real_dollar_year}
                baseQuarter={meta.baseline_quarter}
                latestQuarter={meta.latest_quarter}
                {measure}
                {scaleUp}
                {scaleDown}
                peak={real ? { pct: rec.peak_real, quarter: rec.peak_quarter_real } : { pct: rec.peak, quarter: rec.peak_quarter }}
            />
        </MapTooltip>
    {/if}

    <p class="chart-source-note">
        Source: Statistics Canada, Table 46-10-0092-01 and consumer price indexes. Each line is a city's net change in {meta.bedroom} asking rent from its own {meta.baseline_quarter} level, on one vertical scale;
        the grey line is Canada. After inflation, rents are in {meta.real_dollar_year} dollars. {meta.n_cities} cities shown.
    </p>
</div>

<style>
    .trajectories {
        width: 100%;
        margin: 1.5rem 0;
    }

    .swatches {
        display: inline-flex;
        gap: 14px;
        white-space: nowrap;
    }
    .swatch {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        color: var(--brandGray70);
    }

    .grid-measure { width: 100%; }

    .featured-grid, .tiny-grid { display: grid; }
    .canada-cell { grid-column: 1 / span 2; grid-row: 1 / span 2; }
    .tiny-grid { margin-top: 22px; }
    .tiny-grid.compact { margin-top: 16px; }

    .cell {
        cursor: default;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }
    .cell:focus-visible { outline: 2px solid var(--brandLightBlue); outline-offset: 1px; border-radius: 2px; }
    .tiny-cell.active { position: relative; z-index: 2; }
</style>
