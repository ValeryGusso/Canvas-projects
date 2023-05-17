export type ImageOptions = {
	pixelSize: number
	pixelCount: number
	fps: number
}

export type ParentController = {
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	cursor: Cursor
}
export type Color = {
	r: number
	g: number
	b: number
	a: number
}
export interface PixelParams extends Color {
	x: number
	y: number
}

export type Colors = keyof Color

export type Cursor = {
	x: number
	y: number
	radius: number
	isActive: boolean
}
