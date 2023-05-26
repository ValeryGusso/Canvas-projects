import { defaultImage } from '../../assets/constants/constants'
import { Pixel } from './pixel'
import { Color, Colors, Cursor, ImageOptions, ParentController, PixelParams } from './types'

export class ImageDestroyer {
	private readonly canvas
	private readonly ctx

	private mousedown
	private mouseup
	private mousemove

	private options
	private get mergePixels() {
		return this.options.pixelSize
	}
	private get force() {
		return this.options.pushForce ? -1 : 1
	}
	private get radius() {
		return this.options.radius
	}
	private get controller() {
		const controller: ParentController = {
			canvas: this.canvas,
			ctx: this.ctx,
			cursor: this.cursor,
		}
		return controller
	}

	private cursor: Cursor
	private base64 = ''
	private width = 0
	private height = 0

	private originPixels = new Map<string, PixelParams>()
	private renderPixels: Pixel[] = []

	private id = 0 // requestAnimationFrame ID
	private prevTime = 0
	private dt = 0

	constructor(canvas: HTMLCanvasElement, options: ImageOptions) {
		this.canvas = canvas
		this.setCanvasSize()
		const ctx = this.canvas.getContext('2d', { willReadFrequently: true })
		if (!ctx) {
			throw new Error('Context dont exist')
		}
		this.ctx = ctx

		this.options = options
		this.cursor = { x: 0, y: 0, radius: this.radius, isActive: false, force: this.force }

		this.mousedown = (e: MouseEvent) => {
			this.cursor.isActive = true
			this.cursor.radius = this.radius
			this.cursor.force = this.force
			this.cursor.x = e.offsetX
			this.cursor.y = e.offsetY
		}
		this.mouseup = () => {
			this.cursor.isActive = false
		}
		this.mousemove = (e: MouseEvent) => {
			if (this.cursor.isActive) {
				this.cursor.x = e.offsetX
				this.cursor.y = e.offsetY
			}
		}

		this.canvas.addEventListener('mousedown', this.mousedown)
		this.canvas.addEventListener('mouseup', this.mouseup)
		this.canvas.addEventListener('mousemove', this.mousemove)
	}

	private setCanvasSize() {
		this.canvas.width = Math.floor(window.innerWidth * 0.8)
		this.canvas.height = Math.floor(window.innerHeight * 0.75)
	}

	/* DRAW METHODS */
	private clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

	private drawInfo() {
		this.ctx.strokeStyle = '#adacea41'
		this.ctx.fillStyle = '#adacea'
		this.ctx.font = '22px serif'
		this.ctx.fillText(`FPS: ${Math.round(1000 / this.dt)}`, 10, 30)
		this.ctx.fillText(`Total pixels: ${this.renderPixels.length}`, 10, this.canvas.height - 15)
	}

	private update(timestamp: number) {
		this.clear()
		this.renderPixels.forEach(pixel => {
			pixel.update()
			pixel.draw()
		})
		if (this.cursor.isActive) {
			this.ctx.beginPath()
			this.ctx.strokeStyle = '#adadad'
			this.ctx.arc(this.cursor.x, this.cursor.y, this.cursor.radius, 0, Math.PI * 2)
			this.ctx.stroke()
		}
		this.drawInfo()
		this.dt = timestamp - this.prevTime
		this.prevTime = timestamp
		this.id = requestAnimationFrame(this.update.bind(this))
	}

	private generateIndex(x: number, y: number) {
		return `x${x}_y${y}`
	}

	private average(data: Color[], color: Colors) {
		return data.reduce((acc, item) => acc + item[color], 0) / data.length
	}

	private shakalizator() {
		this.renderPixels = []
		// let str = ''

		for (let col = 0; col < this.width - this.mergePixels; col += this.mergePixels) {
			// str += '\n'
			for (let row = 0; row < this.height - this.mergePixels; row += this.mergePixels) {
				const result: Color[] = []

				for (let x = 0; x < this.mergePixels; x++) {
					for (let y = 0; y < this.mergePixels; y++) {
						const curentPixel = this.originPixels.get(this.generateIndex(col + x, row + y))

						if (curentPixel) {
							result.push({ r: curentPixel.r, g: curentPixel.g, b: curentPixel.b, a: curentPixel.a })
						}
					}
				}

				// const light = (this.average(result, 'r') + this.average(result, 'g') + this.average(result, 'b')) / 3
				// if (light < 25) {
				// 	str += '.'
				// } else if (light < 50) {
				// 	str += '-'
				// } else if (light < 75) {
				// 	str += '_'
				// } else if (light < 100) {
				// 	str += '!'
				// } else if (light < 125) {
				// 	str += '^'
				// } else if (light < 150) {
				// 	str += '*'
				// } else if (light < 175) {
				// 	str += '%'
				// } else if (light < 200) {
				// 	str += '#'
				// } else if (light < 225) {
				// 	str += '@'
				// } else {
				// 	str += '&'
				// }
				// if (str.length % (this.width / this.mergePixels) === 0) {
				// 	str += '\n'
				// }
				this.renderPixels.push(
					new Pixel(
						this.canvas.width / 2 - this.width / 2 + col,
						this.canvas.height / 2 - this.height / 2 + row,
						`rgba(${this.average(result, 'r')},${this.average(result, 'g')},${this.average(result, 'b')},${this.average(
							result,
							'a'
						).toFixed(2)})`,
						this.mergePixels,
						this.controller
					)
				)
			}
		}
		// console.log(str)
		this.update(0)
	}

	private async setImage() {
		this.originPixels = new Map<string, PixelParams>()

		const img = new Image()
		await new Promise(res => {
			img.src = this.base64
			res(null)
		})

		/* SKALE IMAGE */
		const activeZone = 0.8

		let sizeX = img.width > this.canvas.width * activeZone ? this.canvas.width * activeZone : img.width
		let sizeY = img.height > this.canvas.height * activeZone ? this.canvas.height * activeZone : img.height

		const originalRatio = img.width / img.height
		const convertRatio = sizeX / sizeY

		let kfX = 1
		let kfY = 1

		if (originalRatio !== convertRatio) {
			const kf = originalRatio / convertRatio
			if (img.width > img.height) {
				kfX = kf
			} else {
				kfY = 1 / kf
			}
			sizeX *= kf
			sizeY *= kf
		}

		this.width = Math.round(sizeX * kfX)
		this.height = Math.round(sizeY * kfY)

		/* GET BASE 64 AND CREATING ORIGINAL PIXELS MAP */
		this.ctx.drawImage(img, 0, 0, this.width, this.height)
		const { data, width } = this.ctx.getImageData(0, 0, this.width, this.height)

		this.clear()

		for (let i = 0; i < data.length; i += 4) {
			if (data[i + 3] > 127) {
				this.originPixels.set(this.generateIndex((i / 4) % width, Math.floor(i / width / 4)), {
					x: (i / 4) % width,
					y: Math.floor(i / width / 4),
					r: data[i],
					g: data[i + 1],
					b: data[i + 2],
					a: data[i + 3] / 255,
				})
			}
		}
	}

	async toBase64(image: File | HTMLImageElement) {
		if (image instanceof File) {
			const buffer = await image.arrayBuffer()
			const Uint8 = new Uint8Array(buffer)

			const Uint8ToBase64 = async (data: Uint8Array) => {
				const base64url = await new Promise(res => {
					const reader = new FileReader()
					reader.onload = () => res(reader.result)
					reader.readAsDataURL(new Blob([data]))
				})
				if (typeof base64url === 'string') {
					return base64url.split(',', 2)[1]
				}
				return ''
			}

			const b64 = await Uint8ToBase64(Uint8)
			this.base64 = `data:${image.type};base64,` + b64
		} else {
			this.canvas.width = image.width
			this.canvas.height = image.height

			image.crossOrigin = 'anonymous'
			this.ctx.drawImage(image, 0, 0)
			this.base64 = this.canvas.toDataURL()

			this.setCanvasSize()
		}

		await this.setImage()
		this.shakalizator()
	}

	/* PUBLICK CONTROLLERS */
	remove() {
		this.canvas.removeEventListener('mousedown', this.mousedown)
		this.canvas.removeEventListener('mouseup', this.mouseup)
		this.canvas.removeEventListener('mousemove', this.mousemove)
		cancelAnimationFrame(this.id)
		this.base64 = ''
		this.clear()
	}

	async resize() {
		cancelAnimationFrame(this.id)
		this.clear()
		if (!this.base64) {
			this.base64 = defaultImage
		}
		await this.setImage()
		this.shakalizator()
	}
	async refresh() {
		cancelAnimationFrame(this.id)
		this.clear()
		this.base64 = defaultImage
		await this.setImage()
		this.shakalizator()
	}

	start() {
		requestAnimationFrame(this.update.bind(this))
	}

	stop() {}

	reset() {}
}
