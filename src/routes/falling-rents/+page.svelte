<script>
	import '../../assets/global-styles.css';

	import Logo from '$lib/header-footer/LogoTop.svelte';
	import TitleStandard from '$lib/header-footer/TitleStandard.svelte';
	import AuthorDate from '$lib/header-footer/AuthorDate.svelte';
	import Footer from '$lib/header-footer/Footer.svelte';
	import SeoHead from '$lib/header-footer/SeoHead.svelte';
	import ChartLabel from '$lib/chart-addons/ChartLabel.svelte';
	import NetChangeMapChart from '$lib/maps/NetChangeMapChart.svelte';

	import vis1Data from '$data/falling-rents/vis1_net_change_map.json';
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

		<div class="details">
			<h2>Data &amp; Methodology</h2>
			<p>
				We use <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201" target="_blank">Statistics Canada Table 46-10-0092-01</a> for quarterly asking rents in census metropolitan areas. Asking rents describe newly advertised units, not what sitting tenants pay, so they move faster than the averages reported in the CMHC Rental Market Survey.
			</p>
			<p>
				The map shows the net percentage change in the asking rent for a two-bedroom apartment between the first quarter of 2019 and the first quarter of 2026. This is a net change across the whole period, not the decline from each city's peak. Cities need at least eight quarters of data and a first-quarter 2019 value to be included, which leaves out Saguenay and Trois-Rivières. The Canada-wide figure uses Statistics Canada's own aggregate across all census metropolitan areas.
			</p>
			<p>
				Spikes and arrows are drawn at city-centre points, and the provincial boundaries are simplified. The map is cropped north of the cities in the data, and the inset enlarges the Windsor to Québec City corridor, where cities are too close together to read at national scale. Ottawa and Gatineau, two halves of one metropolitan area about four kilometres apart, are nudged apart so both remain visible.
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
