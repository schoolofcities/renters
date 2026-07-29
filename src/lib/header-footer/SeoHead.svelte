<script>
	/**
	 * Standard <svelte:head> tags (title, description, canonical, Open Graph,
	 * Twitter card) for a page on this site. Drop into any +page.svelte:
	 *
	 *   <SeoHead
	 *     title="Page Title"
	 *     description="One sentence description."
	 *     path="/some-subpage"
	 *     image="some-subpage-card.png"
	 *   />
	 *
	 * `path` is appended to the site origin for the canonical/og/twitter URLs.
	 * `image` is a filename under /static, resolved to a raw GitHub URL so it
	 * works for link-preview crawlers that don't run through the GitHub Pages
	 * build.
	 */
	let {
		title = '',
		description = '',
		path = '',
		image = '',
		locale = 'en_CA',
	} = $props();

	const SITE_ORIGIN = 'https://schoolofcities.github.io/renters';
	const RAW_ASSET_BASE = 'https://raw.githubusercontent.com/schoolofcities/renters/main/static';

	const pageUrl = `${SITE_ORIGIN}${path}`;
	const pageImage = image ? `${RAW_ASSET_BASE}/${image}` : '';
</script>

<svelte:head>
	<title>{title} | School of Cities</title>

	<meta name="description" content={description} />
	<meta name="author" content="School of Cities" />
	<meta rel="canonical" href={pageUrl} />

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
	{#if pageImage}
		<meta property="og:image" content={pageImage} />
	{/if}
	<meta property="og:locale" content={locale} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if pageImage}
		<meta name="twitter:image" content={pageImage} />
	{/if}
	<meta name="twitter:site" content={pageUrl} />
</svelte:head>
