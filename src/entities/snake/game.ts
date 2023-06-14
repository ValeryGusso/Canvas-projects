import { Cell } from './cell'
import { AvailableDirection, Direction, SnakeOptions, StackItem } from './types'

export class Snake {
	private readonly canvas
	private ctx

	/* GAME */
	private direction: Direction = 'right'
	private snake: Cell[] = []
	private apple: Cell
	private score = 0
	private isOver = false
	private options
	private get cellSize() {
		return this.options.cellSize
	}
	private get fieldWidth() {
		return this.cellSize * this.options.width
	}
	private get fieldHeight() {
		return this.cellSize * this.options.height
	}
	private get canvasWidth() {
		return this.cellSize * this.options.width + this.borderX * 2
	}
	private get canvasHeight() {
		return this.cellSize * this.options.height + this.borderY * 2
	}
	private get borderX() {
		return Math.floor((window.innerWidth * 0.8 - this.cellSize * this.options.width) / 2)
	}
	private get borderY() {
		return Math.floor((window.innerHeight * 0.75 - this.cellSize * this.options.height) / 2)
	}
	private get width() {
		return this.options.width
	}
	private get height() {
		return this.options.height
	}

	/* CALCULATOR */
	private readonly maxStack = 100 // max stack length
	private route: Direction[] = []
	private calculateTime = 0 // time to calculate next step
	private iterations = 0 // iterations spent count

	/* LIFE CICLE */
	private paused = true
	private prevTime = 0 //previus time stamp
	private dt = 0 // delta time
	private id = 0 // requestAnimationFrame ID
	private get fps() {
		return this.options.fps
	}
	private get ttf() {
		return 1000 / this.fps // time to frame
	}

	constructor(canvas: HTMLCanvasElement, options: SnakeOptions) {
		this.canvas = canvas
		const ctx = this.canvas.getContext('2d', { willReadFrequently: true })
		if (!ctx) {
			throw new Error('Context dont exist')
		}
		this.ctx = ctx

		this.options = options
		canvas.width = this.canvasWidth
		canvas.height = this.canvasHeight

		// const x = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7]
		// const y = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 16, 16, 15, 14, 13, 12, 11, 10, 9, 8]
		// const x = [
		// 	38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 17, 17, 17, 16, 16, 16,
		// 	16, 16, 16, 16, 16, 16, 16, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 6, 6,
		// 	7, 8, 9, 10, 11, 12, 13, 14, 15,
		// ]
		// const y = [
		// 	11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 13, 14, 14, 13, 12,
		// 	11, 10, 9, 8, 7, 6, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 7, 7, 7, 7, 7,
		// 	7, 7, 7, 7, 7,
		// ]

		// console.log(x.length, y.length)

		// for (let i = 0; i < x.length; i++) {
		// 	this.snake.push(
		// 		new Cell(this.ctx!, {
		// 			x: x[i],
		// 			y: y[i],
		// 			size: this.cellSize,
		// 			offset: { x: this.borderX, y: this.borderY },
		// 			type: 'snake',
		// 		})
		// 	)
		// }

		// this.apple = new Cell(this.ctx!, {
		// 	x: 3,
		// 	y: 15,
		// 	size: this.cellSize,
		// 	offset: { x: this.borderX, y: this.borderY },
		// 	type: 'apple',
		// })

		this.snake.push(
			new Cell(this.ctx!, {
				x: Math.floor(Math.random() * this.width),
				y: Math.floor(Math.random() * this.height),
				size: this.cellSize,
				offset: { x: this.borderX, y: this.borderY },
				type: 'snake',
			})
		)

		this.apple = this.createApple()

		this.draw()
		this.calculator()
	}

	/* DRAW METHODS */
	private clear() {
		this.ctx?.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
	}

	private drawGrid() {
		this.ctx.strokeStyle = '#adacea41'
		this.ctx.fillStyle = '#adacea'
		this.ctx.font = '22px serif'
		// this.ctx.textAlign = 'center'

		/* DRAW X */
		for (let y = 0; y <= this.height; y++) {
			this.ctx.beginPath()
			this.ctx.moveTo(this.borderX, this.borderY + y * this.cellSize)
			this.ctx.lineTo(this.borderX + this.fieldWidth, this.borderY + y * this.cellSize)
			this.ctx.stroke()
			if (y < this.height) {
				this.ctx.fillText(
					y /*+ 1*/
						.toString(),
					this.borderX - 30,
					this.borderY + this.cellSize * y + this.cellSize / 2 + 10
				)
			}
		}

		/* DRAW Y */
		for (let x = 0; x <= this.width; x++) {
			this.ctx.beginPath()
			this.ctx.moveTo(this.borderX + x * this.cellSize, this.borderY)
			this.ctx.lineTo(this.borderX + x * this.cellSize, this.fieldHeight + this.borderY)
			this.ctx.stroke()
			if (x < this.width) {
				this.ctx.fillText(
					x /*+ 1*/
						.toString(),
					this.borderX + (x + 1) * this.cellSize - this.cellSize + 5,
					this.borderY - 15
				)
			}
		}

		this.ctx.fillText(
			`Score: ${this.score} / Time to calculate: ${this.calculateTime} ms / Iterations: ${this.iterations}`,
			this.canvasWidth / 2 - 215,
			this.canvasHeight - 20
		)
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
			offset: { x: this.borderX, y: this.borderY },
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
				offset: { x: this.borderX, y: this.borderY },
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
				if (!this.route.length) {
					this.calculator()
				}

				this.direction = this.route.shift()!

				const nextStep = this.updateCoords(this.snake, this.direction)

				if (!this.isEmpty(nextStep.x, nextStep.y, this.snake)) {
					this.isOver = true
					this.paused = true
					console.log('OVER')
					return
				}

				this.step()
				this.draw()
			} catch (err) {
				this.isOver = true
				console.log(err)
			}
		}

		if (!this.paused) {
			this.id = requestAnimationFrame(this.update.bind(this))
		}
	}

	/* AUTOPLAY */
	private calculator() {
		let counter = 0
		let stop = false
		let emptyCase = 0
		this.route.length = 0

		const stack: StackItem[] = []
		const apple = this.apple.coords

		const updateImage = (snakeImage: Cell[], direction: Direction) => {
			const { x, y } = this.updateCoords(snakeImage, direction)
			const newImage = [...snakeImage]

			newImage.push(
				new Cell(this.ctx, {
					x,
					y,
					size: this.cellSize,
					offset: { x: this.borderX, y: this.borderY },
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
				let distance = head.y - apple.y
				distance = distance > 0 ? distance : this.height + distance
				const data: AvailableDirection = { direction: 'up', distance, clearDistance: 1 }
				// console.log('start up')
				for (let y = up.y; y !== apple.y; y--) {
					if (!this.isEmpty(up.x, y, snakeImage)) {
						break
					}
					data.clearDistance++

					if (y === 0) {
						data.clearDistance++
						if (apple.y === this.height - 1) {
							break
						} else {
							y = this.height - 1
						}
					}
				}
				// console.log('end up')
				availableDirections.push(data)
			}
			if (this.isEmpty(down.x, down.y, snakeImage)) {
				let distance = apple.y - head.y
				distance = distance > 0 ? distance : this.height + distance
				const data: AvailableDirection = { direction: 'down', distance, clearDistance: 1 }
				// console.log('start down')
				for (let y = down.y; y !== apple.y; y++) {
					if (!this.isEmpty(down.x, y, snakeImage)) {
						break
					}
					data.clearDistance++

					if (y === this.height - 1) {
						data.clearDistance++
						if (apple.y === 0) {
							break
						} else {
							y = 0
						}
					}
				}
				// console.log('end down')
				availableDirections.push(data)
			}
			if (this.isEmpty(left.x, left.y, snakeImage)) {
				let distance = head.x - apple.x
				distance = distance > 0 ? distance : this.width + distance
				const data: AvailableDirection = { direction: 'left', distance, clearDistance: 1 }
				// console.log('start left')
				for (let x = left.x; x !== apple.x; x--) {
					if (!this.isEmpty(x, left.y, snakeImage)) {
						break
					}
					data.clearDistance++

					if (x === 0) {
						data.clearDistance++
						if (apple.x === this.width - 1) {
							break
						} else {
							x = this.width - 1
						}
					}
				}
				// console.log('end left')
				availableDirections.push(data)
			}
			if (this.isEmpty(right.x, right.y, snakeImage)) {
				let distance = apple.x - head.x
				distance = distance > 0 ? distance : this.width + distance
				const data: AvailableDirection = { direction: 'right', distance, clearDistance: 1 }
				// console.log('start right')
				for (let x = right.x; x !== apple.x; x++) {
					if (!this.isEmpty(x, right.y, snakeImage)) {
						break
					}
					data.clearDistance++

					if (x === this.width - 1) {
						data.clearDistance++
						if (apple.x === 0) {
							break
						} else {
							x = 0
						}
					}
				}
				// console.log('end right')
				availableDirections.push(data)
			}

			availableDirections.sort((a, b) => b.distance - a.distance)
			// availableDirections.sort((a, b) => b.clearDistance - a.clearDistance)
			// availableDirections.sort((_, b) => (b.distance - b.clearDistance ? -1 : 1))
			// console.log('DIR: ', { ...availableDirections })

			if (availableDirections.length) {
				stack.push({
					snakeImage,
					directions: availableDirections,
					selected: availableDirections[availableDirections.length - 1].direction,
				})
			}
			emptyCase++
		}

		const calculate2 = () => {
			while (counter < this.maxStack ** 3 && stack.length && stack.length < this.maxStack) {
				counter++

				/* GET START DATA */
				const curFrame = stack[stack.length - 1]
				if (!curFrame) {
					console.log('EMPTY STACK')
					break
				}

				// console.log(curFrame.snakeImage)
				const curDir = curFrame.directions.pop()

				if (!curDir) {
					// console.log('DELETE ITEM')
					stack.pop()
					continue
				}

				// if (curDir.clearDistance === curDir.distance) {
				// 	for (let i = 0; i < curDir.distance - 1; i++) {
				// 		stack.push({ snakeImage: [], directions: [], selected: curDir.direction })
				// 	}
				// 	break
				// }

				/* PREVALIDATION */

				curFrame.selected = curDir.direction
				const newImage = updateImage(curFrame.snakeImage, curDir.direction)
				const newHead = newImage[newImage.length - 1].coords

				if (newHead.x === apple.x && newHead.y === apple.y) {
					// console.log('APPLE')
					break
				} else {
					createStackItem(newImage)
				}
			}
		}

		const calculate = () => {
			// if (stack[0]?.directions.some(dir => dir.clearDistance === dir.distance)) {
			// 	const availableDirections = stack[0].directions
			// 	const preffer = availableDirections.filter(dir => dir.distance === dir.clearDistance)

			// 	if (preffer.length > 1) {
			// 		preffer.sort((a, b) => a.clearDistance - b.clearDistance)
			// 	}

			// 	const head = stack[0].snakeImage[stack[0].snakeImage.length - 1].coords

			// 	if (
			// 		(head.x === apple.x && (preffer[0].direction === 'up' || preffer[0].direction === 'down')) ||
			// 		(head.y === apple.y && (preffer[0].direction === 'right' || preffer[0].direction === 'left'))
			// 	) {
			// 		stack[0].selected = preffer[0].direction
			// 		console.log('FREE CASE')
			// 		return
			// 	}
			// }

			while (true) {
				counter++

				if (stack.length === this.maxStack) {
					break
				}

				if (stack.length === 1 && stack[0].directions.length === 0) {
					break
				}

				if (counter > this.maxStack ** 3) {
					break
				}

				const curFrame = stack[stack.length - 1]

				if (!curFrame.directions.length) {
					stack.pop()
					continue
				}

				// if (curFrame.directions.some(dir => dir.distance === dir.clearDistance)) {
				// 	break
				// }

				const curDir = curFrame.directions.pop()!
				curFrame.selected = curDir.direction
				const newImage = updateImage(curFrame.snakeImage, curDir.direction)
				const newHead = newImage[newImage.length - 1].coords

				if (newHead.x === apple.x && newHead.y === apple.y) {
					break
				}
				createStackItem(newImage)
			}
		}

		const start = Date.now()
		createStackItem(this.snake)
		calculate2()
		// console.log('----------------------------')
		// console.log('STACK: ', stack)
		// console.log('COUNTER: ', counter)
		// calculate()
		if (stack.length) {
			for (let i = 0; i < stack.length; i++) {
				this.route.push(stack[i].selected)
			}
		} else {
			console.log('NO WAY')
		}
		this.calculateTime = Date.now() - start
		this.iterations = counter
	}

	/* PUBLICK CONTROLLERS */
	resize() {
		this.canvas.width = this.canvasWidth
		this.canvas.height = this.canvasHeight

		this.reset()
		this.draw()
	}

	remove() {
		this.score = 0
		this.snake = []
		this.isOver = false
		this.paused = true
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
		this.score = 0
		this.snake = []
		this.isOver = false
		this.paused = true

		this.snake.push(
			new Cell(this.ctx!, {
				x: Math.floor(Math.random() * this.width),
				y: Math.floor(Math.random() * this.height),
				size: this.cellSize,
				offset: { x: this.borderX, y: this.borderY },
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
