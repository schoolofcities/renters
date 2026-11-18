<script>
	import '../../assets/global-styles.css';

	import Password from '$lib/Password.svelte';
	import Logo from '$lib/header-footer/LogoTop.svelte';
	import TitleStandard from '$lib/header-footer/TitleStandard.svelte';
	import AuthorDate from '$lib/header-footer/AuthorDate.svelte';
	import Footer from '$lib/header-footer/Footer.svelte';
	import SeoHead from '$lib/header-footer/SeoHead.svelte';
	import ChartLabel from '$lib/chart-addons/ChartLabel.svelte';
	import NetChangeMapChart from '$lib/maps/NetChangeMapChart.svelte';
	import CityTrajectoryMultiples from '$lib/charts/CityTrajectoryMultiples.svelte';
	import RentChangeHistogram from '$lib/charts/RentChangeHistogram.svelte';
	import HeadlineContextBars from '$lib/charts/HeadlineContextBars.svelte';

	import vis1Data from '$data/falling-rents/vis1_net_change_map.json';
	import vis2Data from '$data/falling-rents/vis2_city_trajectories.json';
	import vis3Data from '$data/falling-rents/vis3_rent_change_histogram.json';
	import vis4Data from '$data/falling-rents/vis4_headline_context.json';
</script>


<SeoHead
	title="Falling Rents in Canada's Cities"
	description="Asking rents have started to fall in many Canadian cities, but even after inflation they remain above their 2019 levels in almost every one."
	path="/falling-rents"
/>


<main>

	<Password />

	<Logo logoType="Blue" backgroundColor="var(--brandWhite)" />

	<TitleStandard
		title="Falling Rents in Canada's Cities"
		subtitle="How much of the run-up has actually been reversed?"
	/>

	<div class="text">

		<AuthorDate
			authors="<a href='https://www.linkedin.com/in/aniket-kali-8a8b9921b/' target='_blank'>Aniket Kali</a>"
			date="November 2026"
		/>

		<p>
			Headlines have increasingly said that rents in Canada are falling. In most large cities, asking rents have indeed slipped from their recent peaks. But a falling line says little on its own about where rents started – and by early 2019, rents were far lower than they are now.
		</p>

		<p>
			Using Statistics Canada's quarterly asking-rent data for two-bedroom apartments, we compared asking rents in the first quarter of 2019 with the latest quarter available, the first quarter of 2026, after adjusting for inflation with provincial consumer price indexes. Across the 40 cities with enough data, 39 are higher. Canada-wide, the net increase is 17 per cent, and the typical city is up 21 per cent. Toronto, at –14 per cent, is the only city where the asking rent is now below its 2019 level, and only Vancouver and Edmonton are within 5 per cent of it. Before adjusting for inflation, every city is higher: Canada-wide the increase is 41 per cent, the typical city is up 47 per cent, and Toronto is up 4 per cent.
		</p>

		<ChartLabel text="After inflation, asking rents are above 2019 levels in every city except Toronto" />
		<NetChangeMapChart data={vis1Data} />

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
		</p>

		<p>
			Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
		</p>

		<ChartLabel text="Most cities saw a steep climb in asking rents followed by a modest drop – but with several exceptions" />
		<CityTrajectoryMultiples data={vis2Data} classBreaksNominal={vis1Data.meta.class_breaks} classBreaksReal={vis1Data.meta.class_breaks_real} />

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
		</p>

		<p>
			Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
		</p>

		<ChartLabel text="After inflation, average rents in occupied apartments fell in 47 of 280 city-years – for the most part, in 2021 and 2022" />
		<RentChangeHistogram data={vis3Data} />

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
		</p>

		<p>
			Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
		</p>

		<ChartLabel text="Headlines about falling rents were unlikely to give context about rental trends broadly" />
		<HeadlineContextBars data={vis4Data} />

		<div class="details">
			<h2>Data &amp; Methodology</h2>
			<p>
				We use <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201" target="_blank">Statistics Canada Table 46-10-0092-01</a> for quarterly asking rents for two-bedroom apartments in census metropolitan areas. Asking rents describe newly advertised units, not what sitting tenants pay, so they move faster than the averages in the CMHC survey used below. Cities need a first-quarter 2019 value and at least eight quarters of data, which leaves out Saguenay and Trois-Rivières.
			</p>
			<p>
				The map and small multiples show the net change from the first quarter of 2019 to the latest quarter, not the fall from each city's peak, because the question is how much of the earlier increase remains. For the after-inflation view, we restate the 2019 rent in 2025 dollars using the <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000501" target="_blank">consumer price index</a> for each city's province. The index is not yet published beyond 2025, so the latest rent is left as is, which slightly understates recent inflation.
			</p>
			<p>
				Arrows on the map fall into four size classes, and each small-multiple line takes the colour of its city's arrow; blue marks a decline. Insets enlarge crowded areas, and labels go to the largest cities and a few notable cases.
			</p>
			<p>
				The histogram uses the <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market" target="_blank">CMHC Rental Market Survey</a>, which each October records the average rent in occupied purpose-built apartments. For 40 cities and each year from 2019 to 2025, we take the percentage change in that average since the previous October and count the 280 city-years in one-point bands. Windsor and St. Catharines–Niagara are left out because their data cannot be used. A change in the average can also reflect new buildings entering the survey.
			</p>
			<p>
				The headlines are those containing the word "rent" from Canadian news outlets between January 2019 and March 2026, collected through Media Cloud. A language model classified whether each reports a change in residential market rents and whether rents are rising or falling; the 149 falling headlines were re-read in a second, blind pass. A headline gives some context if it says the change is small or slowing, compares it with an earlier year or a peak, or says rents are still high or unaffordable. Only the headline is read, so an article may say more. The rising bar is a random sample of 143 of the 401 rising headlines, and its labels were not re-checked.
			</p>
			<p>
				You can find all the data, code, and the full list of classified headlines for this article on our <a href="https://github.com/schoolofcities/renters" target="_blank">GitHub repository</a>.
			</p>
		</div>

	</div>

	<Footer />

</main>


<style>
</style>
