<script>
    import ChartHeader from '$lib/chart-addons/ChartHeader.svelte';

    /**
     * Two bars, one per direction (rents falling / rising). Every news headline is one thin tick, and the ticks of each bar are split into those that give
     * the reader some context and those that do not. Hovering (or tapping, or arrowing to) a tick opens a card with the headline, outlet, date,
     * direction and context tags and a link to the article. All classification is done in the notebooks; this only draws.
     *
     * @prop {Object} data - vis4_headline_context JSON ({ meta, groups: [{ id, label, n, n_context, share, headlines: [{ t, o, d, u, c, f }] }] })
     */
    let { data } = $props();

    let { meta, groups } = $derived(data);

    // Context is the thing the page is about, so it takes the colour (the crimson of the map's larger classes); a headline without any is a neutral grey.
    // Checked with the dataviz validator: the pair separates for colour-blind readers (ΔE 16 deutan) and the grey clears 2.3:1; since the grey is under 3:1, the counts
    // are printed beside each bar and every headline is also in the list underneath.
    const COLOR_CONTEXT = '#d5393d';
    const COLOR_NONE    = '#aaa9a2';
    const DIM = 0.32;

    // ─── layout ────────────────────────────────────────────────────────────────
    let width = $state(0);
    let compact = $derived(width < 520);
    const SEP = 8;                                           // extra air between the context and no-context parts of a bar
    let barH = $derived(compact ? 30 : 38);
    const padY = 6;                                          // room above and below the ticks for the selected tick to stand taller
    let svgH = $derived(barH + padY * 2);
    let maxN = $derived(Math.max(...groups.map((g) => g.n)));

    // Every tick, gap and separator is a whole number of DEVICE pixels, so all the lines come out exactly the same width and the same distance apart
    // (fractional widths made some lines look thicker than others, most visibly in Firefox). One tick width for both bars, so the two lengths compare directly.
    let dpr = $state(1);
    $effect(() => {
        const update = () => { dpr = window.devicePixelRatio || 1; };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    });
    let sepD  = $derived(Math.round(SEP * dpr));
    let stepD = $derived(Math.max(2, Math.floor((width * dpr - sepD) / maxN)));      // device px per headline
    let gapD  = $derived(Math.min(2, Math.max(1, Math.round(stepD * 0.22))));        // device px of white between lines
    let step  = $derived(stepD / dpr);
    let tickW = $derived((stepD - gapD) / dpr);

    const sepOf = (g) => (g.n_context > 0 && g.n_context < g.n ? sepD / dpr : 0);
    const xOf = (g, i) => (i * stepD + (i >= g.n_context && sepOf(g) > 0 ? sepD : 0)) / dpr;

    // x (px from the left of the bar) -> index of the tick under it, snapping across the gaps so the pointer never falls between two ticks
    function indexAt(g, x) {
        const sep = sepOf(g);
        if (sep === 0) return Math.max(0, Math.min(g.n - 1, Math.floor(x / step)));
        const boundary = g.n_context * step + sep / 2;
        return x < boundary
            ? Math.max(0, Math.min(g.n_context - 1, Math.floor(x / step)))
            : Math.max(g.n_context, Math.min(g.n - 1, Math.floor((x - sep) / step)));
    }

    // ─── formatting ────────────────────────────────────────────────────────────
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fmtDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
    const directionTag = (g) => g.label;                     // "Rents falling" / "Rents rising"
    const pct = (v) => `${Math.round(v)}%`;
    const listOf = (names) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names.join(''));

    // ─── hover / tap / keyboard ────────────────────────────────────────────────
    // sel = { row, idx, pinned }: the tick whose card is open. A pinned card stays open when the pointer leaves (click, tap, or keyboard).
    let sel = $state(null);
    let hideTimer = null;
    let root = $state(null);

    function cancelHide() { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } }
    function scheduleHide() {
        cancelHide();
        hideTimer = setTimeout(() => { if (sel && !sel.pinned) sel = null; }, 160);   // long enough to travel from the tick to the card
    }

    function pointX(e) { return e.clientX - e.currentTarget.getBoundingClientRect().left; }

    function preview(ri, e) {
        cancelHide();
        const idx = indexAt(groups[ri], pointX(e));
        if (sel && sel.pinned && sel.row === ri && sel.idx === idx) return;
        sel = { row: ri, idx, pinned: false };
    }
    function onDown(ri, e) { if (e.pointerType === 'touch') preview(ri, e); }
    function onMove(ri, e) {
        if (e.pointerType === 'touch' && e.buttons === 0) return;     // a finger only scrubs while it is down
        preview(ri, e);
    }
    function onLeave(e) { if (e.pointerType !== 'touch') scheduleHide(); }
    function onUp(ri, e) { if (e.pointerType === 'touch') { sel = { row: ri, idx: indexAt(groups[ri], pointX(e)), pinned: true }; } }
    function onCancel() { if (sel && !sel.pinned) sel = null; }
    function onClick(ri, e) {
        if (e.pointerType === 'touch' || e.detail === 0) return;      // touch pins on release; detail 0 = synthetic/keyboard click
        const idx = indexAt(groups[ri], pointX(e));
        sel = sel && sel.pinned && sel.row === ri && sel.idx === idx ? null : { row: ri, idx, pinned: true };
    }

    function onKey(ri, e) {
        const n = groups[ri].n;
        let idx = sel && sel.row === ri ? sel.idx : -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') idx = Math.min(n - 1, idx + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') idx = Math.max(0, idx < 0 ? 0 : idx - 1);
        else if (e.key === 'Home') idx = 0;
        else if (e.key === 'End') idx = n - 1;
        else if (e.key === 'Escape') { sel = null; return; }
        else return;
        e.preventDefault();
        sel = { row: ri, idx, pinned: true, kb: true };
    }
    function onBlur() { if (sel && sel.kb) sel = null; }

    // a pinned card closes when the reader clicks anywhere else
    function onWindowDown(e) { if (sel && sel.pinned && root && !root.contains(e.target)) sel = null; }
    function onWindowKey(e) { if (e.key === 'Escape' && sel) sel = null; }

    // ─── the card ──────────────────────────────────────────────────────────────
    const CARD_W = $derived(Math.min(312, Math.max(0, width)));
    function cardLeft(g, idx) {
        const centre = xOf(g, idx) + step / 2;
        return Math.max(0, Math.min(width - CARD_W, centre - CARD_W / 2));
    }

    let announce = $derived.by(() => {
        if (!sel) return '';
        const g = groups[sel.row], h = g.headlines[sel.idx];
        return `Headline ${sel.idx + 1} of ${g.n}, ${g.label.toLowerCase()}: ${h.t}. ${h.o}, ${fmtDate(h.d)}. ${h.c ? 'Some context.' : 'Little context.'}`;
    });
</script>

<svelte:window onpointerdown={onWindowDown} onkeydown={onWindowKey} />

<div class="hc" bind:this={root}>
    <ChartHeader
        title="A headline gives some context if it says the change is small, compares it with the past or a peak, or says rents are still high"
        hint="Hover or tap a line to read the headline."
    >
    </ChartHeader>

    <div class="rows" bind:clientWidth={width}>
        <!-- on the first row's title line (right-aligned); on a narrow screen there is no room beside the title, so it sits just above the rows -->
        <div class="key" class:inline={compact} role="group" aria-label="Colours">
            <span class="key-item"><span class="chip" style="background: {COLOR_CONTEXT}"></span>Some context</span>
            <span class="key-item"><span class="chip" style="background: {COLOR_NONE}"></span>Little context</span>
        </div>
        {#each groups as g, ri (g.id)}
            <section class="row" aria-label="{g.label}: {g.n_context} of {g.n} headlines have some context">
                <p class="row-title"><span class="dir">{g.label}</span><span class="muted">{g.n} headlines</span></p>
                <!-- the red section is the left end of the bar, so its figure sits straight above it -->
                <p class="row-stat"><span class="chip" style="background: {COLOR_CONTEXT}"></span><span class="pct">{pct(g.share)}</span> have some context<span class="muted">({g.n_context} of {g.n})</span></p>

                <div class="bar-wrap">
                    {#if width > 0}
                        <!-- a custom keyboard widget (arrow keys step through the headlines), so it takes focus and key events deliberately -->
                        <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
                        <div
                            class="bar-focus"
                            role="application"
                            tabindex="0"
                            aria-label="{g.label}: {g.n} headlines, one line each; {g.n_context} have some context. Use the left and right arrow keys to read them one by one."
                            onkeydown={(e) => onKey(ri, e)}
                            onblur={onBlur}
                        >
                        <svg {width} height={svgH} aria-hidden="true" shape-rendering="crispEdges">
                            {#each g.headlines as h, i (i)}
                                {@const isSel = sel && sel.row === ri && sel.idx === i}
                                {@const dim = sel && sel.row === ri && !isSel}
                                <rect
                                    x={xOf(g, i)} y={isSel ? padY - 5 : padY}
                                    width={tickW} height={isSel ? barH + 10 : barH}
                                    fill={h.c ? COLOR_CONTEXT : COLOR_NONE}
                                    opacity={dim ? DIM : 1}
                                />
                            {/each}
                            <!-- one transparent target over the whole bar, so the pointer never falls between ticks -->
                            <rect
                                x="0" y="0" {width} height={svgH} fill="transparent" class="hit"
                                role="presentation"
                                onpointerdown={(e) => onDown(ri, e)}
                                onpointermove={(e) => onMove(ri, e)}
                                onpointerleave={onLeave}
                                onpointerup={(e) => onUp(ri, e)}
                                onpointercancel={onCancel}
                                onclick={(e) => onClick(ri, e)}
                            />
                        </svg>
                        </div>

                        {#if sel && sel.row === ri}
                            {@const h = g.headlines[sel.idx]}
                            <div
                                class="card"
                                class:below={ri > 0}
                                style="left: {cardLeft(g, sel.idx)}px; width: {CARD_W}px;"
                                onpointerenter={cancelHide}
                                onpointerleave={scheduleHide}
                                role="presentation"
                            >
                                <div class="tags">
                                    <span class="tag">{directionTag(g)}</span>
                                    <span class="tag"><span class="chip" style="background: {h.c ? COLOR_CONTEXT : COLOR_NONE}"></span>{h.c ? 'Some context' : 'Little context'}</span>
                                </div>
                                <p class="c-title">{h.t}</p>
                                <p class="c-sub">{h.o} · {fmtDate(h.d)}</p>
                                {#if h.c && h.f.length}
                                    <p class="c-why">{h.f.map((f) => meta.flag_labels[f]).join(' · ')}</p>
                                {/if}
                                <a class="c-link" href={h.u} target="_blank" rel="noopener noreferrer">Read the article ↗</a>
                            </div>
                        {/if}
                    {/if}
                </div>
            </section>
        {/each}
    </div>

    <p class="sr-only" aria-live="polite">{announce}</p>

    <p class="chart-source-note">
        Source: headlines containing “rent” from {meta.n_outlets} Canadian news outlets, mostly {listOf(meta.top_outlets)} (not every outlet in the country), {meta.date_range[0].slice(0, 4)}–{meta.date_range[1].slice(0, 4)} (Media Cloud), classified by a language model. A figure alone does not count as context.
        Comparisons with an earlier level are coded as “still above” it, since after inflation rents are higher than in 2019 nearly everywhere; Toronto is the one city where they are lower.
        The rising bar is a random sample.
    </p>
</div>

<style>
    .hc {
        width: 100%;
        margin: 1rem 0 1.5rem;
    }

    .rows { width: 100%; position: relative; }
    .row { margin-top: 10px; }
    .row:first-of-type { margin-top: 0; }

    .row p { margin: 0; padding: 0; font-family: OpenSans, sans-serif; line-height: 20px; font-size: 14px; color: var(--brandGray80); text-align: left; }
    .row-stat { display: flex; align-items: center; gap: 6px; margin-top: 1px; }
    .dir { font-family: OpenSansBold, sans-serif; font-weight: normal; font-size: 15px; margin-right: 8px; color: var(--brandGray90); }
    .pct { font-family: OpenSansBold, sans-serif; font-weight: normal; font-size: 15px; color: var(--brandGray90); margin-right: -2px; }
    .muted { font-size: 12.5px; color: var(--brandGray60); }
    .row-stat .muted { margin-left: 2px; }

    .bar-wrap { position: relative; }
    svg { display: block; overflow: visible; touch-action: pan-y; cursor: pointer; }
    .bar-focus:focus { outline: none; }
    .bar-focus:focus-visible { outline: 2px solid var(--brandGray80); outline-offset: 2px; }
    .hit { touch-action: pan-y; }

    /* year/colour key */
    .key { position: absolute; top: 0; right: 0; height: 20px; display: flex; align-items: center; gap: 14px; }
    .key.inline { position: static; height: auto; margin-bottom: 8px; }
    .key-item { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--brandGray70); }
    .chip { display: inline-block; width: 10px; height: 10px; flex: none; }

    /* the card: sits against the bar (above the first bar, below the second) so the pointer can move from the tick into it and click the link */
    .card {
        position: absolute;
        z-index: 20;
        bottom: 100%;
        box-sizing: border-box;
        background: #fff;
        color: var(--brandGray90);
        border: 1px solid var(--brandGray80);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        padding: 9px 11px 10px;
        font-family: OpenSans, sans-serif;
        font-size: 12px;
        line-height: 1.45;
        text-align: left;
        cursor: default;
    }
    .card.below { bottom: auto; top: 100%; }
    .tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; }
    .tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 1px 7px 1px 6px;
        border: 1px solid var(--brandGray);
        font-size: 11px;
        line-height: 17px;
        color: var(--brandGray80);
    }
    .tag .chip { width: 8px; height: 8px; }
    .card p { margin: 0; padding: 0; font-family: OpenSans, sans-serif; line-height: 1.45; }
    .card .c-title { font-family: OpenSansBold, sans-serif; font-weight: normal; font-size: 13px; line-height: 1.4; color: var(--brandGray90); }
    .card .c-sub { margin-top: 3px; font-size: 12px; color: var(--brandGray70); }
    .card .c-why { margin-top: 5px; font-size: 11.5px; color: var(--brandGray70); font-family: OpenSansItalic, sans-serif; }
    .card .c-link { display: inline-block; margin-top: 7px; font-family: OpenSans, sans-serif; font-size: 12px; }

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
