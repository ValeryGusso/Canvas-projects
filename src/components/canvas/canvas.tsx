import { FC, useEffect, useRef, useState } from 'react'
import cls from './canvas.module.css'
import { Game } from '../../entities/snake/game'

const Canvas: FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const game = useRef<Game | null>(null)
	const [isLoaded, setIsLoaded] = useState(false)

	function start() {
		game.current?.start()
	}
	function stop() {
		game.current?.stop()
	}
	function reset() {
		game.current?.reset()
	}
	function step() {
		game.current?.oneStep()
	}

	useEffect(() => {
		if (canvasRef.current) {
			game.current = new Game(canvasRef.current, { cellSize: 30, width: 40, height: 20 })
			setIsLoaded(true)
		}
	}, [])

	return (
		<div className={cls.container}>
			<canvas className={cls.canvas} ref={canvasRef}></canvas>
			{isLoaded && (
				<div>
					<button onClick={start}>go</button>
					<button onClick={stop}>stop</button>
					<button onClick={reset}>reset</button>
					<button onClick={step}>step</button>
				</div>
			)}
		</div>
	)
}

export default Canvas
