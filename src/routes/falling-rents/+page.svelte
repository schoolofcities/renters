<script>
	import '../../assets/global-styles.css';

	import Logo from '$lib/header-footer/LogoTop.svelte';
	import TitleStandard from '$lib/header-footer/TitleStandard.svelte';
	import AuthorDate from '$lib/header-footer/AuthorDate.svelte';
	import Footer from '$lib/header-footer/Footer.svelte';
	import SeoHead from '$lib/header-footer/SeoHead.svelte';
	import ChartLabel from '$lib/chart-addons/ChartLabel.svelte';
	import NetChangeMapChart from '$lib/maps/NetChangeMapChart.svelte';
	import CityTrajectoryMultiples from '$lib/charts/CityTrajectoryMultiples.svelte';
	import RentChangeHistogram from '$lib/charts/RentChangeHistogram.svelte';

	import vis1Data from '$data/falling-rents/vis1_net_change_map.json';
	import vis2Data from '$data/falling-rents/vis2_city_trajectories.json';
	import vis3Data from '$data/falling-rents/vis3_rent_change_histogram.json';
</script>


<SeoHead
	title="Falling Rents in Canada's Cities"
	description="Asking rents have started to fall in many Canadian cities, but they remain far above where they were in 2019."
	path="/falling-rents"
/>


<main>

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
			Using Statistics Canada's quarterly asking-rent data for two-bedroom apartments, we compared asking rents in the first quarter of 2019 with the latest quarter available, the first quarter of 2026. Across the 40 cities with enough data, rents have risen in every one. Canada-wide, the net increase is 41 per cent, and the typical city is up 47 per cent. Toronto, at +4 per cent, is the only city within 20 per cent of its 2019 level.
		</p>

		<ChartLabel text="Asking rents are still well above 2019 levels in every city" />
		<NetChangeMapChart data={vis1Data} />

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
		</p>

		<p>
			Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
		</p>

		<ChartLabel text="Most cities climbed fast, then eased back – but every city is still above where it started in 2019" />
		<CityTrajectoryMultiples data={vis2Data} />

		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
		</p>

		<p>
			Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
		</p>

		<ChartLabel text="Before inflation, average rents in occupied apartments fell in only 5 of 280 city-years since 2019" />
		<RentChangeHistogram data={vis3Data} />

		<div class="details">
			<h2>Data &amp; Methodology</h2>
			<p>
				We use <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201" target="_blank">Statistics Canada Table 46-10-0092-01</a> for quarterly asking rents in census metropolitan areas. Asking rents describe newly advertised units, not what sitting tenants pay, so they move faster than the averages reported in the CMHC Rental Market Survey.
			</p>
			<p>
				The map shows the net percentage change in the asking rent for a two-bedroom apartment between the first quarter of 2019 and the first quarter of 2026. This is a net change across the whole period, not the decline from each city's peak. Cities need at least eight quarters of data and a first-quarter 2019 value to be included, which leaves out Saguenay and Trois-Rivières. The Canada-wide figure uses Statistics Canada's own aggregate across all census metropolitan areas.
			</p>
			<p>
				The small multiples chart plots, for every city and for Canada as a whole, the net percentage change in the same two-bedroom asking rent from the first quarter of 2019 at each quarter through the first quarter of 2026. Every city is measured against its own starting level, and all panels share one vertical scale so the shapes of the trends can be compared directly. Where a quarter has no published value, the line is drawn straight from the quarter before to the quarter after. Each chart can be switched between nominal change and change after inflation, and each pop-up shows both, with a thin bar for the change in dollars: a line marks the starting asking rent, and the shading runs to its right for an increase or to its left for a decrease, on one scale for every pop-up. For the after-inflation view, the starting asking rent is restated in 2025 dollars using Statistics Canada's consumer price index for the city's province (Canada's for the national line), and since the index is not yet published beyond 2025 the latest asking rent is left as is, which slightly understates recent inflation. Canada is shown large, followed by four featured cities (Vancouver, Calgary, Toronto and Montréal) chosen as big markets from across the country; all other cities follow in alphabetical order.
			</p>
			<p>
				Arrows are drawn at city-centre points and grouped into four size classes: 0–25 per cent, 25–50, 50–75 and 75 or more for nominal change, and 0–10, 10–25, 25–40 and 40 or more after inflation, whose changes are smaller. A blue arrow pointing down marks a decline, which only happens after inflation (Toronto). Arrows lean only so they overlap less; the lean carries no information. The provincial boundaries are simplified and the map is cropped north of the cities in the data. Three insets enlarge Southern British Columbia, Southern Ontario, and Southern Québec, where cities are too close together to read at national scale; the two eastern insets are rotated 30 degrees, with a north arrow, and cities in an inset appear faintly on the national map. Ottawa and Gatineau, two halves of one metropolitan area about four kilometres apart, are nudged apart so both remain visible.
			</p>
			<p>
				The histogram uses a different source, the <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market" target="_blank">CMHC Rental Market Survey</a>, which each October records the average rent in purpose-built rental apartments that are already occupied, for all unit types together. For each of 40 cities and each year from 2019 to 2025 we take the percentage change in that average since the previous October, round it to one decimal, and place the city-year in a one-point band; the height of a bar is the number of city-years in the band, and the colours split it by year. That makes 280 city-years in all. Windsor is left out because the survey has too few years for it, and St. Catharines–Niagara because its summary table cannot be used. A change in the average can also reflect new buildings entering the survey, not only rent increases for the same tenants. The after-inflation view removes the change in the consumer price index for the city's province between the two Octobers; since the index is not yet published beyond 2025, the latest year slightly understates inflation. Both views share one scale, so nothing moves when you switch between them.
			</p>
			<p>
				You can find all the data and code for this article on our <a href="https://github.com/schoolofcities/renters" target="_blank">GitHub repository</a>.
			</p>
		</div>

	</div>

	<Footer />

</main>


<style>
</style>
