<script>
	import '../assets/global-styles.css';

	import Logo from '$lib/header-footer/LogoTop.svelte';
	import TitleStandard from '$lib/header-footer/TitleStandard.svelte';
	import Footer from '$lib/header-footer/Footer.svelte';
</script>

<svelte:head>
	<title>Renters | School of Cities</title>
	<meta name="description" content="A School of Cities web project examining housing affordability and rental market trends in Ontario." />
	<meta name="author" content="School of Cities" />
</svelte:head>

<main>
	<Logo logoType="Blue" backgroundColor="var(--brandWhite)" />

	<TitleStandard
		title="Housing Affordability in Ontario"
		subtitle="Exploring rental market trends and policy impacts"
	/>

	<div class="text">
		<p>
			Learn more about how rent has changed across Ontario cities by <a href="/higher-rents-higher-supply">viewing our analysis</a>.
		</p>
	</div>

	<Footer />
</main>