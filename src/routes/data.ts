import { writable } from 'svelte/store'

export interface TimedKeyEvent {
	key: string
	timestamp: number
}

export type Recording = TimedKeyEvent[]

export const fromString = (str: string): Recording =>
	Array.from(str).map((key, i) => ({
		key,
		timestamp: i * 500 + Math.random() * 100
	}))

export const testData: Recording = fromString('hello world')

export const activeKey = writable<TimedKeyEvent['key']>('')
