<script>
    // Generic fixed-position map tooltip.
    // Use with {#if} in the parent — mounts when shown, unmounts when hidden.
    // Automatically calls ondismiss on scroll so the parent can clear its state.
    let { x, y, title, value, descriptor = '', ondismiss = null } = $props();

    let el = $state(null);
    let visible = $state(false);
    let finalX = $state(x);
    let flipBelow = $state(false);

    // After mount, measure the tooltip and clamp to viewport edges.
    // Start invisible to avoid a flash at the unclamped position.
    $effect(() => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const pad = 8;

        let ax = x;
        if (ax - rect.width / 2 < pad) ax = rect.width / 2 + pad;
        if (ax + rect.width / 2 > vw - pad) ax = vw - rect.width / 2 - pad;

        finalX = ax;
        flipBelow = y - rect.height - 10 < pad; // flip below cursor when near the top
        visible = true;
    });

    $effect(() => {
        if (!ondismiss) return;
        window.addEventListener('scroll', ondismiss, { passive: true });
        return () => window.removeEventListener('scroll', ondismiss);
    });
</script>

<div
    class="map-tooltip"
    class:flip-below={flipBelow}
    style="left: {finalX}px; top: {y}px; opacity: {visible ? 1 : 0};"
    bind:this={el}
>
    <span class="title">{title}</span>
    <span class="value">{value}</span>
    {#if descriptor}<span class="desc">{descriptor}</span>{/if}
</div>

<style>
    .map-tooltip {
        position: fixed;
        transform: translate(-50%, calc(-100% - 10px));
        background: rgba(30, 30, 30, 0.9);
        color: white;
        border-radius: 4px;
        padding: 5px 8px;
        pointer-events: none;
        white-space: nowrap;
        font-family: OpenSans, sans-serif;
        line-height: 1.4;
        z-index: 10;
    }
    .map-tooltip.flip-below {
        transform: translate(-50%, 10px); /* show below cursor when near top of screen */
    }
    .title { display: block; font-size: 13px; font-weight: 600; }
    .value { display: block; font-size: 13px; }
    .desc  { display: block; font-size: 11px; opacity: 0.7; margin-top: 1px; }
</style>
