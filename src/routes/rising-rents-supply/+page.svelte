<script>
	import '../../assets/global-styles.css';

	import Logo from '$lib/header-footer/LogoTop.svelte';
	import TitleStandard from '$lib/header-footer/TitleStandard.svelte';
	import AuthorDate from '$lib/header-footer/AuthorDate.svelte';
	import Footer from '$lib/header-footer/Footer.svelte';
	import SeoHead from '$lib/header-footer/SeoHead.svelte';
	import ChartLabel from '$lib/chart-addons/ChartLabel.svelte';
	import RentIncreaseBarChart from '$lib/charts/RentIncreaseBarChart.svelte';
	import RentBenchmarkChart from '$lib/charts/RentBenchmarkChart.svelte';
	import SupplyRentScatterPair from '$lib/charts/SupplyRentScatterPair.svelte';
	import CityPeriodScatter from '$lib/charts/CityPeriodScatter.svelte';

	import vis2Data from '$data/rising-rents-supply/vis2_city_rent_vs_guideline.json';
	import vis3aRaw from '$data/rising-rents-supply/vis3a_supply_vs_rent_yoy.json';
	import vis3bRaw from '$data/rising-rents-supply/vis3b_demand_adjusted_supply_vs_rent.json';
	import vis4Data from '$data/rising-rents-supply/vis4_city_period_supply_rent.json';
</script>


<SeoHead
	title="Rising Rents and Supply in Ontario's Cities"
	description="Exploring rental housing affordability over time, especially with large rent increases recently even while supply has gone up."
	path="/rising-rents-supply"
	image="rising-rents-supply-card.png"
/>


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
			We all expect rent to crawl up bit by bit over the years – between inflation, price hikes, and bills, a modest increase comes as little surprise. But in Ontario, average rents have not just crept up – in recent years they have pulled away from several familiar benchmarks, all at once.
		</p>

		<p>
			Using Canada Mortgage and Housing Corporation (CMHC) primary rental market data from 1990 to 2025, we compared average rent in Ontario against inflation, median income, and Ontario's rent control guidelines. Beginning in 1990 with average rent at $576, the chart below shows how that amount would have changed if it followed each benchmark.
		</p>

		<ChartLabel text="Rent pulls away from several benchmarks" />
		<RentBenchmarkChart />

		<p>
			For much of the earlier period, average rent moved more closely alongside these measures. The gap began to widen in the mid-2010s, with average rent surpassing the rent control benchmark in 2018. By 2025, average rents had risen to roughly three times their 1990 level; inflation, median income, and the rent control benchmark rose by about two times.
		</p>

		<p>
			The rent control benchmark does not necessarily show what every unit's rent legally should be. Ontario's rent guideline applies unevenly across the rental market – rents can reset when a tenant leaves, newly occupied units built after 2018 are exempt from the guideline, and landlords can apply for above-guideline increases in certain circumstances. In a <a href="https://policyalternatives.ca/sites/default/files/uploads/publications/Ontario%20Office/2024/04/rent-control-in-ontario.pdf" target="_blank">2024 report on rent control in Ontario</a>, Ricardo Tranjan and Paulina Vargatoth describe these as major gaps in the system, arguing that the province's rent control framework limits annual increases for many sitting tenants but does not fully regulate the market average.
		</p>

		<p>
			Using this as a benchmark gives us a way to compare actual rent growth with the pace of increase that Ontario policy has treated as reasonable for many regulated tenancies. A <a href="https://reframehousing.org/merits-and-limits-of-rent-stabilization" target="_blank">School of Cities report on rent stabilization</a> makes a similar point – rent control is not a complete housing policy on its own, but it can help preserve affordability and reduce displacement when paired with other measures.
		</p>

		<p>
			Average rents have moved well beyond the guideline, and the pattern holds at finer detail too – across Ontario cities, the increase in average rent from 2018 to 2025 often exceeded what the guideline benchmark would have produced by hundreds of dollars per month.
		</p>

		<ChartLabel text="The excess increase above rent guidelines is widespread across cities" />
		<RentIncreaseBarChart data={vis2Data} />

		<p>
			Toronto remains Ontario's largest and most expensive rental market, but the gap is not limited to the GTA. Some of the largest increases appeared in smaller and mid-sized markets, including Guelph, Cambridge, and Newmarket, where average monthly rents rose by $626, $771, and $923 respectively from 2018 to 2025.
		</p>

		<p>
			This city-level pattern matters because Ontario's rental market is not a single one. Cities differ in vacancy, population growth, student demand, wages, construction activity, and the mix of older regulated buildings and newer market rate units. They also differ in who owns the rental stock, how often units turn over, and how much of the housing system is public, non-profit, co-operative, or fully market rate.
		</p>

		<h3>More than meets the (suppl)eye</h3>

		<p>
			Discussion of housing affordability often focuses on the <a href="https://www.thestar.com/business/opinion/every-level-of-government-admits-theres-a-gta-housing-crisis-so-why-is-no-one/article_6971bd92-9c40-46e1-b1ed-053a3e9507ab.html" target="_blank">need to</a> <a href="https://www.cbc.ca/news/canada/toronto/ontario-housing-demand-foi-1.7566851" target="_blank">build</a> <a href="https://nationalpost.com/news/canada/housing-prices-would-be-10-lower-if-canada-had-kept-pace-with-u-s-cmhc-says" target="_blank">more</a> <a href="https://www.thestar.com/business/opinion/to-build-housing-toronto-must-get-out-of-its-own-way/article_0bd4b081-a35a-4bff-89a8-ba1bab57bbb3.html" target="_blank">homes</a> – supply and demand. When vacancy rates are low, tenants have fewer alternatives and landlords have more pricing power. The data supports this part of the story – lower vacancy rates are strongly associated with faster rent growth in Ontario, with the same broad pattern appearing in many cities.
		</p>

		<p>
			But vacancy rates alone do not settle the whole question. Controlling for vacancy rates across the years before and after 2018, rents continued to rise – even as Ontario's primary rental market grew far more quickly than it had in earlier periods. That doesn't mean supply is irrelevant, but rather that the relationship between new supply and rent outcomes is more complex than counting units.
		</p>

		<ChartLabel text="More rental supply does not clearly correspond to slower rent growth" />
		<SupplyRentScatterPair {vis3aRaw} {vis3bRaw} />

		<p>
			Looking year by year, faster growth in Ontario's primary rental stock did not clearly correspond to slower rent growth. The relationship remained weak and statistically insignificant after adjusting rental stock growth by population. This population-adjusted measure is not a full demand model – it does not account for migration, students, household formation, income changes, or the secondary rental market. But it does test whether the supply pattern changes when new units are scaled to the size of the province – and there is little change.
		</p>

		<p>
			This is where the kind of supply matters. A <a href="https://schoolofcities.utoronto.ca/housing-supply-mix-strategy/" target="_blank">School of Cities report on Canada's housing supply mix</a> argues that numeric targets alone are not enough – Canada needs more purpose-built rental, non-market, social, not-for-profit, and co-operative housing, reinstating a legacy of funding social housing, <a href="https://schoolofcities.utoronto.ca/wp-content/uploads/2025/04/School-of-Cities_Housing-Crisis-Final3.pdf" target="_blank">discontinued in</a> <a href="https://www.cbc.ca/radio/sunday/federal-social-housing-1.6946376" target="_blank">the 1990s</a>. The same report notes that adding only market-rate housing can only slowly reduce prices, and not in the near term.
		</p>

		<p>
			The city-level pattern is also unclear and lacking a strong relationship. Some cities added primary rental units and still saw large rent increases, while others saw modest changes in rental stock while rents still jumped.
		</p>

		<ChartLabel text="Across cities, supply growth does not tell one simple story" />
		<CityPeriodScatter data={vis4Data} />

		<p>
			One possible explanation is that new rental construction is often concentrated in places where demand is already strong and rent pressure is already high. In those markets, new units may be necessary, but not sufficient, to bring rents back in line with incomes, inflation, or the rent guideline.
		</p>

		<p>
			Ownership and financing also shapes how rent pressure is translated into rents. A <a href="https://reframehousing.org/the-financialization-of-housing" target="_blank">School of Cities report on financialization</a> describes a long shift in which housing is increasingly treated as an investment asset, rather than only as a place to live. Financial landlords play an increasingly large role in Canada's purpose-built rental sector, with the top 25 consolidating <a href="https://herongatetenants.ca/wp-content/uploads/2021/09/The-financialization-of-Canadian-multi-family-rental-housing-From-trailer-to-tower.pdf" target="_blank">about one-fifth</a> of private purpose-built apartment stock in recent years, with recent research by Martine August and Cloé St-Hilaire showing <a href="https://theconversation.com/financial-firms-are-driving-up-rent-in-toronto-and-targeting-the-most-vulnerable-tenants-255935" target="_blank">corporate landlords charge higher rents</a>.
		</p>

		<p>
			The CMHC data used does not identify whether a building is owned by a small landlord, a large corporate landlord, a non-profit, or otherwise. It also does not identify turnover, above-guideline increases, financing costs, or whether new units are public, non-profit, rent-regulated, or fully market rate.
		</p>

		<p>
			Those omissions are part of the point – unit counts alone do not capture the full rental system. A rent-regulated apartment occupied by a long-term tenant is different from a vacant unit reset to market rent. A new market rate apartment is different from a non-profit, co-operative, or public rental home. And a building managed for long-term affordability may not operate under the same pressures as one managed primarily as a financial asset.
		</p>

		<p>
			Ontario's rent increases are more than a story of supply and demand. Supply and vacancy matter. But so do the kind of housing being built, who owns it, what rents are charged, and what protections apply once it enters the market.
		</p>

		<div class="details">
			<h2>Data &amp; Methodology</h2>
			<p>
				We use the <a href="https://www03.cmhc-schl.gc.ca/hmip-pimh/en/TableMapChart/" target="_blank">CMHC Rental Market Survey</a> as our primary source for rent and rental supply data. CMHC's primary rental market covers purpose-built rental apartments and does not include the full rental universe, such as rented condos, basement apartments, or other secondary-market units. "Average rent" refers to CMHC's average across all bedroom types, while "rental units" refers to CMHC's surveyed unit count for each city and year.
			</p>
			<p>
				Suppressed CMHC values (<code>**</code>) are treated as missing and are not interpolated. Values marked by CMHC as "negligible change" (<code>++</code>) are treated as zero.
			</p>
			<p>
				The benchmark index and the year-over-year supply/rent scatterplots use Ontario-wide CMHC totals. The city gap chart and the city-level supply/rent scatterplot use individual municipalities. Vaughan and Pickering are excluded from the city-level charts because of data limitations.
			</p>
			<p>
				The <a href="https://www.ontario.ca/page/residential-rent-increases" target="_blank">rent control guidelines</a> come from the Ontario Ministry of Municipal Affairs and Housing. <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000501&pickMembers%5B0%5D=1.14&cubeTimeFrame.startYear=1990&cubeTimeFrame.endYear=2025&referencePeriods=19900101%2C20250101" target="_blank">CPI</a>, <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710000901&cubeTimeFrame.startMonth=01&cubeTimeFrame.startYear=1990&cubeTimeFrame.endMonth=10&cubeTimeFrame.endYear=2025&referencePeriods=19900101%2C20251001" target="_blank">population</a>, and <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1110019001&pickMembers%5B0%5D=1.8&cubeTimeFrame.startYear=1990&cubeTimeFrame.endYear=2024&referencePeriods=19900101%2C20240101" target="_blank">income data</a> come from Statistics Canada. The benchmark index sets CPI, the rent control guidelines, and median income to 576 in 1990 and tracks their relative growth through 2025. We use 576 as it was the average rent in Ontario for 1990. The income series ends in 2024, the latest year available from Statistics Canada.
			</p>
			<p>
				The rent control benchmark is hypothetical. For each city, we start with its 2018 average rent and compound Ontario's annual rent guideline forward through 2025. We then compare that benchmark rent with the city's actual 2025 average rent. The resulting dollar gap is city-specific, while the guideline itself is province-wide and therefore the same for every city.
			</p>
			<p>
				We focus on 2018 to 2025 for three reasons: it is the most recent period in the dataset, it is when the Ontario average rent line moves clearly beyond the rent control benchmark, and it follows Ontario's 2018 <a href="https://www.cbc.ca/news/canada/toronto/how-does-rent-control-in-ontario-work-1.6978670" target="_blank">exemption</a> of newly occupied units from the provincial rent guideline.
			</p>
			<p>
				For the supply/rent scatterplots, we compare annual rent growth with two supply measures: the annual percentage change in primary rental units and the annual change in primary rental units per 1,000 residents. The second measure is an absolute change, not a percentage change, so that supply additions are scaled to population without double-normalizing the measure.
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
