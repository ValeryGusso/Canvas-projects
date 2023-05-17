export type GameOfLifeOptions = {
	min: number
	max: number
	alive: number
	fps: number
	scale: number
}

export type CellOptions = {
	x: number
	y: number
	isAlive: boolean
	size: number
	borderX: number
	paddingBottom: number
	canvasWidth: number
	canvasHeight: number
	offset: Offset
	settings: GameOfLifeOptions
}

export type Offset = {
	x: number
	y: number
}
