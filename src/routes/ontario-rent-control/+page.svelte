<script>
	import '../../assets/global-styles.css';

	import Logo from '$lib/header-footer/LogoTop.svelte';
	import TitleStandard from '$lib/header-footer/TitleStandard.svelte';
	import AuthorDate from '$lib/header-footer/AuthorDate.svelte';
	import Footer from '$lib/header-footer/Footer.svelte';
	import Footnote from '$lib/footnotes/Footnote.svelte';
	import Footnotes from '$lib/footnotes/Footnotes.svelte';
	import { createFootnoteStore } from '$lib/footnotes/footnoteUtils';
	import RentIncreaseBarChart from '$lib/charts/RentIncreaseBarChart.svelte';

	const footnoteStore = createFootnoteStore();
	const { footnotes, addFootnote } = footnoteStore;

	const fns = [
		'Canada Mortgage and Housing Corporation (CMHC). <em>Rental Market Survey</em>. Various years.',
		'Ontario Ministry of Municipal Affairs and Housing. <em>Rent Increase Guideline</em>. Various years.',
	];

	// Filter out rows where any period value is null
	import rawPctRaw from '$data/rental-increases/pct_increase_raw.json';
	import rawPctExcess from '$data/rental-increases/pct_increase_excess.json';
	import rawTotalRaw from '$data/rental-increases/total_increase_raw.json';
	import rawTotalExcess from '$data/rental-increases/total_increase_excess.json';

	const periods = ['2004_2011', '2011_2018', '2018_2025', '2004_2025', '2011_2025'];
	const hasAllPeriods = (d) => periods.every((p) => d[p] !== null && d[p] !== undefined);

	const pctRaw     = rawPctRaw.filter(hasAllPeriods);
	const pctExcess  = rawPctExcess.filter(hasAllPeriods);
	const totalRaw   = rawTotalRaw.filter(hasAllPeriods);
	const totalExcess = rawTotalExcess.filter(hasAllPeriods);
</script>


<svelte:head>
	<title>Ontario Rent Control | School of Cities</title>
	<meta name="description" content="Examining rental rate changes across Ontario cities before and after the 2018 deregulation of rent control." />
	<meta name="author" content="School of Cities" />
</svelte:head>


<main>

	<Logo logoType="Blue" backgroundColor="var(--brandWhite)" />

	<TitleStandard
		title="Ontario Rent Control & Rising Rents"
		subtitle="Tracking rental increases across Ontario cities before and after the 2018 deregulation"
	/>

	<div class="text">

		<AuthorDate
			authors="<a href='' target='_blank'>Author Name</a>"
			date="2026"
		/>

		<p>
			In 2018, the Ontario government removed rent control protections for units first occupied after November 15, 2018. This piece examines how rents have changed across Ontario cities in the periods before and after that deregulation, comparing actual increases against what would have been permitted under the provincial rent control guidelines.<Footnote id={addFootnote(fns[0])} />
		</p>

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat lacus eu dolor dapibus sodales. Aenean venenatis metus id eleifend tincidunt. Nulla ut lacus et urna finibus bibendum sit amet et ante. Aliquam tristique, ex sed porttitor hendrerit, ex odio accumsan ex, eu maximus leo quam quis nulla.
		</p>

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat lacus eu dolor dapibus sodales. Aenean venenatis metus id eleifend tincidunt. Nulla ut lacus et urna finibus bibendum sit amet et ante.<Footnote id={addFootnote(fns[1])} />
		</p>

		<RentIncreaseBarChart rawData={rawTotalRaw} excessData={rawTotalExcess} rawPctData={rawPctRaw} excessPctData={rawPctExcess} />

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat lacus eu dolor dapibus sodales. Aenean venenatis metus id eleifend tincidunt.
		</p>

		<div class="details">
			<h2>Data &amp; Methodology</h2>
			<p>
				Rental data is drawn from the CMHC Rental Market Survey, which surveys purpose-built rental units each October. Average rents for the "Total" bedroom category are used as the primary measure across {pctRaw.length} Ontario cities with complete data for all periods examined.
			</p>
			<p>
				Five periods are examined: 2004–2011, 2011–2018, 2018–2025, 2004–2025, and 2011–2025. For each period, two measures are computed: the raw percentage or dollar increase from the start to the end of the period, and the excess above what Ontario's annual rent control guidelines would have permitted (compounded annually). Cities missing rent data at either endpoint of a period are excluded from that comparison.
			</p>
			<p>
				Ontario rent control guidelines are sourced from the Ministry of Municipal Affairs and Housing. The guideline for a given year caps the increase applied in that year relative to the prior year.
			</p>
		</div>

		<Footnotes {footnotes} />

	</div>

	<Footer />

</main>


<style>
</style>
