// Period selector options for bar chart (cumulative periods)
export const PERIOD_OPTIONS = [
    { label: '2004 – 2025', value: '2004_2025' },
    { label: '2011 – 2025', value: '2011_2025' },
    { label: '2018 – 2025', value: '2018_2025' },
];

// Period selector options for spike map (individual 7-year periods)
export const SPIKE_PERIOD_OPTIONS = [
    { label: '2004 – 2011', value: '2004_2011' },
    { label: '2011 – 2018', value: '2011_2018' },
    { label: '2018 – 2025', value: '2018_2025' },
];

// Mode selector options
export const MODE_OPTIONS = [
    { label: 'Total increase', value: 'raw' },
    { label: 'Excess above rent control', value: 'excess' },
];

// Rank selector options
export const RANK_OPTIONS = [
    { label: 'Dollar amount', value: 'value' },
    { label: 'Percent increase', value: 'pct' },
];

// 5-color sequential palette: low → high monthly increase (matches tariff chart)
export const COLORS = ['#f1c500', '#fb921f', '#f3603e', '#d73256', '#ab1368'];

// 4 pct breakpoints per `${mode}_${period}` → 5 color buckets
// Colors and legend are driven by % increase; bars show $ amounts
export const PCT_BREAKPOINTS = {
    raw_2018_2025:    [40, 45, 50, 55],
    raw_2011_2025:    [70, 80, 95, 100],
    raw_2004_2025:    [90, 100, 115, 125],
    excess_2018_2025: [25, 30, 35, 40],
    excess_2011_2025: [40, 50, 65, 70],
    excess_2004_2025: [45, 55, 70, 80],
};

// x-axis upper bound per key (rounded up from observed max)
export const MAX_VALUES = {
    raw_2018_2025:    950,
    raw_2011_2025:    1200,
    raw_2004_2025:    1300,
    excess_2018_2025: 800,
    excess_2011_2025: 900,
    excess_2004_2025: 900,
};

export const BAR_LEGEND_TITLES = {
    raw_2018_2025:    'Raw increase in monthly rent ($), 2025 vs. 2018, excluding inflation',
    raw_2011_2025:    'Raw increase in monthly rent ($), 2025 vs. 2011, excluding inflation',
    raw_2004_2025:    'Raw increase in monthly rent ($), 2025 vs. 2004, excluding inflation',
    excess_2018_2025: 'Increase in monthly beyond rent control ($), 2025 vs. 2018, excluding inflation',
    excess_2011_2025: 'Increase in monthly beyond rent control ($), 2025 vs. 2011, excluding inflation',
    excess_2004_2025: 'Increase in monthly beyond rent control ($), 2025 vs. 2004, excluding inflation',
};

// Legend titles for the spike map (% increases, individual 7-year periods)
export const SPIKE_LEGEND_TITLES = {
    raw_2004_2011:    'Raw % increase in monthly rent, 2011 vs. 2004, excluding inflation',
    raw_2011_2018:    'Raw % increase in monthly rent, 2018 vs. 2011, excluding inflation',
    raw_2018_2025:    'Raw % increase in monthly rent, 2025 vs. 2018, excluding inflation',
    excess_2004_2011: '% increase in monthly rent beyond rent control, 2011 vs. 2004, excluding inflation',
    excess_2011_2018: '% increase in monthly rent beyond rent control, 2018 vs. 2011, excluding inflation',
    excess_2018_2025: '% increase in monthly rent beyond rent control, 2025 vs. 2018, excluding inflation',
};
