<script>
    import { scaleLinear } from 'd3-scale';
    import { line as d3line } from 'd3-shape';
    import SegmentedToggle from '$lib/chart-addons/SegmentedToggle.svelte';
    import PlaceChips from '$lib/chart-addons/PlaceChips.svelte';
    import ChartHeader from '$lib/chart-addons/ChartHeader.svelte';
    import MapTooltip from '$lib/maps/MapTooltip.svelte';
    import { ASKING_RENT_COLOR, PAID_RENT_COLOR } from '$lib/constants.js';

    /**
     * Two lines on one index (2019 = 100): the asking rent a new tenant is quoted (quarterly) and the average rent people already housed pay (once a year, October).
     * Shading between the lines shows which is higher. A picker switches between Canada and four cities; a toggle between after and before inflation.
     * All the indexing is done in the notebook; this only draws.
     *
     * @prop {Object} data - vis3_asking_vs_paid JSON ({ meta, places })
     */
    let { data } = $props();

    let { meta, places } = $derived(data);

    // ─── what to show ──────────────────────────────────────────────────────────
    const MEASURES = [
        { label: 'After inflation', value: 'real' },
        { label: 'Before inflation', value: 'nom' },
    ];
    let measure = $state('real');
    let real = $derived(measure === 'real');
    let placeName = $state('Canada');
    let placeOptions = $derived(places.map((p) => ({ label: p.name, value: p.name })));

    let place = $derived(places.find((p) => p.name === placeName) ?? places[0]);
    // one value per quarter, 2019 = 100. A quarter Statistics Canada did not publish is bridged by a straight line, as in the small multiples.
    let ask = $derived.by(() => {
        const raw = place[`ask_${measure}`], out = [...raw];
        for (let i = 0; i < raw.length; i++) {
            if (raw[i] != null) continue;
            let a = i - 1, b = i + 1;
            while (a >= 0 && raw[a] == null) a--;
            while (b < raw.length && raw[b] == null) b++;
            if (a >= 0 && b < raw.length) out[i] = raw[a] + ((i - a) / (b - a)) * (raw[b] - raw[a]);
        }
        return out;
    });
    let paid  = $derived(place[`paid_${measure}`]);      // one value per year (October)
    // The vertical range fits the chosen place (a city like St. John's climbs far higher than Edmonton), padded to whole tens and always including 100.
    let [yLo, yHi] = $derived.by(() => {
        const vals = [...ask.filter((v) => v != null), ...paid, 100];
        const lo = Math.floor((Math.min(...vals) - 2) / 10) * 10;
        let hi = Math.ceil((Math.max(...vals) + 2) / 10) * 10;
        if (hi - lo < 40) hi = lo + 40;
        return [lo, hi];
    });
    let yStep = $derived(yHi - yLo > 70 ? 20 : 10);

    // ─── layout ────────────────────────────────────────────────────────────────
    let width = $state(0);
    let compact = $derived(width < 520);
    let margin = $derived({ top: 24, right: compact ? 76 : 112, bottom: 28, left: 32 });
    let innerW = $derived(Math.max(0, width - margin.left - margin.right));
    let innerH = $derived(compact ? 230 : 280);
    let height = $derived(innerH + margin.top + margin.bottom);

    let n = $derived(meta.quarters.length);
    let paidAt = $derived(meta.paid_at);
    let lastPaid = $derived(paidAt[paidAt.length - 1]);
    let xScale = $derived(scaleLinear().domain([0, n - 1]).range([0, innerW]));
    let yScale = $derived(scaleLinear().domain([yLo, yHi]).range([innerH, 0]));
    let yTicks = $derived.by(() => { const t = []; for (let v = 100 - Math.floor((100 - yLo) / yStep) * yStep; v <= yHi; v += yStep) t.push(v); return t; });

    // the paid-rent line at any quarter between its first and last October (a straight line between the annual points)
    function paidAtQuarter(i) {
        for (let k = 0; k < paidAt.length - 1; k++) {
            if (i >= paidAt[k] && i <= paidAt[k + 1]) return paid[k] + ((i - paidAt[k]) / (paidAt[k + 1] - paidAt[k])) * (paid[k + 1] - paid[k]);
        }
        return null;
    }

    let askPath  = $derived(d3line().defined((v) => v != null).x((v, i) => xScale(i)).y((v) => yScale(v))(ask));
    let paidPath = $derived(d3line().x((v, k) => xScale(paidAt[k])).y((v) => yScale(v))(paid));

    // The band between the two lines, split wherever they cross: [{ pts: [[i, value], …], paidHigher }]
    let bands = $derived.by(() => {
        const out = [];
        for (let i = 0; i < lastPaid; i++) {
            const a0 = ask[i], a1 = ask[i + 1], p0 = paidAtQuarter(i), p1 = paidAtQuarter(i + 1);
            if (a0 == null || a1 == null) continue;
            const d0 = a0 - p0, d1 = a1 - p1;
            if (d0 * d1 >= 0) {
                out.push({ pts: [[i, a0], [i + 1, a1], [i + 1, p1], [i, p0]], paidHigher: d0 + d1 < 0 });
            } else {
                const t = d0 / (d0 - d1), xc = i + t, yc = a0 + t * (a1 - a0);
                out.push({ pts: [[i, a0], [xc, yc], [i, p0]], paidHigher: d0 < 0 });
                out.push({ pts: [[xc, yc], [i + 1, a1], [i + 1, p1]], paidHigher: d1 < 0 });
            }
        }
        return out;
    });
    const bandPath = (pts) => 'M' + pts.map(([i, v]) => `${xScale(i)},${yScale(v)}`).join('L') + 'Z';

    // the asking-rent peak, marked when asking rents are now clearly below it
    let peakI = $derived(ask.reduce((best, v, i) => (v != null && (best < 0 || v > ask[best]) ? i : best), -1));
    let showPeak = $derived(peakI >= 0 && peakI < n - 1 && ask[peakI] - ask[n - 1] > 2);

    // Where the "Asking rents peak" label can go: above the ring, else below it, whichever clears both lines; none if neither does (the ring still marks it)
    const PEAK_TEXT = 'Asking rents peak', PEAK_W = 96;
    let peakLabel = $derived.by(() => {
        if (!showPeak) return null;
        const cx = Math.max(PEAK_W / 2, Math.min(innerW - PEAK_W / 2, xScale(peakI))), py = yScale(ask[peakI]);
        const curve = [];                                   // sample both lines every quarter-of-a-quarter
        for (let t = 0; t <= n - 1; t += 0.25) {
            const i0 = Math.floor(t), f = t - i0, a0 = ask[i0], a1 = ask[Math.min(n - 1, i0 + 1)];
            if (a0 != null && a1 != null) curve.push([xScale(t), yScale(a0 + f * (a1 - a0))]);
            const p = t <= lastPaid ? paidAtQuarter(t) : null;
            if (p != null) curve.push([xScale(t), yScale(p)]);
        }
        for (const dy of [-11, 22]) {
            const top = py + dy - 11, bottom = py + dy + 3, left = cx - PEAK_W / 2 - 3, right = cx + PEAK_W / 2 + 3;
            if (top < -margin.top + 4) continue;
            if (!curve.some(([x, y]) => x > left && x < right && y > top && y < bottom)) return { x: cx, y: py + dy };
        }
        return null;
    });

    // end labels, nudged apart if the two lines finish close together
    let endLabels = $derived.by(() => {
        let ay = yScale(ask[n - 1]), py = yScale(paid[paid.length - 1]);
        if (Math.abs(ay - py) < 32) {
            const mid = (ay + py) / 2, paidAbove = py < ay;
            py = mid + (paidAbove ? -16 : 16);
            ay = mid + (paidAbove ? 16 : -16);
        }
        return [
            { key: 'paid', y: py, name: compact ? 'Paid' : 'Rents paid', value: paid[paid.length - 1], color: PAID_RENT_COLOR },
            { key: 'ask',  y: ay, name: compact ? 'Asking' : 'Asking rents', value: ask[n - 1], color: ASKING_RENT_COLOR },
        ];
    });

    const change = (v) => Math.round(v - 100);
    const signed = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '%';
    const moved = (v) => (change(v) >= 0 ? `up ${change(v)}%` : `down ${Math.abs(change(v))}%`);
    let caption = $derived(
        `${placeName === 'Canada' ? 'Across Canada' : `In ${placeName}`}, ${real ? 'after' : 'before'} inflation, rents paid are ${moved(paid[paid.length - 1])} since 2019 and asking rents are ${moved(ask[n - 1])}.`
    );

    // ─── hover / tap ───────────────────────────────────────────────────────────
    let hoverI = $state(null);        // quarter index under the pointer
    let tipAnchor = $state(null);     // { x, y, yBelow } in client pixels
    let svgEl = $state(null);

    function pick(e) {
        const r = svgEl.getBoundingClientRect();
        const i = Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left - margin.left) / innerW) * (n - 1))));
        hoverI = i;
        tipAnchor = { x: r.left + margin.left + xScale(i), y: r.top + margin.top, yBelow: r.bottom };
    }
    function clear() { hoverI = null; tipAnchor = null; }
    function onMove(e) { if (e.pointerType === 'mouse' || e.buttons) pick(e); }
    function onLeave(e) { if (e.pointerType === 'mouse') clear(); }

    // the October point nearest the hovered quarter
    let tip = $derived.by(() => {
        if (hoverI === null) return null;
        let k = 0;
        paidAt.forEach((q, j) => { if (Math.abs(q - hoverI) < Math.abs(paidAt[k] - hoverI)) k = j; });
        return { quarter: meta.quarters[hoverI], ask: ask[hoverI], k, paid: paid[k], when: meta.paid_labels[k] };
    });

    // changing place or view closes the pop-up (the lines move under it)
    $effect(() => { placeName; measure; clear(); });
</script>

<div class="avp">
    <ChartHeader
        title="Change in asking rents and rents paid since 2019{real ? ', after inflation' : ', before inflation'}"
        titleLongest="Change in asking rents and rents paid since 2019, after inflation"
        hint="Pick a place, listed west to east. Hover or tap the chart for details."
    >
        {#snippet controls()}
            <div class="controls-grid">
                <span class="ctl-label">Place</span>
                <PlaceChips options={placeOptions} bind:value={placeName} apartFirst label="Place, listed west to east" />
                <span class="ctl-label">Rents</span>
                <div><SegmentedToggle options={MEASURES} bind:value={measure} label="Show rents as" /></div>
            </div>
        {/snippet}
        {#snippet legend()}
            <div class="key" role="group" aria-label="Lines">
                <span class="key-item"><span class="chip" style="background: {ASKING_RENT_COLOR}"></span>{compact ? 'Asking rents' : 'Asking rents (new listings)'}</span>
                <span class="key-item"><span class="chip" style="background: {PAID_RENT_COLOR}"></span>{compact ? 'Rents paid' : 'Rents paid (sitting tenants)'}</span>
            </div>
        {/snippet}
    </ChartHeader>

    <div class="plot" bind:clientWidth={width}>
        {#if width > 0}
            <svg bind:this={svgEl} {width} {height} role="img"
                 aria-label="Line chart: asking rents and rents paid in {placeName}, as an index with 2019 equal to 100, {real ? 'after' : 'before'} inflation. {caption}">
                <g transform="translate({margin.left},{margin.top})">
                    {#each yTicks as t}
                        <line x1="0" x2={innerW} y1={yScale(t)} y2={yScale(t)} class={t === 100 ? 'base-line' : 'grid-line'} />
                        <text x="-6" y={yScale(t)} class="chart-axis-label tick" text-anchor="end" dominant-baseline="middle">{t}</text>
                    {/each}
                    <text x={-margin.left + 2} y="-10" class="axis-title">Index, 2019 = 100</text>
                    <text x={innerW - 2} y={yScale(100) + 13} class="side-note" text-anchor="end">2019 level</text>

                    <!-- year bands: a tick at each January, the year's name in the middle of its band (so an October point sits in the right year) -->
                    {#each meta.year_starts as q}
                        <line x1={xScale(q)} x2={xScale(q)} y1={innerH} y2={innerH + 4} class="year-tick" />
                    {/each}
                    {#each meta.years as y, k}
                        {#if !compact || k % 2 === 0}
                            <text x={xScale(meta.year_starts[k] + 1.5)} y={innerH + 18} class="chart-axis-label tick" text-anchor="middle">{y}</text>
                        {/if}
                    {/each}

                    <!-- which line is higher: crimson wash where asking rents lead, plum where rents paid do -->
                    {#each bands as b}
                        <path d={bandPath(b.pts)} fill={b.paidHigher ? PAID_RENT_COLOR : ASKING_RENT_COLOR} fill-opacity="0.13" />
                    {/each}

                    <path d={askPath} fill="none" stroke={ASKING_RENT_COLOR} stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" />
                    <path d={paidPath} fill="none" stroke={PAID_RENT_COLOR} stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" />
                    {#each paid as v, k}
                        <circle cx={xScale(paidAt[k])} cy={yScale(v)} r="4" fill={PAID_RENT_COLOR} class="dot" />
                    {/each}
                    <circle cx={xScale(n - 1)} cy={yScale(ask[n - 1])} r="4" fill={ASKING_RENT_COLOR} class="dot" />

                    {#if showPeak}
                        <circle cx={xScale(peakI)} cy={yScale(ask[peakI])} r="5" fill="none" stroke={ASKING_RENT_COLOR} stroke-width="1.5" class="peak-ring" />
                        {#if peakLabel}<text x={peakLabel.x} y={peakLabel.y} class="side-note halo" text-anchor="middle">{PEAK_TEXT}</text>{/if}
                    {/if}

                    {#each endLabels as l (l.key)}
                        <text x={innerW + 10} y={l.y - 2} class="end-name">{l.name}</text>
                        <text x={innerW + 10} y={l.y + 13} class="end-value" style="fill: {l.color}">{signed(change(l.value))}</text>
                    {/each}

                    <!-- hover marks -->
                    {#if tip}
                        <line x1={xScale(hoverI)} x2={xScale(hoverI)} y1="0" y2={innerH} class="cross" />
                        {#if tip.ask != null}<circle cx={xScale(hoverI)} cy={yScale(tip.ask)} r="5" fill={ASKING_RENT_COLOR} class="dot" />{/if}
                        <circle cx={xScale(paidAt[tip.k])} cy={yScale(tip.paid)} r="5.5" fill={PAID_RENT_COLOR} class="dot" />
                    {/if}

                    <rect x="0" y="0" width={innerW} height={innerH} fill="transparent" role="presentation"
                          onpointermove={onMove} onpointerdown={pick} onpointerleave={onLeave} />
                </g>
            </svg>
        {/if}
    </div>

    {#if tip && tipAnchor}
        <MapTooltip x={tipAnchor.x} y={tipAnchor.y} yBelow={tipAnchor.yBelow} title={tip.quarter} width={236} ondismiss={clear}>
            <span class="tip-row">
                <span><span class="chip" style="background: {ASKING_RENT_COLOR}"></span>Asking rents</span>
                <span class="tip-val">{tip.ask == null ? '–' : signed(change(tip.ask))}</span>
            </span>
            <span class="tip-row">
                <span><span class="chip" style="background: {PAID_RENT_COLOR}"></span>Rents paid, {tip.when}</span>
                <span class="tip-val">{signed(change(tip.paid))}</span>
            </span>
            <span class="tip-note">Change since 2019</span>
        </MapTooltip>
    {/if}

    <p class="caption">{caption}</p>

    <p class="chart-source-note">
        Source: Statistics Canada, Table 46-10-0092-01 (two-bedroom asking rents, quarterly; Canada is all census metropolitan areas), CMHC Rental Market Survey (average rent in occupied purpose-built
        apartments, each October, with the first-quarter 2019 start estimated from the 2018 and 2019 surveys; Canada is the average of {meta.n_paid_cmas} metros weighted by rental units) and consumer price indexes. The two cover different units, so only change since 2019 is compared.
    </p>

    <div class="sr-only">
        <table>
            <caption>Rents paid and asking rents in {placeName}, index with 2019 = 100, {real ? 'after' : 'before'} inflation</caption>
            <thead><tr><th>Year</th><th>Rents paid (October)</th><th>Asking rents (fourth quarter)</th></tr></thead>
            <tbody>
                {#each meta.years as y, j}
                    <tr><td>{y}</td><td>{paid[j + 1]}</td><td>{ask[paidAt[j + 1]] ?? ''}</td></tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .avp { width: 100%; margin: 1.5rem 0; }
    .plot { width: 100%; }
    svg { display: block; overflow: visible; touch-action: pan-y; cursor: crosshair; }

    .controls-grid { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 10px 12px; }
    .ctl-label { font-family: OpenSans, sans-serif; font-size: 12px; color: var(--brandGray60); }

    .grid-line { stroke: var(--brandGray); stroke-width: 0.5; }
    .base-line { stroke: var(--brandGray60); stroke-width: 0.9; }
    .tick { font-size: 11px; fill: var(--brandGray60); }
    .year-tick { stroke: var(--brandGray50); stroke-width: 0.8; }
    .axis-title { font-family: OpenSans, sans-serif; font-size: 12px; fill: var(--brandGray70); }
    .side-note { font-family: OpenSansItalic, sans-serif; font-size: 11.5px; fill: var(--brandGray60); }
    .halo { paint-order: stroke; stroke: white; stroke-width: 3px; stroke-linejoin: round; }
    .dot { stroke: white; stroke-width: 2; }
    .peak-ring { fill: white; fill-opacity: 0.85; }
    .cross { stroke: var(--brandGray70); stroke-width: 1; stroke-dasharray: 3 3; pointer-events: none; }
    .end-name { font-family: OpenSans, sans-serif; font-size: 12px; fill: var(--brandGray70); }
    .end-value { font-family: OpenSansBold, sans-serif; font-size: 14px; }

    .key { display: flex; flex-wrap: wrap; gap: 4px 16px; justify-content: flex-end; }
    .key-item { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--brandGray70); }
    .chip { display: inline-block; width: 10px; height: 10px; flex: none; margin-right: 6px; }
    .key-item .chip { margin-right: 0; }

    .tip-row { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; line-height: 1.5; }
    .tip-val { font-family: OpenSansBold, sans-serif; font-variant-numeric: tabular-nums; }
    .tip-note { display: block; margin-top: 3px; font-size: 11px; color: var(--brandGray60); }

    p.caption {
        font-family: OpenSans, sans-serif;
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--brandGray80);
        margin: 10px 0 0;
        padding: 0;
    }

    .sr-only {
        position: absolute;
        width: 1px; height: 1px;
        margin: -1px; padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
    }
</style>
