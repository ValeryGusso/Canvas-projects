import { ParentController } from './types'

export class Pixel {
	private parent
	private color
	private originalX
	private originalY
	private size
	private weight
	private x
	private y
	private vx
	private vy
	private k = 0.95
	private excited = false

	constructor(x: number, y: number, color: string, size: number, parent: ParentController) {
		this.originalX = x
		this.originalY = y
		this.x = Math.random() * parent.canvas.width
		this.y = Math.random() * parent.canvas.height
		this.color = color
		this.size = size
		this.weight = this.getRandom(3, 9) / 10
		this.vx = this.getRandom(Math.floor(-parent.canvas.width / 2), Math.floor(parent.canvas.width / 2))
		this.vy = this.getRandom(Math.floor(-parent.canvas.height / 2), Math.floor(parent.canvas.height / 2))
		this.parent = parent
	}

	private getRandom(min: number, max: number) {
		return Math.floor(Math.random() * (max - min) + min)
	}

	update() {
		if (this.parent.cursor.isActive) {
			const dx = this.parent.cursor.x - this.x
			const dy = this.parent.cursor.y - this.y
			const distance = Math.hypot(dx, dy)

			if (Math.abs(distance) < this.parent.cursor.radius && !this.excited) {
				this.excited = true
				const angle = Math.atan2(dy, dx)
				const f = this.parent.cursor.radius / distance / this.weight
				this.vx += Math.cos(angle) * -f * this.weight * this.size * 20
				this.vy += Math.sin(angle) * -f * this.weight * this.size * 20
			}
		}

		if (this.x === this.originalX && this.y === this.originalY && this.vx === 0 && this.vy === 0) {
			this.excited = false
		} else {
			const dx = this.originalX - this.x
			const dy = this.originalY - this.y

			this.vx *= this.k
			this.vy *= this.k

			this.x += (this.vx + dx) * this.weight
			this.y += (this.vy + dy) * this.weight

			if (Math.abs(this.vx) < 1 && Math.abs(dx) < this.size * 2) {
				this.x = this.originalX
				this.vx = 0
			}
			if (Math.abs(this.vy) < 1 && Math.abs(dy) < this.size * 2) {
				this.y = this.originalY
				this.vy = 0
			}
		}
	}

	draw() {
		this.parent.ctx.fillStyle = this.color
		this.parent.ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size)
	}
}
