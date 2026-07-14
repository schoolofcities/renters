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
	import RentBenchmarkChart from '$lib/charts/RentBenchmarkChart.svelte';
	import SupplyRentScatterPair from '$lib/charts/SupplyRentScatterPair.svelte';
	import CityPeriodScatter from '$lib/charts/CityPeriodScatter.svelte';

	const footnoteStore = createFootnoteStore();
	const { footnotes, addFootnote } = footnoteStore;

	const fns = [
		'Canada Mortgage and Housing Corporation (CMHC). <em>Rental Market Survey</em>. Various years.',
		'Ontario Ministry of Municipal Affairs and Housing. <em>Rent Increase Guideline</em>. Various years.',
	];

	import vis2Data from '$data/rising-rents-supply/vis2_city_rent_vs_guideline.json';
	import vis3aRaw from '$data/rising-rents-supply/vis3a_supply_vs_rent_yoy.json';
	import vis3bRaw from '$data/rising-rents-supply/vis3b_demand_adjusted_supply_vs_rent.json';
	import vis4Data from '$data/rising-rents-supply/vis4_city_period_supply_rent.json';
</script>


<svelte:head>
	<title>Rising Rents and Supply in Ontario's Cities | School of Cities</title>
	<meta name="description" content="Exploring rental housing affordability over time, examining how rents have changed across Ontario cities before and after the 2018 deregulation of rent control." />
	<meta name="author" content="School of Cities" />
</svelte:head>


<main>

	<Logo logoType="Blue" backgroundColor="var(--brandWhite)" />

	<TitleStandard
		title="Rising Rents and Supply in Ontario's Cities"
		subtitle="Exploring rental housing affordability over time"
	/>

	<div class="text">

		<AuthorDate
			authors="<a href='https://www.linkedin.com/in/aniket-kali-8a8b9921b/' target='_blank'>Aniket Kali</a>"
			date="July 2026"
		/>

		<p>
			In 2018, the Ontario government removed rent control protections for units first occupied after November 15, 2018. This piece examines how rents have changed across Ontario cities in the periods before and after that deregulation, comparing actual increases against what would have been permitted under the provincial rent control guidelines.<Footnote id={addFootnote(fns[0])} />
		</p>

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat lacus eu dolor dapibus sodales. Aenean venenatis metus id eleifend tincidunt. Nulla ut lacus et urna finibus bibendum sit amet et ante. Aliquam tristique, ex sed porttitor hendrerit, ex odio accumsan ex, eu maximus leo quam quis nulla.
		</p>

		<RentBenchmarkChart />

        <p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat lacus eu dolor dapibus sodales. Aenean venenatis metus id eleifend tincidunt. Nulla ut lacus et urna finibus bibendum sit amet et ante.<Footnote id={addFootnote(fns[1])} />
		</p>

        <RentIncreaseBarChart data={vis2Data} />

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat lacus eu dolor dapibus sodales. Aenean venenatis metus id eleifend tincidunt.
		</p>

		<SupplyRentScatterPair {vis3aRaw} {vis3bRaw} />

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat lacus eu dolor dapibus sodales. Aenean venenatis metus id eleifend tincidunt.
		</p>

		<CityPeriodScatter data={vis4Data} />

		<div class="details">
			<h2>Data &amp; Methodology</h2>
			<p>
				Rental data comes from the CMHC Rental Market Survey, which surveys purpose-built rental apartment buildings each October. For each city, we use the "Total" average rent, a portfolio average across studio, one-, two-, and three-bedroom-plus units. The raw CMHC data was preprocessed to handle suppressed values (marked <code>**</code> when a sample is too small to publish) and zero-change markers (<code>++</code>). This yields a clean annual rent series for each of the 32 Ontario cities shown.
			</p>
			<p>
				Five periods are examined: three equal seven-year spans (2004–2011, 2011–2018, 2018–2025) chosen to straddle the November 2018 deregulation, plus two cumulative windows (2004–2025 and 2011–2025) for broader context. For each city and period, two measures are calculated. The raw increase is the actual rent change, expressed as a percentage or in dollars per month. The excess above rent control is the gap between actual rent and a counterfactual amount, computed by applying Ontario's annual guideline percentage forward from the period start. A city is excluded from a specific period only if data is missing at either endpoint; all other periods for that city are retained. All figures are nominal and do not account for inflation.
			</p>
			<p>
				Ontario rent control guidelines come from the Ministry of Municipal Affairs and Housing. Each year's guideline caps the percentage by which a landlord may raise rent that calendar year relative to the prior year. 
			</p>
		</div>

		<Footnotes {footnotes} />

	</div>

	<Footer />

</main>


<style>
</style>
