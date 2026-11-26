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
	import AskingVsPaidDumbbell from '$lib/charts/AskingVsPaidDumbbell.svelte';
	import HeadlineContextBars from '$lib/charts/HeadlineContextBars.svelte';

	import vis1Data from '$data/falling-rents/vis1_net_change_map.json';
	import vis2Data from '$data/falling-rents/vis2_city_trajectories.json';
	import vis3Data from '$data/falling-rents/vis3_asking_vs_paid_change.json';
	import vis4Data from '$data/falling-rents/vis4_headline_context.json';
</script>

<SeoHead
	title="Are Rents Really Falling in Canada?"
	description="In virtually all cities across the country, asking rents remain well above their 2019 amounts."
	path="/falling-rents"
/>

<main>

	<Password />

	<Logo logoType="Blue" backgroundColor="var(--brandWhite)" />

	<TitleStandard
		title="Are Rents Really Falling in Canada?"
		subtitle="In virtually all cities across the country, asking rents remain well above their 2019 amounts."
	/>

	<div class="text">

		<AuthorDate
			authors="<a href='https://www.linkedin.com/in/aniket-kali-8a8b9921b/' target='_blank'>Aniket Kali</a>"
			date="November 2026"
		/>

		<p>
			In some way or another, many of us have seen the headlines: rents are falling. In Toronto, asking rents are <a href="https://www.cbc.ca/news/canada/toronto/toronto-rents-fall-to-lowest-september-levels-9.7374528" target="_blank">at a five-year low</a>. Across British Columbia, <a href="https://www.cbc.ca/news/canada/british-columbia/canada-average-rents-fall-2-years-9.7373338" target="_blank">they’ve fallen by 7.3 per cent</a> over the past two years. And nationally, there have been <a href="https://globalnews.ca/news/12091033/rent-canada-falling-24-months/" target="_blank">24 months of continuous decline</a>.
		</p>

		<p>
			These headlines sit somewhat awkwardly alongside another widely reported fact. Between roughly one-third of Canadians <a href="https://globalnews.ca/news/12134303/food-insecurity-groceries-affordability/" target="_blank">skipping meals</a>, minimum wages <a href="https://www.cbc.ca/news/canada/living-wage-minimum-wage-canada-9.7416320" target="_blank">failing to keep pace with living costs</a>, and rent consuming a <a href="https://www.ipolitics.ca/2026/09/11/rents-are-falling-across-canadas-major-cities-but-its-not-necessarily-better-for-tenants/" target="_blank">substantial share of household income</a>, Canada remains in the midst of a broader <a href="https://www.cbc.ca/news/health/health-inflation-cpi-9.7320052" target="_blank">cost-of-living crisis</a>.
		</p>

		<p>
			We examined changes in asking rents using <a href="https://www150.statcan.gc.ca/n1/daily-quotidien/260609/dq260609c-eng.htm" target="_blank">Statistics Canada’s Quarterly Rent Statistics</a>, which track advertised rents from the first quarter of 2019 onward. Across 40 Canadian cities, the longer-term picture is striking: after accounting for inflation, 39 have still seen a net increase in two-bedroom asking rents between early 2019 and early 2026. Toronto is the lone exception, consistent with <a href="https://torontolife.com/city/access-to-affordable-housing-is-improving-but-most-locals-say-its-still-awful/" target="_blank">some local perceptions</a> that access has recently improved, even as housing there remains widely unaffordable.
		</p>

		<ChartLabel text="After inflation, asking rents are above 2019 levels in every city except Toronto" />
		<NetChangeMapChart data={vis1Data} />

		<p>
			Across much of the country, rents followed a similar trajectory: a sharp increase concentrated around 2022 to 2024, followed by a considerably more modest decline. While this pattern cannot be attributed to any single cause, it sits within longer-running pressures including <a href="https://reframehousing.org/the-financialization-of-housing" target="_blank">the financialization of rental housing</a>, persistent shortages of <a href="https://schoolofcities.utoronto.ca/housing-supply-mix-strategy/" target="_blank">different forms of housing supply</a>, and <a href="https://reframehousing.org/merits-and-limits-of-rent-stabilization" target="_blank">incomplete rent regulation</a>, as highlighted by previous School of Cities research.
		</p>

		<p>
			Despite the nationwide pattern, several cities in Quebec and the Maritimes experienced substantially larger increases, often with much smaller declines afterward, if at all. Quebec’s historically lower rents have been accompanied by a steady <a href="https://www.ctvnews.ca/montreal/article/a-study-finds-quebec-is-losing-lower-cost-rentals-as-average-rent-climbs/" target="_blank">erosion of lower-cost rental stock</a>, while Nova Scotia has experienced <a href="https://www.cbc.ca/news/canada/nova-scotia/rent-increases-vs-historical-9.7332728" target="_blank">large increases when units turn over</a> even under rent caps. As School of Cities researcher Carolyn Whitzman <a href="https://www.cbc.ca/news/canada/nova-scotia/ns-affordable-rental-erosion-9.7186538" target="_blank">has noted</a>, adding housing does not necessarily produce affordable housing if new construction remains concentrated at the higher end of the market.
		</p>

		<ChartLabel text="Most cities saw a steep climb in asking rents followed by a modest drop – but with several exceptions" />
		<CityTrajectoryMultiples data={vis2Data} classBreaksNominal={vis1Data.meta.class_breaks} classBreaksReal={vis1Data.meta.class_breaks_real} />

		<p>
			The data so far describe asking rents: the prices advertised to someone currently looking for an apartment. That is separate from the rent paid by people who are already housed. There is not yet a comparable long-run national quarterly series covering all existing tenants, but <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres" target="_blank">CMHC’s Rental Market Survey</a> provides a longer annual record for purpose-built rental apartments. Across the cities and years we examined, average rents before inflation almost never declined from one year to the next. Inflation-adjusted declines were more common, but still represented a minority of observations.
		</p>

		<p>
			That distinction helps explain how asking rents can fall without tenants seeing their own rent fall. CMHC’s latest data show that rents charged to new tenants have declined in several major markets, while average rents across all occupied units have continued to rise. Statistics Canada now makes the same conceptual distinction between <a href="https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&amp;SDDS=5427&amp;wbdisable=true" target="_blank">asking rent and paid rent</a>. In practice, accessing a lower market rent may therefore require moving – potentially bringing moving costs, a change in location or housing quality, and, in some provinces, the loss of an existing rent-regulated tenancy.
		</p>

		<ChartLabel text="Despite a decline in asking rents since late 2023, primary-market tenants are still largely seeing rising rents" />
		<AskingVsPaidDumbbell data={vis3Data} />

		<p>
			Where, then, does the broader perception of falling rents come from? There is little doubt that asking rents have fallen in many cities. The issue is one of scale: those declines are generally modest relative to the preceding increase, and almost every city in our analysis remains more expensive than it was in 2019 after accounting for inflation.
		</p>

		<p>
			We examined Canadian media headlines from 2019 to 2026 that explicitly described rents as rising or falling. Among 145 headlines discussing falling rents, about one in seven (15 per cent) provided broader context – for example, noting that the decline was small or slowing, that rents remained high or above an earlier level, that the trend differed elsewhere, or that the fall was from a recent peak. The share stayed below one in four after merging near-duplicate stories or weighting every outlet equally, and headlines about rising rents were no more likely to give context (11 per cent).
		</p>

		<p>
			This does not mean those headlines were inaccurate. In fact, when we matched headlines to the relevant Statistics Canada trend, roughly four-fifths pointed in the same direction as the data. Nor is it necessarily a newspaper’s responsibility to reproduce the full historical context in a headline. But in aggregate, and without implying intent, repeated emphasis on direction without scale can produce a different impression from the longer-run data.
		</p>

		<ChartLabel text="Headlines about falling rents were unlikely to give context about rental trends broadly" />
		<HeadlineContextBars data={vis4Data} />

		<p>
			The sum of the evidence is therefore more complicated than simply saying rents are falling. A more complete description is that asking rents have undergone a modest drop after a much larger spike. <a href="https://www.cmhc-schl.gc.ca/observer/2026/2026-mid-year-rental-market-update?ap=a1-p1" target="_blank">CMHC describes the current market</a> as more favourable to renters in several cities, with higher vacancies and greater mobility, but also finds that pressure remains particularly strong in lower-rent segments.
		</p>

		<p>
			Those are welcome signs for renters. They are also compatible with the broader evidence that affordability remains strained. In most of Canada, rents have a long way to fall before reversing the increases of the past several years.
		</p>

		<div class="details">
			<h2>Data &amp; Methodology</h2>
			<p>
				We use <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201" target="_blank">Statistics Canada Table 46-10-0092-01</a> for quarterly asking rents for two-bedroom apartments in census metropolitan areas. Asking rents describe newly advertised units, not what sitting tenants pay, so they move faster than the averages in the CMHC survey used below. Cities need a first-quarter 2019 value and at least eight quarters of data, which leaves out Saguenay and Trois-Rivières.
			</p>
			<p>
				The map and small multiples show the net change from the first quarter of 2019 to the latest quarter, not the fall from each city's peak, because the question is how much of the earlier increase remains. For the after-inflation view, we restate the 2019 rent in first-quarter 2026 dollars using the <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000401" target="_blank">monthly consumer price index</a> for each city's province, averaged by quarter.
			</p>
			<p>
				Arrows on the map fall into four size classes, and each small-multiple line takes the colour of its city's arrow; blue marks a decline. Insets enlarge crowded areas, and labels go to the largest cities and a few notable cases.
			</p>
			<p>
				The asking-versus-paid chart compares how much two measures have changed. Asking rents are the Statistics Canada series from the earlier charts, unchanged. Rents paid come from the <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market" target="_blank">CMHC Rental Market Survey</a>, which each October records the average rent in occupied purpose-built rental apartments; for Canada we average the 40 metros with a complete 2018 to 2025 record, weighted by their number of rental units. "Since 2019" runs from the first quarter of 2019 (for rents paid, estimated from the October 2018 and 2019 surveys, because the survey is not taken in the first quarter) to the first quarter of 2026 for asking rents and October 2025 for rents paid. "Since late 2023" starts from the fourth quarter of 2023, when asking rents peaked nationally (October for rents paid). The two measures cover different units, two-bedroom listings against all occupied apartments, so only changes are compared, never dollar levels, and a change in the CMHC average can also reflect new buildings entering the survey. After inflation, asking rents are deflated by each quarter's provincial consumer price index and rents paid by the October index. The counts in the text use the same data: a rent has fallen when it is lower in the fourth quarter (asking) or October (paid) than a year earlier, for those 40 metros from 2020 to 2025.
			</p>
			<p>
				The headlines are those containing the word "rent" from Canadian news outlets between January 2019 and March 2026, collected through Media Cloud. A language model classified whether each reports a change in residential market rents and whether rents are rising or falling. We then dropped stories about other countries and items not about rent trends (17 headlines), and coded every remaining falling and rising headline for context twice, independently, settling disagreements in favour of finding context. A headline gives some context if it says the change is small or slowing, says rents are still high or above an earlier level (or falling from a peak), says the trend differs elsewhere or that affordability remains a problem, or warns the trend may not last; records, streaks and bare figures do not count. Only the headline is read, so an article may say more. Rising headlines were coded the same way (360 after exclusions).
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
