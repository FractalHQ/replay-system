<script lang="ts">
	import { testData, activeKey, type TimedKeyEvent, fromString } from './data'
	import { Timeline } from './Timeline'
	import { onDestroy } from 'svelte'

	const timeline = new Timeline()
	timeline.load(testData)

	// Debug util to modify the timeline data.
	let textarea: HTMLTextAreaElement

	// Debug util to visualize fired events.
	let eventLog: TimedKeyEvent[] = []

	// Subscribe to key events to update the event log.
	const keyEvents = timeline.events.keys.subscribe((keyEvent) => {
		eventLog = [...eventLog, keyEvent]
	})

	// Subscribe to playback events to update playback controls ui.
	let playback = false
	const playbackEvents = timeline.events.playback.subscribe((state) => {
		playback = !playback
		if (state.match(/stopped/)) {
			eventLog = []
		}
	})

	// Update the timeline data when the textarea changes.
	let data = testData
	function updateData() {
		if (timeline.started) timeline.stop()
		data = fromString(textarea.value)
		timeline.load(data)
	}

	onDestroy(() => {
		keyEvents?.unsubscribe()
		playbackEvents?.unsubscribe()
	})
</script>

<main>
	{#key playback}
		<div class="controls">
			{#key $activeKey}
				<button on:click={() => timeline.start()} class:disabled={!timeline.stopped}>Start</button>
				<button on:click={() => timeline.stop()}>Stop</button>
				<button on:click={() => timeline.pause()}>Pause</button>
				<label for="refreshRate"
					>Refresh Rate<input type="number" bind:value={timeline.refreshRate} /></label
				>

				<div class="gap" />
				<div class="time state"><span>state:</span> {timeline.state}</div>
			{/key}
		</div>

		<section>
			<h2>Queue</h2>
			<div class="keys">
				{#each timeline.queue as e (e.timestamp)}
					<div class:active={e.key === $activeKey} class="key">
						{e.key}
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2>Events</h2>
			<div class="event-log">
				{#each eventLog as keyEvent (keyEvent.timestamp)}
					{@const key = keyEvent.key}

					<p class="key">
						{key}
					</p>
				{/each}
			</div>
		</section>
	{/key}
	<textarea
		value={String(testData.map(({ key }) => key).join(''))}
		bind:this={textarea}
		on:input={updateData}
	/>

	<pre>data: {JSON.stringify(data, null, 2)}
	</pre>
</main>

<style lang="scss">
	$dark: #333;
	$light: #c5c5c5;

	main {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		height: min(100%, 90vh);
		max-width: 50rem;
		margin: 3rem auto auto;
		padding: 1rem;

		border: 1px solid $dark;
	}

	h2 {
		font-size: 1.1rem;
		text-align: center;
		width: fit-content;
		margin: 0 auto;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.state {
			width: 6rem;
			text-align: center;
		}

		.gap {
			width: 1rem;
		}

		.time {
			display: flex;
			font-size: 0.75rem;
			margin-right: 0.5rem;

			border: 1px solid $dark;
			padding: 0.25rem 0.5rem;
			border-radius: 0.25rem;

			&:not(.state) {
				width: 30%;
			}

			span {
				opacity: 0.5;
			}
		}
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		border: 1px solid $dark;
		border-radius: 0.5rem;

		min-height: 10rem;
		padding: 1rem;
	}

	.keys,
	.event-log {
		display: flex;
		gap: 0.25rem;
	}

	.key {
		display: grid;
		place-items: center;

		width: 2rem;
		height: 2rem;

		// background: $dark;
		border: 1px solid darken($light, 25%);
		color: $light;
		border-radius: 0.5rem;

		text-align: center;
		font-size: 1rem;
	}

	input,
	textarea {
		background: darken($dark, 10%);
		color: $light;

		border: none;
		border-radius: 0.15rem;
		outline: 1px solid darken($dark, 5%);
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.25rem;

		padding: 0.25rem;

		font-size: 0.5rem;
		white-space: nowrap;
	}

	input {
		width: 3rem;
		padding: 0.25rem;

		font-size: 0.8rem;
		text-align: center;
	}

	textarea {
		width: min(20rem, 90%);
		min-height: 5rem;
		margin: auto;

		padding: 1rem;

		box-shadow: 0 0.1rem 1rem #0003;
	}

	pre {
		width: min(20rem, 90%);
		margin: auto;
		padding: 1rem;

		background: $dark;
		color: $light;

		white-space: pre-wrap;

		font-size: 0.5rem;
	}
</style>
