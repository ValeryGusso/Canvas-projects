import { CellOptions } from './types'

export class Cell {
	private ctx

	readonly x
	readonly y
	isAlive
	neighbours

	private readonly size
	private readonly borderX
	private readonly paddingBottom
	private readonly offset
	private readonly canvasWidth
	private readonly canvasHeight
	private readonly settings

	constructor(ctx: CanvasRenderingContext2D, options: CellOptions) {
		this.ctx = ctx

		this.x = options.x
		this.y = options.y
		this.isAlive = options.isAlive
		this.neighbours = 0
		this.size = options.size
		this.canvasWidth = options.canvasWidth
		this.canvasHeight = options.canvasHeight
		this.borderX = options.borderX
		this.paddingBottom = options.paddingBottom
		this.offset = options.offset
		this.settings = options.settings
	}

	draw() {
		const x = this.borderX + (this.x + this.offset.x) * (this.size * this.settings.scale)
		const y = (this.y + this.offset.y) * (this.size * this.settings.scale)
		if (
			x < this.borderX ||
			x + 1 > this.canvasWidth - this.borderX ||
			y + 1 > this.canvasHeight - this.paddingBottom ||
			!this.isAlive
		) {
			return
		}
		this.ctx.fillStyle = 'olive'
		this.ctx.fillRect(x, y, this.size * this.settings.scale, this.size * this.settings.scale)
	}
}
