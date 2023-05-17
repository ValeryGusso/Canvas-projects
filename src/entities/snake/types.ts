import { Cell } from './cell'

/* GAME */
export interface SnakeOptions {
	cellSize: number
	width: number
	height: number
	fps: number
}

export type Direction = 'left' | 'right' | 'up' | 'down'

export interface StackItem {
	snakeImage: Cell[]
	directions: AvailableDirection[]
	selected: Direction
}

export type AvailableDirection = {
	direction: Direction
	distance: number
	clearDistance: number
}

/* CELL */
export interface CellOptions {
	x: number
	y: number
	size: number
	offset: Coords
	type: CellType
}

export type Coords = {
	x: number
	y: number
}

export type CellType = 'snake' | 'apple'
