<script>
	let { 
        options = [], // array of {label, value} objects
        selectedValue = $bindable(), // currently selected value
        onSelect = () => {}, // callback function when option is selected
        label = "Select an option:" // label text displayed above buttons
    } = $props();
</script>

<div id="destext">
	<p class="chart-legend-title">
		{@html label}
	</p>
</div>

<div class="button-group">
	{#each options as option}
		<button
			class="toggle-button {selectedValue === option.value ? 'selected' : ''}"
			type="button"
			onclick={() => onSelect(option.value)}
		>
			{@html option.label}
		</button>
	{/each}
</div>

<style>
	.button-group {
		display: flex;
		margin-right: -10px;
		margin-top: 10px;
	}

	.toggle-button {
		width: 100%;
		padding: 6px 12px;
		margin-right: 10px;
		border: 1px solid var(--brandGray);
		border-radius: 5px;
		cursor: pointer;
		opacity: 0.5;
		background-color: var(--brandWhite);
		color: var(--brandGray90);
		user-select: none;
		font-family: OpenSans;
		font-size: 14px;
		font-weight: 600;
		/* Prevents mobile Safari/Chrome's automatic text-inflation ("font boosting"), which
		   targets short text in narrow flex columns exactly like these buttons and was making
		   this text render far larger than 14px on phones despite no media query changing it. */
		text-size-adjust: 100%;
		-webkit-text-size-adjust: 100%;
	}

	.toggle-button.selected {
		opacity: 1.0;
		border: 2px solid var(--brandLightBlue);
	}

	.toggle-button:hover {
		opacity: 1;
		transition: opacity 0.2s ease;
		border: 2px solid var(--brandMedBlue);
	}

	#destext {
		margin-bottom: 10px;
		margin-left: 0px;
	}

	#destext p {
		margin-bottom: -5px;
		line-height: 22px;
	}
</style>
