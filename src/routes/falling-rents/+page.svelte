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
	import Footnote from '$lib/footnotes/Footnote.svelte';
	import Footnotes from '$lib/footnotes/Footnotes.svelte';
	import { createFootnoteStore } from '$lib/footnotes/footnoteUtils.js';

	import vis1Data from '$data/falling-rents/vis1_net_change_map.json';
	import vis2Data from '$data/falling-rents/vis2_city_trajectories.json';
	import vis3Data from '$data/falling-rents/vis3_asking_vs_paid_change.json';
	import vis4Data from '$data/falling-rents/vis4_headline_context.json';

	const footnoteStore = createFootnoteStore();
	const fnBedrooms = footnoteStore.addFootnote('We also examined one-bedroom and three-plus-bedroom homes in the data, which saw essentially the same trend. We feature two-bedrooms in this article as it is commonplace for discussions about housing.');
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
			Asking rents in Canada are lower than they were two years ago – about 4% nationally, and down in 23 of 40 cities across the country since then. The headlines have followed: In Toronto, asking rents are <a href="https://www.cbc.ca/news/canada/toronto/toronto-rents-fall-to-lowest-september-levels-9.7374528" target="_blank">at a five-year low</a>. Across British Columbia, <a href="https://www.cbc.ca/news/canada/british-columbia/canada-average-rents-fall-2-years-9.7373338" target="_blank">they’ve fallen by 7.3%</a> over the past two years. And nationally, there has been <a href="https://globalnews.ca/news/12091033/rent-canada-falling-24-months/" target="_blank">24 months of continuous decline</a>.
		</p>

		<p>
			But these headlines sit alongside another widely reported fact: Canada remains in the midst of a broader <a href="https://www.cbc.ca/news/health/health-inflation-cpi-9.7320052" target="_blank">cost-of-living crisis</a>. Roughly one-third of Canadians are <a href="https://globalnews.ca/news/12134303/food-insecurity-groceries-affordability/" target="_blank">skipping meals</a>, minimum wages <a href="https://www.cbc.ca/news/canada/living-wage-minimum-wage-canada-9.7416320" target="_blank">fail to keep pace with living costs</a>, and rent consumes a <a href="https://www.ipolitics.ca/2026/09/11/rents-are-falling-across-canadas-major-cities-but-its-not-necessarily-better-for-tenants/" target="_blank">substantial share of household income</a>.
		</p>

		<p>
			We examined changes in asking rents using <a href="https://www150.statcan.gc.ca/n1/daily-quotidien/260609/dq260609c-eng.htm" target="_blank">Statistics Canada’s Quarterly Rent Statistics</a>, which track advertised rents from the first quarter of 2019 onward. Across 40 Canadian cities, the longer-term picture is striking: after accounting for inflation, 39 have seen a net increase in two-bedroom asking rents between early 2019 and early 2026.<Footnote id={fnBedrooms} />
		</p>

		<p>
			Toronto is the lone exception. It’s a probable combination of timing and market conditions: Toronto’s rents were <a href="https://www.cmhc-schl.gc.ca/-/media/sites/cmhc/data-research/publications-reports/rental-market-reports/2020/rental-market-report-69720-2020-en.ashx#page=95" target="_blank">already rising sharply</a> by the late 2010s, while a <a href="https://toronto.citynews.ca/2026/06/09/rents-fall-as-new-completions-surge-and-demand-slows-but-rebound-expected-cmhc/" target="_blank">surge in completed condos and purpose-built rentals</a> has accompanied slower demand after the pandemic from tenants. That is consistent with <a href="https://torontolife.com/city/access-to-affordable-housing-is-improving-but-most-locals-say-its-still-awful/" target="_blank">some local perceptions</a> that access to affordable housing has improved, even though housing remains widely unaffordable. Indeed, Toronto’s decline appears only after adjusting for inflation.
		</p>

		<ChartLabel text="After inflation, asking rents are above 2019 levels in every city except Toronto" />
		<NetChangeMapChart data={vis1Data} />

		<p>
			Across much of the country, rents followed a similar trajectory: a sharp increase concentrated around 2021 to 2023, followed by a considerably more modest decline. While this pattern cannot be attributed to any single cause, it sits within longer-running pressures including <a href="https://reframehousing.org/the-financialization-of-housing" target="_blank">the financialization of rental housing</a>, persistent shortages of <a href="https://schoolofcities.utoronto.ca/housing-supply-mix-strategy/" target="_blank">different forms of housing supply</a>, such as non-market and rental housing, and <a href="https://reframehousing.org/merits-and-limits-of-rent-stabilization" target="_blank">incomplete rent regulation</a>, as highlighted by previous School of Cities research.
		</p>

		<p>
			Despite the nationwide pattern, several cities in Quebec and the Maritimes experienced substantially larger increases, often with much smaller declines afterward, if at all. Quebec’s historically lower rents have been accompanied by a steady <a href="https://www.ctvnews.ca/montreal/article/a-study-finds-quebec-is-losing-lower-cost-rentals-as-average-rent-climbs/" target="_blank">erosion of lower-cost rental stock</a>, while Nova Scotia has experienced <a href="https://www.cbc.ca/news/canada/nova-scotia/rent-increases-vs-historical-9.7332728" target="_blank">large increases when units turn over</a>, even under rent caps. As School of Cities researcher Carolyn Whitzman <a href="https://www.cbc.ca/news/canada/nova-scotia/ns-affordable-rental-erosion-9.7186538" target="_blank">has noted</a>, adding housing does not necessarily produce affordable housing if new construction remains concentrated at the higher end of the market.
		</p>

		<ChartLabel text="Most cities saw a steep climb in asking rents followed by a modest drop – but with several exceptions" />
		<CityTrajectoryMultiples data={vis2Data} classBreaksNominal={vis1Data.meta.class_breaks} classBreaksReal={vis1Data.meta.class_breaks_real} />

		<p>
			The data so far describe asking rents – the prices advertised to someone currently looking for an apartment. That is separate from the rent paid by people who are already housed. There is not yet a comparable national quarterly series covering all existing tenants, but <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres" target="_blank">CMHC’s Rental Market Survey</a> provides an annual record for purpose-built rental apartments. Asking rents peaked nationally in late 2023: since then, they have fallen about 9% after inflation. Over the same stretch, the average rent people pay has gone the other way, rising about 8%.
		</p>

		<p>
			That distinction helps explain how asking rents can fall without tenants seeing their own rent fall. CMHC's latest data show that rents charged to new tenants have declined in several major markets, including Toronto, Vancouver and Calgary, while average rents across all occupied units have continued to rise. The pattern holds almost everywhere we looked: in all 12 cities, rents paid have risen more than asking rents since late 2023. In Vancouver, for example, asking rents are down 16% after inflation while rents paid are up 3%. Statistics Canada now makes the same conceptual distinction between <a href="https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&amp;SDDS=5427&amp;wbdisable=true" target="_blank">asking rent and paid rent</a>. In practice, accessing a lower market rent may therefore require moving – potentially bringing moving costs, a change in location or housing quality, and, in some provinces, the loss of an existing rent-regulated tenancy.
		</p>

		<ChartLabel text="Despite a decline in asking rents since late 2023, the rents primary-market tenants actually pay are largely still rising" />
		<AskingVsPaidDumbbell data={vis3Data} />

		<p>
			Asking rents have fallen from their peaks in 39 of the 40 cities after inflation. But most of those declines are small next to the increase that came before them: the typical city's asking rent is only about 7% below its peak, which claws back roughly 30 cents of every dollar of the increase since 2019. Only six cities, led by Vancouver and Edmonton, have won back more than half of it. And all but one are still more expensive in 2026 than in 2019 after accounting for inflation.
		</p>

		<p>
			But how were these trends reported in the media? We examined Canadian headlines from 2019 to 2026 that explicitly described rents as rising or falling: 505 in all, from 41 outlets, mostly large ones such as CTV News, the Toronto Star and Global News, so not all Canadian media. Of the 145 about falling rents, 22 (15%) gave broader context – for example, noting that the decline was small or slowing, that rents remained high or above an earlier level, or that the fall was from a recent peak. The share stayed below one in four after merging near-duplicate stories or weighting every outlet equally, and headlines about rising rents were no more likely to give context (11% of 360).
		</p>

		<p>
			This does not mean those headlines were inaccurate. When we matched them to Statistics Canada's asking rents for the city and period each described, 78% of the 551 we could match pointed the same way as the data. The rest are not necessarily wrong, since headlines may describe periods, places or sources our quarterly data cannot match exactly. Nor is it a newspaper's job to give the full history in a headline. But in aggregate, and without implying intent, repeated emphasis on direction without scale can leave a different impression from the longer-run data.
		</p>

		<ChartLabel text="Headlines about falling rents were unlikely to give context about rental trends broadly" />
		<HeadlineContextBars data={vis4Data} />

		<p>
			The sum of the evidence is therefore more complicated than simply saying rents are falling. A more complete description is that Canada-wide asking rents have undergone a modest drop, after a much larger spike – about 4% from their late-2023 peak, and they remain up 41% from 2019, or about 15% after inflation. In most of Canada, rents have a long way to fall before reversing the increases of the past several years.
		</p>

		<Footnotes footnotes={footnoteStore.footnotes} footnoteListTitle="Notes" />

		<div class="details">
			<h2>Data &amp; Methods</h2>
			<p>
				Asking rents come from <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201" target="_blank">Statistics Canada Table 46-10-0092-01</a>: quarterly rents for two-bedroom apartments in census metropolitan areas. They describe newly advertised units, not what sitting tenants pay. Cities need a first-quarter 2019 value and at least eight quarters of data, which leaves out Saguenay and Trois-Rivières.
			</p>
			<p>
				The map and small multiples show the net change since the first quarter of 2019, not the fall from each city's peak, because the question is how much of the earlier increase remains. After inflation, we restate the 2019 rent in first-quarter 2026 dollars using each province's <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000401" target="_blank">monthly consumer price index</a>.
			</p>
			<p>
				In the text, the two-year change compares the first quarter of 2026 with the first quarter of 2024, before inflation. A city's peak is its highest quarter after inflation, and the share clawed back is its fall from that peak divided by its rise from 2019 to the peak.
			</p>
			<p>
				For rents actually paid, we use the <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market" target="_blank">CMHC Rental Market Survey</a>, which each October records the average rent in occupied purpose-built rental apartments. The dumbbell chart runs from the asking-rent peak in the fourth quarter of 2023 (October 2023 for rents paid) to the latest data. The Canada figure averages the 40 metros with complete records, weighted by their rental units.
			</p>
			<p>
				The two sources cover different units, so we compare only changes, never dollar levels. A change in the CMHC average can also reflect new buildings entering the survey.
			</p>
			<p>
				The headlines are those containing the word "rent" or "rents" from Canadian news outlets between January 2019 and March 2026, collected through Media Cloud. A language model sorted them by whether they report rising or falling market rents; we dropped stories about other countries and items not about rent trends (48 headlines). Every remaining headline was then coded for context twice, independently, settling disagreements in favour of finding context.
			</p>
			<p>
				A headline gives some context if it says the change is small or slowing, that rents are still high or above an earlier level (or falling from a peak), that the trend differs elsewhere, or that it may not last. Records, streaks and bare figures do not count. Only headlines are read, so an article may say more. To check direction, we compared each headline with Statistics Canada's asking rents for the city and period it described.
			</p>
			<p>
				You can find all the data, code, and the full list of classified headlines on our <a href="https://github.com/schoolofcities/renters" target="_blank">GitHub repository</a>.
			</p>
		</div>

	</div>

	<Footer />

</main>

<style>
</style>
