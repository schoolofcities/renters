<script>
    /**
     * A row of rounded "chips" for picking one place out of many. Looks deliberately different from SegmentedToggle (square outlined buttons for
     * a two-way view switch): the chosen chip is filled dark with white text, the others are light grey pills. The first option can stand
     * apart from the rest (e.g. "Canada", then cities listed west to east), marked by a thin divider.
     */
    let {
        options = [],             // [{ label, value }]
        value = $bindable(),
        label = 'Choose a place', // accessible name for the group
        apartFirst = false,       // draw a divider after the first option
    } = $props();
</script>

<div class="chips" role="group" aria-label={label}>
    {#each options as o, i (o.value)}
        <button type="button" class="chip" aria-pressed={value === o.value} onclick={() => (value = o.value)}>{o.label}</button>
        {#if apartFirst && i === 0}<span class="divider" aria-hidden="true"></span>{/if}
    {/each}
</div>

<style>
    .chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
    }
    .chip {
        font-family: OpenSans, sans-serif;
        font-size: 12.5px;
        line-height: 18px;
        color: var(--brandGray80);
        background: #f1f1ee;
        border: 1px solid transparent;
        border-radius: 999px;
        margin: 0;
        padding: 3px 11px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: background 0.12s;
    }
    .chip:hover { background: #e4e4df; }
    .chip[aria-pressed='true'] {
        font-family: OpenSansBold, sans-serif;
        color: #fff;
        background: var(--brandGray90);
    }
    .chip:focus-visible {
        outline: 2px solid var(--brandLightBlue);
        outline-offset: 1px;
    }
    .divider {
        width: 1px;
        height: 18px;
        margin: 0 4px;
        background: var(--brandGray);
    }
    @media (max-width: 520px) {
        .chip { padding: 3px 9px; }
    }
</style>
