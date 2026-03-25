<script>
    let {
        colors = [],    // array of colors forming the gradient stops, left → right
        min = 0,        // minimum (left) value
        max = 100,      // maximum (right) value
        title = 'Legend',
        percent = false,
        nTicks = 5,     // number of labels shown below, including endpoints
    } = $props();

    let legendWidth = $state(0);

    // Evenly spaced tick values between min and max, including both endpoints
    let ticks = $derived(
        Array.from({ length: nTicks }, (_, i) => min + (i / (nTicks - 1)) * (max - min))
    );

    // Tick x position as a fraction of the bar width
    function tickX(i) { return (i / (nTicks - 1)) * legendWidth; }

    // Anchor endpoint labels to the bar edges so they don't overflow
    function tickAnchor(i) {
        if (i === 0) return 'start';
        if (i === nTicks - 1) return 'end';
        return 'middle';
    }

    function formatTick(v) {
        return percent ? `${Math.round(v)}%` : `${Math.round(v)}`;
    }

    // Unique gradient id so multiple instances on one page don't collide
    const gradientId = `lcg-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div class="legend-section">
    <div class="legend-title">
        <p>{title}</p>
    </div>

    <div class="legend" bind:offsetWidth={legendWidth}>
        <svg width="100%" height="25">
            {#if legendWidth > 0 && colors.length > 0}
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        {#each colors as color, i}
                            <stop
                                offset="{(i / (colors.length - 1)) * 100}%"
                                stop-color={color}
                            />
                        {/each}
                    </linearGradient>
                </defs>

                <!-- Full-width gradient bar -->
                <rect
                    width={legendWidth}
                    height="12"
                    x="0"
                    y="0"
                    fill="url(#{gradientId})"
                />

                <!-- Tick labels below the bar -->
                {#each ticks as tick, i}
                    <text
                        class="legend-label"
                        text-anchor={tickAnchor(i)}
                        x={tickX(i)}
                        y="25"
                    >
                        {formatTick(tick)}
                    </text>
                {/each}
            {/if}
        </svg>
    </div>
</div>

<style>
    .legend-section {
        margin: 0;
        padding-top: 5px;
    }

    .legend-title {
        margin-bottom: 10px;
        margin-left: 0px;
    }

    .legend-title p {
        font-family: OpenSans;
        font-size: 15px;
        line-height: 22px;
        color: var(--brandGray90);
        margin-bottom: -5px;
    }

    .legend-label {
        font-size: 14px;
        fill: #000000;
        font-family: OpenSans;
    }

    @media (max-width: 768px) {
        .legend-label {
            font-size: 13px;
        }
    }

    @media (max-width: 400px) {
        .legend-label {
            font-size: 11px;
        }
    }
</style>
