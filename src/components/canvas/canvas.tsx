import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import cls from './canvas.module.css'
import { GameOfLife } from '../../entities/gameOfLife/game'
import { GameOfLifeOptions } from '../../entities/gameOfLife/types'
import { Snake } from '../../entities/snake/game'
import { SnakeOptions } from '../../entities/snake/types'
import { ImageDestroyer } from '../../entities/image/image'
import { ImageOptions } from '../../entities/image/types'
import { pathNames } from '../../assets/constants/constants'
import OptionsDefault from '../optionsDefault/optionsDefault'
import OptionsImage from '../optionsImage/optionsImage'

const Canvas: FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [game, setGame] = useState<Snake | GameOfLife | ImageDestroyer | null>(null)
	const location = useLocation()

	useEffect(() => {
		game?.remove()
		if (canvasRef.current) {
			switch (location.pathname) {
				case pathNames.SNAKE:
					setGame(new Snake(canvasRef.current, snakeOptions))
					break
				case pathNames.GOL:
					setGame(new GameOfLife(canvasRef.current, gameOfLifeOptions))
					break
				case pathNames.IMAGE:
					setGame(new ImageDestroyer(canvasRef.current, imageOptions))
					break
				default:
					setGame(new GameOfLife(canvasRef.current, gameOfLifeOptions))
			}
		}
	}, [location.pathname])

	const gameOfLifeOptions = useMemo<GameOfLifeOptions>(() => {
		return {
			min: 1,
			max: 4,
			alive: 3,
			fps: 15,
			scale: 1,
		}
	}, [])

	const snakeOptions = useMemo<SnakeOptions>(() => {
		return {
			width: 40,
			height: 20,
			cellSize: 30,
			fps: 5,
		}
	}, [])

	const imageOptions = useMemo<ImageOptions>(() => {
		return {
			pixelSize: 0,
			pixelCount: 0,
			fps: 0,
		}
	}, [])

	function getOptions(game: Snake | GameOfLife) {
		if (game instanceof Snake) {
			return snakeOptions
		}
		if (game instanceof GameOfLife) {
			return gameOfLifeOptions
		}
	}

	function renderOptions() {
		if (game instanceof GameOfLife || game instanceof Snake) {
			return <OptionsDefault game={game} options={getOptions(game)!} />
		}

		if (game instanceof ImageDestroyer) {
			return <OptionsImage game={game} options={imageOptions} />
		}
	}

	return (
		<div className={cls.container}>
			<canvas className={cls.canvas} ref={canvasRef}></canvas>
			{renderOptions()}
		</div>
	)
}

export default Canvas
