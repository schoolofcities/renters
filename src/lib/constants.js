// Period selector options for bar chart (individual 7-year periods)
export const PERIOD_OPTIONS = [
    { label: '2004 – 2011', value: '2004_2011' },
    { label: '2011 – 2018', value: '2011_2018' },
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
    { label: 'Dollar amount (total)',  value: 'value'  },
    { label: 'Dollar amount (excess)', value: 'excess' },
    { label: 'Percent increase',       value: 'pct'    },
];

// 5-color sequential palette: low → high monthly increase (matches tariff chart)
export const COLORS = ['#f1c500', '#fb921f', '#f3603e', '#d73256', '#ab1368'];

// 4 pct breakpoints per `${mode}_${period}` → 5 color buckets
// Colors and legend are driven by % increase; bars show $ amounts
export const PCT_BREAKPOINTS = {
    raw_2004_2011:    [9, 12, 15, 20],
    raw_2011_2018:    [20, 25, 30, 35],
    raw_2018_2025:    [40, 45, 50, 55],
    excess_2004_2011: [-4, -2, 2, 4],
    excess_2011_2018: [5, 10, 15, 20],
    excess_2018_2025: [25, 30, 35, 40],
};

export const BAR_LEGEND_TITLES = {
    raw_2004_2011:    'Raw increase in monthly rent ($), 2011 vs. 2004, excluding inflation',
    raw_2011_2018:    'Raw increase in monthly rent ($), 2018 vs. 2011, excluding inflation',
    raw_2018_2025:    'Raw increase in monthly rent ($), 2025 vs. 2018, excluding inflation',
    excess_2004_2011: 'Increase in monthly rent beyond rent control ($), 2011 vs. 2004, excluding inflation',
    excess_2011_2018: 'Increase in monthly rent beyond rent control ($), 2018 vs. 2011, excluding inflation',
    excess_2018_2025: 'Increase in monthly rent beyond rent control ($), 2025 vs. 2018, excluding inflation',
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
