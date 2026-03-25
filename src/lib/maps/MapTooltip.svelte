<script>
    // Generic fixed-position map tooltip.
    // Use with {#if} in the parent — mounts when shown, unmounts when hidden.
    // Automatically calls ondismiss on scroll so the parent can clear its state.
    let { x, y, title, value, descriptor = '', ondismiss = null } = $props();

    $effect(() => {
        if (!ondismiss) return;
        window.addEventListener('scroll', ondismiss, { passive: true });
        return () => window.removeEventListener('scroll', ondismiss);
    });
</script>

<div class="map-tooltip" style="left: {x}px; top: {y}px;">
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
    .title { display: block; font-size: 13px; font-weight: 600; }
    .value { display: block; font-size: 13px; }
    .desc  { display: block; font-size: 11px; opacity: 0.7; margin-top: 1px; }
</style>
