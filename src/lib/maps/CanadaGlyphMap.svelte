<script>
    import { geoIdentity, geoPath, scaleLinear } from 'd3';
    import MapTooltip from '$lib/maps/MapTooltip.svelte';

    let {
        frames,              // [{ id: 'main', ... }, { id: 'bc' | 'on' | 'qc', fit, extent, region, rotation, order, row, ... }] — see the plotting-data notebook
        cities = [],         // [{ city, pct_change, base_rent, latest_rent }]; frame points index into this
        mode = 'spike',      // 'spike' | 'arrow'
        tiltDeg = 15,        // arrow lean from vertical, clockwise (chosen in the notebook by minimising arrow overlaps)
        maxValue = 100,      // value that maps to the longest spike / arrow; shared by every frame so lengths are comparable
        keyValues = [25, 50, 100],
        ariaLabel = 'Map of net change in asking rents by city',
        descriptor = '',     // shown in tooltip, e.g. "Q1 2019 – Q1 2026"
    } = $props();

    const COLOR             = '#d73256';
    const FALLBACK_WIDTH    = 700;  // px — used before the container is first measured
    const PAD_X             = 12;   // px — left/right gutter around the national map
    const TIP_GAP           = 6;    // px — gap between the tallest glyph tip and the top edge of its frame
    const MIN_HIT_HALF      = 8;    // px — minimum touch-target half-width
    const MIN_HIT_HEIGHT    = 16;   // px — minimum touch-target height
    const FADE_FRACTION     = 0.14; // share of the national map's height over which the northern crop fades out
    const OVERLAY_MIN_WIDTH = 600;  // px — narrower than this, insets form two rows and the key moves above the map
    const INSET_PAD         = 6;    // px — padding inside an inset box
    const INSET_GAP         = 8;    // px — gap between neighbouring inset boxes
    const CAPTION_H         = 18;   // px — room under each inset box for its title
    const MIN_LABEL_MAIN    = 500;  // px — the national map shows city labels only when at least this wide
    const KEY_SPACING       = 46;   // px — distance between key glyphs

    let containerWidth = $state(null);
    let width = $derived(containerWidth ?? FALLBACK_WIDTH);

    let main   = $derived(frames.find(f => f.id === 'main'));
    let insets = $derived(frames.filter(f => f.id !== 'main').sort((a, b) => a.order - b.order));

    let overlay  = $derived(width >= OVERLAY_MIN_WIDTH);
    let small    = $derived(width < 500);
    let maxLen   = $derived(Math.min(70, Math.max(38, width * 0.10)));    // px length of the longest glyph
    let lenScale = $derived(scaleLinear().domain([0, maxValue]).range([0, maxLen]).clamp(true));
    let fontSize = $derived(small ? 11 : 12);
    let keyBoxH  = $derived(maxLen + 24);

    // Bolder as they get longer: stroke / base width grows with the value
    const strokeFor = (v) => (1.2 + 1.8 * Math.min(v, maxValue) / maxValue) * (small ? 0.9 : 1);
    const halfFor   = (v) => (1.5 + 1.7 * Math.min(v, maxValue) / maxValue) * (small ? 0.85 : 1);

    // Headroom above a frame = just enough that its tallest glyph tip stays inside the frame
    function headroomFor(points, top, k) {
        return Math.ceil(Math.max(
            TIP_GAP,
            ...points.map(p => lenScale(cities[p.i].pct_change) - (top - p.y) * k + TIP_GAP),
        ));
    }

    // Planar km → px. geoIdentity is x' = k·x + tx, y' = −k·y + ty once reflectY is on.
    // (x0, y1) is the frame coordinate that lands at the pixel (left, top).
    function makeProjection(x0, y1, k, left, top) {
        return geoIdentity().reflectY(true).scale(k).translate([left - x0 * k, top + y1 * k]);
    }

    // ── Layout ────────────────────────────────────────────────────────────────
    // Reference key → national map → insets. Desktop: key sits over Hudson Bay and every inset shares one row at one zoom.
    // Phone: the key is a strip above the map and the insets pack into two rows.

    let layout = $derived.by(() => {
        const innerW = width - PAD_X * 2;

        const keyH    = overlay ? 0 : keyBoxH;
        const kMain   = innerW / (main.extent[2] - main.extent[0]);
        const mainH   = (main.extent[3] - main.extent[1]) * kMain;
        const mainTop = keyH + headroomFor(main.points, main.extent[3], kMain);
        const mainBottom = mainTop + mainH;

        const rowGroups = overlay ? [insets] : [0, 1].map(r => insets.filter(f => f.row === r)).filter(r => r.length);

        let y = mainBottom + (overlay ? 16 : 12);
        const boxes = [];
        for (const row of rowGroups) {
            // Box widths are proportional to each inset's visible width times its zoom factor (dense areas get more zoom)
            const fitW = f => (f.fit[2] - f.fit[0]) * (f.zoom ?? 1);
            const avail = innerW - (row.length - 1) * INSET_GAP - row.length * INSET_PAD * 2;
            const kBase = avail / row.reduce((s, f) => s + fitW(f), 0);

            const sized = row.map(f => {
                const k = kBase * (f.zoom ?? 1);
                const hr = Math.max(INSET_PAD, headroomFor(f.points, f.fit[3], k));
                const mapH = (f.fit[3] - f.fit[1]) * k;
                return { f, k, hr, mapH, bw: (f.fit[2] - f.fit[0]) * k + INSET_PAD * 2, bh: hr + mapH + INSET_PAD };
            });
            // every box in a row gets the row's height; spare height is split above/below the map
            const rowH = Math.max(...sized.map(s => s.bh));
            let x = PAD_X;
            for (const s of sized) {
                boxes.push({ ...s, hr: s.hr + (rowH - s.bh) / 2, box: { x, y, w: s.bw, h: rowH } });
                x += s.bw + INSET_GAP;
            }
            y += rowH + CAPTION_H + 6;
        }

        return { kMain, mainH, mainTop, mainBottom, keyH, boxes, height: y - 6 };
    });

    // ── Glyphs ────────────────────────────────────────────────────────────────

    let theta = $derived((tiltDeg * Math.PI) / 180);
    let ux = $derived(Math.sin(theta));    // unit vector along the arrow (screen coords, y down)
    let uy = $derived(-Math.cos(theta));
    let px = $derived(Math.cos(theta));    // perpendicular to it
    let py = $derived(Math.sin(theta));

    // One glyph at pixel (x, y) for value v. Shared by the data glyphs and the reference key.
    function makeGlyph(x, y, v) {
        const len = lenScale(v);
        const g = { x, y, len, v, tipX: x, tipY: y - len };

        if (mode === 'spike') {
            const hw = halfFor(v);
            g.points = `${x - hw},${y} ${x + hw},${y} ${x},${y - len}`;
            g.hitMinX = x - Math.max(hw * 3, MIN_HIT_HALF);
            g.hitW    = Math.max(hw * 3, MIN_HIT_HALF) * 2;
            g.hitMinY = y - Math.max(len, MIN_HIT_HEIGHT);
            g.hitH    = Math.max(len, MIN_HIT_HEIGHT);
            g.samples = [];
            for (let t = 0; t <= len; t += 5) g.samples.push([x, y - t, hw * (1 - t / Math.max(len, 1)) + 1]);
        } else {
            const sw = strokeFor(v);
            const tipX = x + ux * len, tipY = y + uy * len;
            g.tipX = tipX; g.tipY = tipY;
            const head = Math.min(len, 2.6 * sw + 3.5);
            const hw = head * 0.45;
            const baseX = tipX - ux * head, baseY = tipY - uy * head;   // where the head meets the shaft
            g.sw = sw;
            g.radius = sw * 0.9 + 0.6;
            g.shaft = { x1: x, y1: y, x2: baseX + ux, y2: baseY + uy };
            g.points = `${tipX},${tipY} ${baseX + px * hw},${baseY + py * hw} ${baseX - px * hw},${baseY - py * hw}`;
            const pad = 6;
            g.hitMinX = Math.min(x, tipX) - pad;
            g.hitW    = Math.abs(tipX - x) + pad * 2;
            g.hitMinY = Math.min(y, tipY) - pad;
            g.hitH    = Math.abs(tipY - y) + pad * 2;
            g.samples = [];
            for (let t = 0; t <= len; t += 5) g.samples.push([x + ux * t, y + uy * t, sw / 2 + 1]);
        }
        return g;
    }

    // ── Label placement ───────────────────────────────────────────────────────
    // Try each city's label in priority order at a few spots around its base and keep the first that clears every
    // glyph and every label already placed; if none fit, the label is simply left off (hover / tap still names it).

    function rectHitsCircle(r, cx, cy, rad) {
        const nx = Math.max(r[0], Math.min(cx, r[2])), ny = Math.max(r[1], Math.min(cy, r[3]));
        return (nx - cx) ** 2 + (ny - cy) ** 2 < rad * rad;
    }

    function placeLabels(glyphs, order, bounds, reserved = []) {
        const byIndex = new Map(glyphs.map(g => [g.i, g]));
        const allSamples = glyphs.flatMap(g => g.samples.map(s => ({ s, owner: g.i, t: Math.hypot(s[0] - g.x, s[1] - g.y) })));
        const placed = [...reserved], labels = [];
        const cw = fontSize * 0.52;

        for (const entry of order) {
            const g = byIndex.get(entry.i);
            if (!g || g.faint) continue;
            const text = entry.text ?? cities[g.i].city;
            const w = text.length * cw + 2;
            // Spots to try, best first: beside the base, above the tip (good for short glyphs), below, then beside the glyph's middle
            const mx = (g.x + g.tipX) / 2, my = (g.y + g.tipY) / 2;
            const candidates = [
                { anchor: 'start',  x: g.x + 7,  y: g.y + 4,       x0: g.x + 7 },
                { anchor: 'end',    x: g.x - 7,  y: g.y + 4,       x0: g.x - 7 - w },
                { anchor: 'middle', x: g.tipX,   y: g.tipY - 5,    x0: g.tipX - w / 2 },
                { anchor: 'middle', x: g.x,      y: g.y + 16,      x0: g.x - w / 2 },
                { anchor: 'start',  x: g.x + 4,  y: g.y + 16,      x0: g.x + 4 },
                { anchor: 'end',    x: g.x - 4,  y: g.y + 16,      x0: g.x - 4 - w },
                { anchor: 'start',  x: mx + 6,   y: my + 4,        x0: mx + 6 },
                { anchor: 'end',    x: mx - 6,   y: my + 4,        x0: mx - 6 - w },
            ];
            for (const c of candidates) {
                const r = [c.x0, c.y - fontSize + 2, c.x0 + w, c.y + 2];
                if (r[0] < bounds.x0 || r[2] > bounds.x1 || r[1] < bounds.y0 || r[3] > bounds.y1) continue;
                if (placed.some(p => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1])) continue;
                // a glyph's own first few pixels (its base) don't count against its label
                if (allSamples.some(({ s, owner, t }) => !(owner === g.i && t < 6) && rectHitsCircle(r, s[0], s[1], s[2]))) continue;
                placed.push(r);
                labels.push({ key: g.i, x: c.x, y: c.y, anchor: c.anchor, text });
                break;
            }
        }
        return labels;
    }

    function buildFrame(f, projection, bounds, showLabels, isMain, reserved = []) {
        const glyphs = f.points.map(p => {
            const [x, y] = projection([p.x, p.y]);
            return { ...makeGlyph(x, y, cities[p.i].pct_change), i: p.i, faint: isMain && p.in_inset };
        });
        // Longest first, so shorter glyphs draw on top where they overlap; faint (inset-covered) ones sit underneath
        glyphs.sort((a, b) => (b.faint - a.faint) || (b.v - a.v));
        const pathGen = geoPath(projection);
        return {
            id: f.id, glyphs,
            labels: showLabels ? placeLabels(glyphs, f.labels, bounds, reserved) : [],
            paths: f.provinces.features.map(ft => pathGen(ft)),
        };
    }

    // Everything the SVG draws, derived from the layout above
    let drawn = $derived.by(() => {
        const L = layout;
        const mainProj = makeProjection(main.extent[0], main.extent[3], L.kMain, PAD_X, L.mainTop);
        const mainFrame = buildFrame(main, mainProj,
            { x0: 0, x1: width, y0: L.keyH, y1: L.mainBottom }, width >= MIN_LABEL_MAIN, true);

        const insetFrames = L.boxes.map(b => {
            const proj = makeProjection(b.f.fit[0], b.f.fit[3], b.k, b.box.x + INSET_PAD, b.box.y + b.hr);
            const bounds = { x0: b.box.x + 2, x1: b.box.x + b.box.w - 2, y0: b.box.y + 2, y1: b.box.y + b.box.h - 2 };
            // keep labels clear of the north arrow (drawn only where the inset is rotated)
            const rot = (b.f.rotation * Math.PI) / 180;
            const north = b.f.rotation
                ? { x: b.box.x + b.box.w - 22, y: b.box.y + b.box.h - 18, dx: -Math.sin(rot), dy: -Math.cos(rot) }
                : null;
            const reserved = north
                ? [[north.x - 10, north.y - 26, north.x + 10, north.y + 8]]
                : [];
            const fr = buildFrame(b.f, proj, bounds, true, false, reserved);

            // outline of this inset's region on the national map + leader lines to the box (desktop only)
            const ring = b.f.region.map(([x, y]) => mainProj([x, y]));
            const low = [...ring].sort((a, c) => c[1] - a[1]).slice(0, 2).sort((a, c) => a[0] - c[0]);   // two lowest corners, left → right
            const lines = overlay ? [
                { x1: low[0][0], y1: low[0][1], x2: b.box.x,           y2: b.box.y },
                { x1: low[1][0], y1: low[1][1], x2: b.box.x + b.box.w, y2: b.box.y },
            ] : [];
            return {
                ...fr, title: b.f.title, box: b.box, lines, north,
                ring: 'M' + ring.map(p => p.join(',')).join('L') + 'Z',
            };
        });

        // Reference key: desktop → over Hudson Bay (anchor from the notebook); phone → strip above the national map
        let origin;
        if (overlay) {
            const [ax, ay] = mainProj(main.key_anchor);
            origin = { x: ax + 14, y: ay - 18, boxX: ax, boxY: ay - keyBoxH };
        } else {
            origin = { x: PAD_X + 14, y: L.keyH - 20, boxX: PAD_X, boxY: 0 };
        }
        const key = keyValues.map((v, j) => ({ ...makeGlyph(origin.x + j * KEY_SPACING, origin.y, v), label: `+${v}%` }));
        return { mainFrame, insetFrames, key, origin };
    });

    // Unique ids so several maps on one page don't collide
    const uid = Math.random().toString(36).slice(2, 8);

    // ── Tooltip ───────────────────────────────────────────────────────────────

    let tooltip = $state(null); // { clientX, clientY, city } or null

    function showTooltip(e, g) {
        tooltip = { clientX: e.clientX, clientY: e.clientY, city: cities[g.i] };
    }

    const fmtPct = v => (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
    const fmtUsd = v => '$' + Math.round(v).toLocaleString('en-CA');
</script>

{#snippet shape(g)}
    {#if mode === 'spike'}
        <polygon class="shape" points={g.points} fill={COLOR} stroke="white" stroke-width="0.6" />
    {:else}
        <line class="shape" x1={g.shaft.x1} y1={g.shaft.y1} x2={g.shaft.x2} y2={g.shaft.y2} stroke={COLOR} stroke-width={g.sw} stroke-linecap="round" />
        <circle class="shape" cx={g.x} cy={g.y} r={g.radius} fill={COLOR} stroke="white" stroke-width="0.6" />
        <polygon class="shape" points={g.points} fill={COLOR} stroke="white" stroke-width="0.6" stroke-linejoin="round" />
    {/if}
{/snippet}

{#snippet glyphLayer(frame)}
    {#each frame.glyphs as g (g.i)}
        {#if g.faint}
            <!-- Covered by an inset: drawn lightly for the national picture, no hover (the inset carries the detail) -->
            <g class="faint">{@render shape(g)}</g>
        {:else}
            <g class="glyph">
                {@render shape(g)}
                <!-- Invisible hit area: wider + minimum height for easy hover/tap -->
                <rect
                    x={g.hitMinX}
                    y={g.hitMinY}
                    width={g.hitW}
                    height={g.hitH}
                    fill="transparent"
                    style="cursor: pointer"
                    role="button"
                    tabindex="0"
                    aria-label="{cities[g.i].city}: {fmtPct(g.v)}"
                    onmouseenter={(e) => showTooltip(e, g)}
                    onmouseleave={() => (tooltip = null)}
                    onclick={(e) => { e.stopPropagation(); showTooltip(e, g); }}
                    onkeydown={(e) => {
                        if (e.key === 'Enter') {
                            const r = e.currentTarget.getBoundingClientRect();
                            showTooltip({ clientX: r.left + r.width / 2, clientY: r.top }, g);
                        }
                    }}
                />
            </g>
        {/if}
    {/each}

    {#each frame.labels as l (l.key)}
        <text class="chart-axis-label city-label" x={l.x} y={l.y} text-anchor={l.anchor}>{l.text}</text>
    {/each}
{/snippet}

<div class="glyph-map" bind:offsetWidth={containerWidth} onclick={() => (tooltip = null)} role="presentation">
    <svg {width} height={layout.height} role="img" aria-label={ariaLabel}>
        <defs>
            <!-- Soft fade where the national map's northern crop cuts through land -->
            <linearGradient id="fade-{uid}" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={layout.mainTop} y2={layout.mainTop + layout.mainH * FADE_FRACTION}>
                <stop offset="0" stop-color="white" stop-opacity="0" />
                <stop offset="1" stop-color="white" stop-opacity="1" />
            </linearGradient>
            <mask id="mask-{uid}">
                <rect x="0" y={layout.mainTop} {width} height={layout.mainH} fill="url(#fade-{uid})" />
            </mask>
            {#each drawn.insetFrames as f}
                <clipPath id="clip-{f.id}-{uid}">
                    <rect x={f.box.x} y={f.box.y} width={f.box.w} height={f.box.h} />
                </clipPath>
            {/each}
        </defs>

        <!-- National map -->
        <g mask="url(#mask-{uid})">
            {#each drawn.mainFrame.paths as d}
                <path {d} fill="#e2e2e2" stroke="white" stroke-width="0.5" />
            {/each}
        </g>

        <!-- Reference key: what a spike / arrow length means -->
        <g class="key">
            {#if overlay}
                <rect x={drawn.origin.boxX} y={drawn.origin.boxY} width={keyValues.length * KEY_SPACING + 6} height={keyBoxH} fill="white" opacity="0.92" />
            {/if}
            {#each drawn.key as g}
                {@render shape(g)}
                <text class="chart-axis-label key-label" x={g.x} y={g.y + 14} text-anchor="middle">{g.label}</text>
            {/each}
        </g>

        <!-- Where each inset comes from -->
        {#each drawn.insetFrames as f}
            {#each f.lines as ln}
                <line class="leader" x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} />
            {/each}
            <path class="region-box" d={f.ring} />
        {/each}

        {@render glyphLayer(drawn.mainFrame)}

        <!-- Insets -->
        {#each drawn.insetFrames as f}
            <rect class="inset-box" x={f.box.x} y={f.box.y} width={f.box.w} height={f.box.h} />
            <g clip-path="url(#clip-{f.id}-{uid})">
                {#each f.paths as d}
                    <path {d} fill="#e2e2e2" stroke="white" stroke-width="0.5" />
                {/each}
                {@render glyphLayer(f)}
                {#if f.north}
                    <g class="north" transform="translate({f.north.x} {f.north.y})">
                        <line x1="0" y1="0" x2={f.north.dx * 12} y2={f.north.dy * 12} />
                        <polygon points="0,-4 3,2 -3,2" transform="translate({f.north.dx * 12} {f.north.dy * 12}) rotate({Math.atan2(f.north.dx, -f.north.dy) * 180 / Math.PI})" />
                        <text class="chart-axis-label" x={f.north.dx * 21} y={f.north.dy * 21 + 4} text-anchor="middle">N</text>
                    </g>
                {/if}
            </g>
            <text class="chart-axis-label inset-title" x={f.box.x} y={f.box.y + f.box.h + 14}>{f.title}</text>
        {/each}
    </svg>

    {#if tooltip}
        <MapTooltip
            x={tooltip.clientX}
            y={tooltip.clientY}
            title={tooltip.city.city}
            value={fmtPct(tooltip.city.pct_change)}
            descriptor="{fmtUsd(tooltip.city.base_rent)} → {fmtUsd(tooltip.city.latest_rent)} · {descriptor}"
            ondismiss={() => (tooltip = null)}
        />
    {/if}
</div>

<style>
    .glyph-map { width: 100%; min-width: 250px; position: relative; }
    svg { display: block; overflow: visible; }

    .shape { opacity: 0.9; transition: opacity 0.15s ease; }
    .glyph:hover .shape { opacity: 1; }
    .faint { opacity: 0.32; pointer-events: none; }

    .region-box {
        fill: none;
        stroke: var(--brandGray60);
        stroke-width: 1;
        stroke-dasharray: 3 3;
        pointer-events: none;
    }
    .leader {
        stroke: var(--brandGray50);
        stroke-width: 0.75;
        pointer-events: none;
    }
    .inset-box {
        fill: white;
        stroke: var(--brandGray60);
        stroke-width: 1;
    }
    .inset-title { fill: var(--brandGray90); font-family: OpenSansBold; }
    .key-label { fill: var(--brandGray70); }

    .north line { stroke: var(--brandGray60); stroke-width: 1.2; }
    .north polygon { fill: var(--brandGray60); }
    .north text { fill: var(--brandGray70); }

    /* Halo keeps labels legible over spikes and borders */
    .city-label {
        pointer-events: none;
        paint-order: stroke;
        stroke: white;
        stroke-width: 3px;
        stroke-linejoin: round;
    }
</style>
