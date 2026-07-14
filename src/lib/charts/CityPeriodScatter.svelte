<script>
    // import ButtonGroup from '$lib/chart-addons/ButtonGroup.svelte'; // re-enable with the period toggle below
    import ScatterPlot from './ScatterPlot.svelte';
    import { capitalize } from '$lib/utils/format.js';

    /**
     * VIS 4 — single scatter plot (% change in rental units vs. % change in average rent, by
     * city), reusing ScatterPlot as the actual chart. A handful of cities near the edges of the
     * cloud get a permanent label; every other city's name shows on hover.
     *
     * @prop {Array} data - vis4_city_period_supply_rent JSON (one row per city, all 3 periods)
     */
    let { data = [] } = $props();

    // Only 2018–2025 is shown for now. The other two periods (and their correlations) are kept
    // here, ready to re-enable: make `period` a $state, uncomment the ButtonGroup below (options
    // from PERIODS, bind:selectedValue={period}), and swap `periodInfo`/`chartData` back to
    // reading from `period` instead of the hardcoded value.
    const PERIODS = [
        { value: '2004_2011', label: '2004 – 2011', r: 0.03, significant: false },
        { value: '2011_2018', label: '2011 – 2018', r: 0.51, significant: true },
        { value: '2018_2025', label: '2018 – 2025', r: 0.26, significant: false },
    ];
    const period = '2018_2025';
    const periodInfo = PERIODS.find(p => p.value === period);

    // A few cities at the edges of the cloud get a permanent label; hand-picked and
    // hand-positioned since there are only a handful.
    const LABELED_CITIES = {
        'newmarket':       { labelDx: -8,  labelDy: 0, labelAnchor: 'end' }, // centered, left
        'ajax':            { labelDx: -8, labelDy: 0,   labelAnchor: 'end' },    // centered, left
        'ottawa':          { labelDx: 8,  labelDy: 0,   labelAnchor: 'start' },  // centered, right
        'kingston':        { labelDx: 8, labelDy: 0,   labelAnchor: 'start' },    // centered, right
        'toronto':         { labelDx: 8,  labelDy: 0,   labelAnchor: 'start' },  // centered, right
        'barrie':          { labelDx: 0,  labelDy: 12,  labelAnchor: 'middle' }, // below, centered
        'st. catherines':  { labelDx: -8, labelDy: 0,   labelAnchor: 'end' },    // centered, left
        'milton':          { labelDx: 0,  labelDy: 12,  labelAnchor: 'middle' }, // below, centered
    };

    let chartData = $derived.by(() => {
        return data
            .map(d => {
                const pinned = LABELED_CITIES[d.city];
                return {
                    x: d[`pct_units_${period}`],
                    y: d[`pct_rent_${period}`],
                    label: capitalize(d.city),
                    labelMode: pinned ? 'always' : 'hover',
                    labelDx: pinned?.labelDx ?? 8,
                    labelDy: pinned?.labelDy ?? 0,
                    labelAnchor: pinned?.labelAnchor ?? 'start',
                };
            })
            .filter(d => d.x != null && d.y != null);
    });
</script>

<div class="city-period-scatter">
    <!-- Period toggle removed for now — see note above PERIODS in the script.
    <div class="controls">
        <ButtonGroup options={PERIODS.map(p => ({ label: p.label, value: p.value }))} bind:selectedValue={period} onSelect={(v) => (period = v)} label="Time period:" />
    </div>
    -->

    <ScatterPlot
        data={chartData}
        yTicks={[0, 20, 40, 60, 80]}
        xLabel="% change in primary rental units, 2018–2025"
        yLabel="% change in average rent, 2018–2025"
        rValue={periodInfo.r}
        rSignificant={periodInfo.significant}
    />

    <p class="chart-source-note">
        Source: CMHC Rental Market Survey. Each dot is one Ontario city; hover (or tap) to see the
        name. {chartData.length} cities shown.
    </p>
</div>

<style>
    .city-period-scatter {
        width: 100%;
        margin: 1.5rem 0;
    }
</style>
