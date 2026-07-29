<script>
	/**
	 * Short, bold takeaway caption sat tight above a chart — meant to read on
	 * its own if the chart below is screenshotted out of context.
	 */
	let { text = '' } = $props();
</script>

<p class="chart-label">{text}</p>

<style>
	.chart-label {
		font-family: TradeGothicBold;
		font-weight: normal;
		font-size: 19px;
		line-height: 24px;
		color: var(--brandGray90);
		text-align: left;
		margin-top: 28px;
		margin-bottom: 8px;
		padding: 0px;
	}

	@media screen and (max-width: 600px) {
		.chart-label {
			font-size: 17px;
			line-height: 22px;
		}
	}
</style>
