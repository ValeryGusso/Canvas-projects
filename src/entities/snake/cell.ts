import { CellOptions, CellType, Coords } from './types'

export class Cell {
	private ctx
	private readonly size
	private readonly offset
	readonly coords: Coords
	readonly type: CellType

	constructor(ctx: CanvasRenderingContext2D, options: CellOptions) {
		this.ctx = ctx
		this.coords = { x: options.x, y: options.y }
		this.type = options.type
		this.size = options.size
		this.offset = options.offset
	}

	draw(isHead?: boolean) {
		this.ctx.fillStyle = this.type === 'apple' ? 'red' : isHead ? 'wheat' : 'olive'
		this.ctx.fillRect(
			this.offset.x + this.coords.x * this.size + 2,
			this.offset.y + this.coords.y * this.size + 2,
			this.size - 4,
			this.size - 4
		)
	}
}
