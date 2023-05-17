import { gameOfLifeGreeteng } from '../../assets/constants/constants'
import { Cell } from './cell'
import { GameOfLifeOptions, Offset } from './types'

export class GameOfLife {
	private readonly canvas
	private readonly ctx

	/* SCALE AND LISTENERS */
	private mousedown
	private mouseup
	private mousemove
	private mouseleave
	private wheel
	private delay = 0
	private isMove = false
	private timer: ReturnType<typeof setTimeout> | null = null
	private prevCoords: Offset = { x: 0, y: 0 }
	private offset: Offset = { x: 0, y: 0 }

	/* LIFE CICLE */
	private paused = true
	private prevTime = 0 //previus time stamp
	private dt = 0 // delta time
	private id = 0 // requestAnimationFrame ID
	private get ttf() {
		return 1000 / this.fps // time to frame
	}
	private get fps() {
		return this.options.fps
	}

	/* GAME */
	private cells: Map<string, Cell> = new Map()
	private generation = 0
	private totalCells = 0
	private options: GameOfLifeOptions

	private readonly cellSize = 20
	private readonly paddingBottom = 40
	private get fieldWidth() {
		return this.cellSize * this.width
	}
	private get fieldHeight() {
		return this.cellSize * this.height
	}
	private get canvasWidth() {
		return Math.floor(window.innerWidth * 0.8)
	}
	private get canvasHeight() {
		return Math.floor(window.innerHeight * 0.75)
	}
	private get borderX() {
		const full = Math.floor(window.innerWidth * 0.8 - this.cellSize * this.width)
		return Math.abs(Math.floor((full % this.cellSize) / 2))
	}
	private get width() {
		return Math.floor((window.innerWidth * 0.8) / this.cellSize)
	}
	private get height() {
		return Math.floor((window.innerHeight * 0.75) / this.cellSize) - this.paddingBottom / this.cellSize
	}

	constructor(canvas: HTMLCanvasElement, options: GameOfLifeOptions) {
		this.canvas = canvas
		const ctx = this.canvas.getContext('2d', { willReadFrequently: true })
		if (!ctx) {
			throw new Error('Context dont exist')
		}
		this.ctx = ctx

		this.options = options

		canvas.width = this.canvasWidth
		canvas.height = this.canvasHeight

		this.mousedown = (e: MouseEvent) => {
			this.delay = Date.now()
			this.prevCoords = { x: e.offsetX - this.offset.x * this.cellSize, y: e.offsetY - this.offset.y * this.cellSize }
			this.timer = setTimeout(() => {
				this.isMove = true
			}, 250)
		}

		this.mouseup = (e: MouseEvent) => {
			if (Date.now() - this.delay < 250) {
				if (
					e.offsetX > this.borderX &&
					e.offsetX < this.canvasWidth - this.borderX &&
					e.offsetY < this.canvasHeight - this.paddingBottom
				) {
					this.manualAddCell(e.offsetX, e.offsetY)
				}

				if (this.timer) {
					clearTimeout(this.timer)
				}
			}
			this.isMove = false
		}

		this.mousemove = (e: MouseEvent) => {
			if (
				e.offsetX > this.borderX &&
				e.offsetX < this.canvasWidth - this.borderX &&
				e.offsetY < this.canvasHeight - this.paddingBottom &&
				this.isMove
			) {
				this.offset.x = -Math.floor((this.prevCoords.x - e.offsetX) / this.cellSize)
				this.offset.y = -Math.floor((this.prevCoords.y - e.offsetY) / this.cellSize)
				this.draw()
			}
		}

		this.mouseleave = () => {
			if (this.timer) {
				clearTimeout(this.timer)
			}
			this.isMove = false
		}

		this.wheel = (e: WheelEvent) => {
			if (e.deltaY > 0 && this.options.scale > 0.05) {
				this.options.scale -= 0.05
			}
			if (e.deltaY < 0 && this.options.scale < 1.95) {
				this.options.scale += 0.05
			}
			this.redraw()
		}

		this.canvas.addEventListener('mousedown', this.mousedown)
		this.canvas.addEventListener('mouseup', this.mouseup)
		this.canvas.addEventListener('mousemove', this.mousemove)
		this.canvas.addEventListener('mouseleave', this.mouseleave)
		this.canvas.addEventListener('wheel', this.wheel)

		this.greeteng()
		this.draw()
	}

	/* UTILS */
	private generateIndex(x: number, y: number) {
		return `x${x}_y${y}`
	}

	private isAvive(x: number, y: number) {
		const check = this.cells.get(this.generateIndex(x, y))
		return check ? check.isAlive : false
	}

	private isExist(x: number, y: number) {
		return this.cells.has(this.generateIndex(x, y))
	}

	private manualAddCell(x: number, y: number) {
		this.totalCells++
		const col = Math.floor((x - this.borderX) / (this.cellSize * this.options.scale)) - this.offset.x
		const row = Math.floor(y / (this.cellSize * this.options.scale)) - this.offset.y

		if (!this.isAvive(col, row)) {
			this.cells.set(
				this.generateIndex(col, row),
				new Cell(this.ctx, {
					x: col,
					y: row,
					size: this.cellSize,
					canvasWidth: this.canvasWidth,
					canvasHeight: this.canvasHeight,
					offset: this.offset,
					borderX: this.borderX,
					paddingBottom: this.paddingBottom,
					isAlive: true,
					settings: this.options,
				})
			)
		} else {
			this.removeCell(col, row)
		}
		this.draw()
	}

	private removeCell(x: number, y: number) {
		this.cells.delete(this.generateIndex(x, y))
	}

	private setNeighbours(cell: Cell) {
		cell.neighbours = 0
		for (let x = -1; x < 2; x++) {
			for (let y = -1; y < 2; y++) {
				if (x === 0 && y === 0) {
					continue
				}

				if (!this.isExist(cell.x + x, cell.y + y) && cell.isAlive) {
					this.cells.set(
						this.generateIndex(cell.x + x, cell.y + y),
						new Cell(this.ctx, {
							x: cell.x + x,
							y: cell.y + y,
							size: this.cellSize,
							canvasWidth: this.canvasWidth,
							canvasHeight: this.canvasHeight,
							offset: this.offset,
							borderX: this.borderX,
							paddingBottom: this.paddingBottom,
							isAlive: false,
							settings: this.options,
						})
					)
				}

				if (this.isAvive(cell.x + x, cell.y + y)) {
					cell.neighbours++
				}
			}
		}
	}

	private greeteng() {
		for (let i = 0; i < gameOfLifeGreeteng.x.length; i++) {
			this.cells.set(
				this.generateIndex(gameOfLifeGreeteng.x[i] + 10, gameOfLifeGreeteng.y[i] + 8),
				new Cell(this.ctx, {
					x: gameOfLifeGreeteng.x[i] + 10,
					y: gameOfLifeGreeteng.y[i] + 8,
					size: this.cellSize,
					canvasWidth: this.canvasWidth,
					canvasHeight: this.canvasHeight,
					offset: this.offset,
					borderX: this.borderX,
					paddingBottom: this.paddingBottom,
					isAlive: true,
					settings: this.options,
				})
			)
		}
		this.totalCells = gameOfLifeGreeteng.x.length
	}

	/* LIFE CICLE */
	private lifeCicle(cell: Cell) {
		if (cell.isAlive) {
			cell.isAlive = cell.neighbours > this.options.min && cell.neighbours < this.options.max
		} else {
			cell.isAlive = cell.neighbours === 3
		}
	}

	private update(dt: number) {
		this.dt += dt - this.prevTime
		this.prevTime = dt
		// console.log(this.dt, this.fps)
		if (!this.paused && this.dt > this.ttf) {
			this.dt = 0
			this.oneStep()
		}

		if (!this.totalCells) {
			this.paused = true
		}

		if (!this.paused) {
			this.id = requestAnimationFrame(this.update.bind(this))
		}
	}

	/* DRAW METHODS */
	private clear() {
		this.ctx?.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
	}

	private drawGrid() {
		this.ctx.strokeStyle = '#adacea41'
		this.ctx.fillStyle = '#adacea'
		this.ctx.font = '24px Ubuntu'
		this.ctx.textAlign = 'center'

		if (this.options.scale > 0.2) {
			/* DRAW X */
			for (let y = 0; y <= this.height / this.options.scale; y++) {
				this.ctx.beginPath()
				this.ctx.moveTo(this.borderX, y * this.cellSize * this.options.scale)
				this.ctx.lineTo(this.fieldWidth + this.borderX, y * this.cellSize * this.options.scale)
				this.ctx.stroke()
			}

			/* DRAW Y */
			for (let x = 0; x <= this.width / this.options.scale; x++) {
				this.ctx.beginPath()
				this.ctx.moveTo(this.borderX + x * this.cellSize * this.options.scale, 0)
				this.ctx.lineTo(this.borderX + x * this.cellSize * this.options.scale, this.fieldHeight)
				this.ctx.stroke()
			}
		}

		this.ctx.fillText(
			`Generation: ${this.generation} / Total cells: ${this.totalCells}`,
			this.fieldWidth / 2,
			this.canvasHeight - 10
		)
	}

	private draw() {
		this.clear()
		this.drawGrid()
		this.cells.forEach(cell => {
			cell.draw()
		})
	}

	/* PUBLICK CONTROLLERS */
	resize() {
		this.canvas.width = this.canvasWidth
		this.canvas.height = this.canvasHeight

		if (this.width >= 80) {
			this.greeteng()
		}

		this.draw()
	}

	redraw() {
		// this.offset.x = Math.floor(this.fieldWidth / (this.cellSize * this.options.scale) / 5)
		// this.offset.y = Math.floor(this.fieldHeight / (this.cellSize * this.options.scale) / 5)
		this.offset.x = Math.floor(this.fieldWidth / this.cellSize / 2)
		this.offset.y = Math.floor(this.fieldHeight / this.cellSize / 2)
		this.draw()
	}

	remove() {
		this.canvas.removeEventListener('mousedown', this.mousedown)
		this.canvas.removeEventListener('mouseup', this.mouseup)
		this.canvas.removeEventListener('mousemove', this.mousemove)
		this.canvas.removeEventListener('mouseleave', this.mouseleave)
		this.canvas.removeEventListener('wheel', this.wheel)
		this.paused = true
		this.cells = new Map<string, Cell>()
		this.totalCells = 0
		this.generation = 0
		cancelAnimationFrame(this.id)
		this.clear()
	}

	start() {
		this.paused = false
		this.id = requestAnimationFrame(this.update.bind(this))
	}

	stop() {
		this.paused = true
	}

	reset() {
		this.paused = true
		this.cells = new Map<string, Cell>()
		this.totalCells = 0
		this.generation = 0
		this.draw()
	}

	oneStep() {
		this.generation++
		this.totalCells = 0

		this.cells.forEach(cell => {
			if (cell.isAlive) {
				this.totalCells++
			}
			this.setNeighbours(cell)
		})

		this.cells.forEach(cell => {
			if (!cell.isAlive && cell.neighbours !== 3) {
				this.removeCell(cell.x, cell.y)
			} else {
				this.lifeCicle(cell)
			}
		})
		this.draw()
	}
}
