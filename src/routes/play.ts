import type { TimedKeyEvent } from './data'

export interface PlayParams {
	keyEvent: TimedKeyEvent
	duration: number
}

export const playKey = (node: HTMLElement, params: PlayParams): SvelteActionReturnType => {
	// const { key, timestamp } = node.dataset;
	const {
		keyEvent: { key }
	} = params

	const event = new KeyboardEvent('keydown', {
		key,
		code: key,
		bubbles: true,
		cancelable: true
	})
	node.dispatchEvent(event)

	// add the animation in class
	node.animate(
		[
			{
				transform: 'scale(0.5)',
				opacity: 0
			},
			{
				transform: 'scale(1)',
				opacity: 1
			}
		],
		{
			duration: 300,
			easing: 'ease-in-out'
		}
	)

	setTimeout(() => {
		// node.remove()
	}, params.duration ?? 3000)
}
