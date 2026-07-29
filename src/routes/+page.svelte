<script>
	import '../assets/global-styles.css';
	import { base } from '$app/paths';

	import Logo from '$lib/header-footer/LogoTop.svelte';
	import TitleStandard from '$lib/header-footer/TitleStandard.svelte';
	import Footer from '$lib/header-footer/Footer.svelte';
	import SeoHead from '$lib/header-footer/SeoHead.svelte';
</script>

<SeoHead
	title="Renters"
	description="A School of Cities web project examining housing affordability and rental market trends in Ontario."
	path="/"
	image="rising-rents-supply-card.png"
/>

<main>
	<Logo logoType="Blue" backgroundColor="var(--brandWhite)" />

	<TitleStandard
		title="Housing Affordability in Ontario"
		subtitle="Exploring rental market trends and policy impacts"
	/>

	<div class="text">
		<p>
			Learn more about how rent has changed across Ontario cities by <a href="{base}/rising-rents-supply">viewing our analysis</a>.
		</p>
	</div>

	<Footer />
</main>