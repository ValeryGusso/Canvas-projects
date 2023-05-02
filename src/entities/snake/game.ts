import { Cell } from './cell'
import { AvailableDirection, Direction, SnakeOptions, StackItem } from './types'

export class Game {
	private readonly canvas
	private ctx

	private readonly border = 50
	private readonly canvasWidth
	private readonly canvasHeight
	private readonly fieldWidth
	private readonly fieldHeight
	private readonly width
	private readonly height
	private readonly cellSize

	private direction: Direction = 'right'
	private apple: Cell
	private snake: Cell[] = []
	private score = 0
	private isOver = false
	private paused = true

	private readonly maxStack = 50 // max stack length
	private calculateTime = 0 // time to calculate next step
	private iterations = 0 // iterations spent count

	private prevTime = 0 //previus time stamp
	private dt = 0 // delta time
	private fps = 30 // frames per second(game speed)
	private ttf = 1000 / this.fps // time to frame

	constructor(canvas: HTMLCanvasElement, options: SnakeOptions) {
		this.canvasWidth = options.cellSize * options.width + this.border * 2
		this.canvasHeight = options.cellSize * options.height + this.border * 2
		this.fieldWidth = options.cellSize * options.width
		this.fieldHeight = options.cellSize * options.height
		this.width = options.width
		this.height = options.height
		this.cellSize = options.cellSize

		canvas.width = this.canvasWidth
		canvas.height = this.canvasHeight

		this.canvas = canvas
		this.ctx = this.canvas.getContext('2d')

		// const x = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7]
		// const y = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 16, 16, 15, 14, 13, 12, 11, 10, 9, 8]
		const x = [
			38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 17, 17, 17, 16, 16, 16,
			16, 16, 16, 16, 16, 16, 16, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 6, 6,
			7, 8, 9, 10, 11, 12, 13, 14, 15,
		]
		const y = [
			11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 13, 14, 14, 13, 12,
			11, 10, 9, 8, 7, 6, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 7, 7, 7, 7, 7,
			7, 7, 7, 7, 7,
		]

		console.log(x.length, y.length)

		for (let i = 0; i < x.length; i++) {
			this.snake.push(
				new Cell(this.ctx!, {
					x: x[i],
					y: y[i],
					size: this.cellSize,
					offset: this.border,
					type: 'snake',
				})
			)
		}

		this.apple = new Cell(this.ctx!, {
			x: 28,
			y: 5,
			size: this.cellSize,
			offset: this.border,
			type: 'apple',
		})

		// this.snake.push(
		// 	new Cell(this.ctx!, {
		// 		x: Math.floor(Math.random() * this.width),
		// 		y: Math.floor(Math.random() * this.height),
		// 		size: this.cellSize,
		// 		offset: this.border,
		// 		type: 'snake',
		// 	})
		// )

		// this.apple = this.createApple()

		this.draw()
		this.calculator()
	}

	/* DRAW METHODS */
	private clear() {
		this.ctx?.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
	}

	private drawGrid() {
		if (!this.ctx) {
			throw new Error('Canvas doesn`t exist')
		}

		this.ctx.strokeStyle = '#adacea41'
		this.ctx.fillStyle = '#adacea'
		this.ctx.font = '22px serif'

		/* DRAW X */
		for (let y = 0; y <= this.height; y++) {
			this.ctx.beginPath()
			this.ctx.moveTo(this.border, this.border + y * this.cellSize)
			this.ctx.lineTo(this.border + this.fieldWidth, this.border + y * this.cellSize)
			this.ctx.stroke()
			if (y < this.height) {
				this.ctx.fillText(y.toString(), 15, this.border + this.cellSize * y + this.cellSize / 2 + 10)
			}
		}

		/* DRAW Y */
		for (let x = 0; x <= this.width; x++) {
			this.ctx.beginPath()
			this.ctx.moveTo(this.border + x * this.cellSize, this.border)
			this.ctx.lineTo(this.border + x * this.cellSize, this.fieldHeight + this.border)
			this.ctx.stroke()
			if (x < this.width) {
				this.ctx.fillText(x.toString(), this.border + (x + 1) * this.cellSize - this.cellSize + 5, 35)
			}
		}

		this.ctx.fillText(`Score: ${this.score}`, 150, this.canvasHeight - 15)
		this.ctx.fillText(`Time to calculate: ${this.calculateTime} ms`, this.fieldWidth / 2 - 200, this.canvasHeight - 15)
		this.ctx.fillText(`Iterations: ${this.iterations}`, this.fieldWidth / 2 + 200, this.canvasHeight - 15)
	}

	private draw() {
		this.clear()
		this.drawGrid()
		this.snake.forEach((cell, i) => {
			cell.draw(i === this.snake.length - 1)
		})
		this.apple.draw()
	}

	/* UTILS */
	private isEmpty(x: number, y: number, snakeImage: Cell[]) {
		return !snakeImage.some(cell => cell.coords.x === x && cell.coords.y === y)
	}

	private createApple() {
		let x = Math.floor(Math.random() * this.width)
		let y = Math.floor(Math.random() * this.height)
		while (!this.isEmpty(x, y, this.snake)) {
			x = Math.floor(Math.random() * this.width)
			y = Math.floor(Math.random() * this.height)
		}

		return new Cell(this.ctx!, {
			x,
			y,
			size: this.cellSize,
			offset: this.border,
			type: 'apple',
		})
	}

	private updateCoords(snakeImage: Cell[], direction: Direction) {
		let { x, y } = snakeImage[snakeImage.length - 1].coords
		switch (direction) {
			case 'up':
				if (y === 0) {
					y = this.height - 1
				} else {
					y--
				}
				break
			case 'down':
				if (y === this.height - 1) {
					y = 0
				} else {
					y++
				}
				break
			case 'left':
				if (x === 0) {
					x = this.width - 1
				} else {
					x--
				}
				break
			case 'right':
				if (x === this.width - 1) {
					x = 0
				} else {
					x++
				}
				break
		}

		return { x, y }
	}

	/* LIFE CICLE */
	private step() {
		const { x, y } = this.updateCoords(this.snake, this.direction)

		if (!this.isEmpty(x, y, this.snake)) {
			this.isOver = true
			return
		}

		this.snake.push(
			new Cell(this.ctx!, {
				x,
				y,
				size: this.cellSize,
				offset: this.border,
				type: 'snake',
			})
		)

		if (this.apple.coords.x === x && this.apple.coords.y === y) {
			this.apple = this.createApple()
			this.score++
			return
		}
		this.snake.shift()
	}

	private update(dt: number) {
		this.dt += dt - this.prevTime
		this.prevTime = dt

		if (!this.isOver && !this.paused && this.dt > this.ttf) {
			this.dt = 0
			try {
				this.calculator()
			} catch (err) {
				this.isOver = true
				console.log(err)
			}

			this.step()
			this.draw()
		}
		requestAnimationFrame(this.update.bind(this))
	}

	/* AUTOPLAY */
	private calculator() {
		let counter = 0
		let stop = false
		let emptyCase = 0

		const stack: StackItem[] = []
		const apple = this.apple.coords

		const updateImage = (snakeImage: Cell[], direction: Direction) => {
			const { x, y } = this.updateCoords(snakeImage, direction)
			const newImage = [...snakeImage]

			newImage.push(
				new Cell(this.ctx!, {
					x,
					y,
					size: this.cellSize,
					offset: this.border,
					type: 'snake',
				})
			)

			newImage.shift()
			return newImage
		}

		const createStackItem = (snakeImage: Cell[]) => {
			const availableDirections: AvailableDirection[] = []

			const head = snakeImage[snakeImage.length - 1].coords

			const up = this.updateCoords(snakeImage, 'up')
			const down = this.updateCoords(snakeImage, 'down')
			const left = this.updateCoords(snakeImage, 'left')
			const right = this.updateCoords(snakeImage, 'right')

			if (this.isEmpty(up.x, up.y, snakeImage)) {
				let distance = head.y - apple.y || this.height
				distance = distance > 0 ? distance : this.height + distance
				const data: AvailableDirection = { direction: 'up', distance, clearDistance: 1 }

				// for (let y = up.y; y !== apple.y; y--) {
				// 	if (this.isEmpty(up.x, y, snakeImage)) {
				// 		data.clearDistance++
				// 	}
				// 	if (y === 0) {
				// 		y = this.height
				// 	}
				// }
				availableDirections.push(data)
			}
			if (this.isEmpty(down.x, down.y, snakeImage)) {
				let distance = apple.y - head.y || this.height
				distance = distance > 0 ? distance : this.height + distance
				const data: AvailableDirection = { direction: 'down', distance, clearDistance: 1 }

				// for (let y = down.y; y !== apple.y; y++) {
				// 	if (this.isEmpty(down.x, y, snakeImage)) {
				// 		data.clearDistance++
				// 	}
				// 	if (y === this.height - 1) {
				// 		y = 0
				// 	}
				// }
				availableDirections.push(data)
			}
			if (this.isEmpty(left.x, left.y, snakeImage)) {
				let distance = head.x - apple.x || this.width
				distance = distance > 0 ? distance : this.width + distance
				const data: AvailableDirection = { direction: 'left', distance, clearDistance: 1 }

				// for (let x = left.x; x !== apple.x; x--) {
				// 	if (this.isEmpty(x, left.y, snakeImage)) {
				// 		data.clearDistance++
				// 	}
				// 	if (x === 0) {
				// 		x = this.width
				// 	}
				// }
				availableDirections.push(data)
			}
			if (this.isEmpty(right.x, right.y, snakeImage)) {
				let distance = apple.x - head.x || this.width
				distance = distance > 0 ? distance : this.width + distance
				const data: AvailableDirection = { direction: 'right', distance, clearDistance: 1 }

				// for (let x = right.x; x !== apple.x; x++) {
				// 	if (this.isEmpty(x, right.y, snakeImage)) {
				// 		data.clearDistance++
				// 	}
				// 	if (x === this.width) {
				// 		x = 0
				// 	}
				// }
				availableDirections.push(data)
			}

			availableDirections.sort((a, b) => b.distance - a.distance)
			// availableDirections.sort(() => Math.random() - 0.1)
			// const index = availableDirections.findIndex(el => el.distance === el.clearDistance)
			// if (index > -1) {
			// 	const preferred = availableDirections.splice(index, 1)
			// 	availableDirections.push(preferred[0])
			// 	availableDirections.sort((a, b) => b.clearDistance - a.clearDistance)
			// }

			if (availableDirections.length) {
				stack.push({
					snakeImage,
					directions: availableDirections,
					selected: availableDirections[availableDirections.length - 1]?.direction || this.direction,
				})
				return true
			} else {
				// console.log('UVAGA')
				emptyCase++
				return false
			}
		}

		const checkLine = (snakeImage: Cell[]) => {
			const head = snakeImage[snakeImage.length - 1].coords
			const apple = this.apple.coords
			const availableDirections: AvailableDirection[] = []
		}

		const calculate = () => {
			while (true) {
				counter++

				if (!stack.length) {
					console.log('CASE 0')
					break
				}

				if (stack.length === 1 && !stack[0].directions.length && counter !== 1) {
					this.direction = stack[0].selected
					console.log('CASE 1')
					break
				}

				if (stack.length > this.maxStack) {
					this.direction = stack[0].selected
					break
				}

				if (counter > this.maxStack ** 3 * 2) {
					this.direction = stack[0].selected
					break
				}

				const curFrame = stack[stack.length - 1]

				if (!curFrame.directions.length) {
					stack.pop()
					continue
				}

				const curDir = curFrame.directions.pop()!
				curFrame.selected = curDir.direction

				const newImage = updateImage(curFrame.snakeImage, curDir.direction)
				const newHead = newImage[newImage.length - 1].coords

				if (newHead.x === apple.x && newHead.y === apple.y) {
					this.direction = stack[0].selected
					break
				}
				const success = createStackItem(newImage)
				if (!success && !curDir.direction.length) {
					stack.pop()
				}
			}
		}

		const start = Date.now()
		createStackItem(this.snake)
		calculate()
		this.calculateTime = Date.now() - start
		this.iterations = counter
		// console.log('Отработало за ', Date.now() - start, ' мс и ', counter, 'итераций', stack)
		if (counter > 500) {
			this.paused = true
			console.log(emptyCase)
			console.log('Отработало за ', Date.now() - start, ' мс и ', counter, 'итераций', stack)
			console.log(JSON.stringify(stack))
		}
	}

	/* PUBLICK CONTROLLERS */
	start() {
		this.paused = false
		requestAnimationFrame(this.update.bind(this))
	}
	stop() {
		this.paused = true
	}
	reset() {
		this.score = 0
		this.snake = []
		this.isOver = false
		this.paused = true

		this.snake.push(
			new Cell(this.ctx!, {
				x: Math.floor(Math.random() * this.width),
				y: Math.floor(Math.random() * this.height),
				size: this.cellSize,
				offset: this.border,
				type: 'snake',
			})
		)

		this.apple = this.createApple()
		this.draw()
	}
	oneStep() {
		this.calculator()
		this.step()
		this.draw()
	}
}
