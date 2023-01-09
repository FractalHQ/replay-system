import type { Recording, TimedKeyEvent } from './data'
import { testData, activeKey } from './data'
import { Subject } from 'rxjs'
import { tick } from 'svelte'

export type PlayState = 'started' | 'stopped' | 'paused' | 'resumed' | 'reset'

type TimelineEventType = keyof TimelineEvents
type TimelineEventPayload = PlayState | TimedKeyEvent

interface TimelineEvents {
	keys: Subject<TimedKeyEvent>
	playback: Subject<PlayState>
}

export class Timeline {
	events: TimelineEvents = {
		keys: new Subject(),
		playback: new Subject()
	} as const
	//  Pseudo nested svelte sugar.
	get $events() {
		return {
			keys: this.events.keys.asObservable(),
			playback: this.events.playback.asObservable()
		}
	}

	data: Recording = testData
	load(data: TimedKeyEvent[]) {
		// this.data = JSON.parse(JSON.stringify(data))
		this.data = data
		this.reset()
	}

	queue: TimedKeyEvent[] = []
	next() {
		const event = this.queue.shift()
		if (event) {
			this.dispatchEvent('keys', event)
			activeKey.set(event.key)
		} else {
			this.stop()
		}
	}

	// Time
	refreshRate = 200
	startTime = 0
	lastTick = 0
	lastPause = 0
	get elapsed() {
		return this.lastTick - this.startTime
	}

	// Playback
	_state: PlayState = 'stopped'
	get state() {
		return this._state
	}
	set state(value: PlayState) {
		this._state = value
		this.dispatchEvent('playback', value)
	}

	get started() {
		return this.state === 'started'
	}
	get stopped() {
		return this.state === 'stopped'
	}
	get paused() {
		return this.state === 'paused'
	}

	async dispatchEvent(type: TimelineEventType, value: TimelineEventPayload) {
		await tick()
		switch (type) {
			case 'keys':
				this.events.keys.next(value as TimedKeyEvent)
				break
			case 'playback':
				this.events.playback.next(value as PlayState)
				break
		}

		console.log(type, value)
	}

	// Controls
	start() {
		if (this.paused) return this.resume()

		this.state = 'started'
		this.startTime = Date.now()
		this.lastTick = Date.now()
		this.tick()

		console.log('start', this.elapsed)
	}
	stop() {
		this.reset()
		this.startTime = 0
		this.state = 'stopped'
	}
	pause() {
		this.lastPause = Date.now()
		this.state = 'paused'
	}
	private resume() {
		if (!this.paused) return
		const lastStartTime = this.startTime
		this.startTime = lastStartTime + (Date.now() - this.lastPause)
		this.state = 'started'
		this.tick()
	}
	private reset() {
		this.queue = JSON.parse(JSON.stringify(this.data))
		this.startTime = 0
		this.lastTick = 0
		this.lastPause = 0
		this.events.playback.next('reset')
	}

	// Render loop
	private tick() {
		if (this.state !== 'started') return

		requestAnimationFrame(this.tick.bind(this))

		const now = Date.now()

		const elapsed = now - this.lastTick

		if (elapsed < this.refreshRate) return

		this.lastTick += elapsed

		// Check if we need to play the next event
		if (this.queue.length > 0) {
			const nextEvent = this.queue[0]
			if (nextEvent.timestamp <= this.elapsed) {
				this.next()
			}
		} else this.stop()
	}
}
