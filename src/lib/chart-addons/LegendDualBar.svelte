<script>
    /**
     * Simple two-swatch legend for a dual-bar chart.
     * Shows a colored horizontal bar swatch + label for each of the two bar types.
     * Styling matches the other legend components (same title font, same spacing).
     *
     * @prop {string} primaryColor   - Color of the primary (background) bar
     * @prop {string} primaryLabel   - Label for the primary bar
     * @prop {string} secondaryColor - Color of the secondary (overlaid) bar
     * @prop {string} secondaryLabel - Label for the secondary bar
     * @prop {string} title          - Optional title shown above the swatches
     */
    let {
        primaryColor   = 'var(--brandGray)',
        primaryLabel   = 'Total increase',
        secondaryColor = '#fca9a9',
        secondaryLabel = 'Excess above rent control',
        title          = '',
    } = $props();
</script>

<div class="legend-section">
    {#if title}<div class="legend-title"><p>{title}</p></div>{/if}
    <div class="swatches">
        <div class="swatch">
            <span class="bar" style="background: {primaryColor}"></span>
            <span class="swatch-label">{primaryLabel}</span>
        </div>
        <div class="swatch">
            <span class="bar" style="background: {secondaryColor}"></span>
            <span class="swatch-label">{secondaryLabel}</span>
        </div>
    </div>
</div>

<style>
    .legend-section {
        margin: 0;
        margin-bottom: 12px;
        padding-top: 5px;
    }

    .legend-title {
        margin-bottom: 6px;
    }

    .legend-title p {
        font-family: OpenSans;
        font-size: 15px;
        line-height: 22px;
        color: var(--brandGray90);
        margin-bottom: 0;
    }

    .swatches {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 6px 20px;
        align-items: center;
    }

    .swatch {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* Match the height of the legend bars in LegendGraduatedBreakpoints */
    .bar {
        display: inline-block;
        width: 36px;
        height: 12px;
        border-radius: 1px;
        flex-shrink: 0;
    }

    .swatch-label {
        font-family: OpenSans;
        font-size: 14px;
        color: var(--brandGray90);
    }

    @media (max-width: 768px) {
        .swatch-label { font-size: 13px; }
    }

    @media (max-width: 400px) {
        .swatch-label { font-size: 11px; }
    }
</style>
