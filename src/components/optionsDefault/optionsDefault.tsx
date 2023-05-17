import { ChangeEvent, FC, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb'
import classNames from 'classnames'
import cls from './optionsDefault.module.css'
import { FPS } from '../../assets/constants/constants'
import { GameOfLife } from '../../entities/gameOfLife/game'
import { Snake } from '../../entities/snake/game'
import { SnakeOptions } from '../../entities/snake/types'
import { GameOfLifeOptions } from '../../entities/gameOfLife/types'
import { isGoLOptions, isSnakeOptions } from '../../utils/typeguards'
import Button from '../UI/button/button'

interface OptionsDefaultProps {
	game: Snake | GameOfLife
	options: SnakeOptions | GameOfLifeOptions
}

const OptionsDefault: FC<OptionsDefaultProps> = ({ game, options }) => {
	const location = useLocation()
	const [paused, setPaused] = useState(true)
	const [fps, setFps] = useState(3)
	const [scale, setScale] = useState(1)
	const [size, setSize] = useState(() => {
		if (isSnakeOptions(options)) {
			return { w: options.width, h: options.height }
		} else {
			return { w: 0, h: 0 }
		}
	})

	useEffect(() => {
		setPaused(true)
	}, [location.pathname])

	function playToggle() {
		setPaused(prev => {
			prev ? game.start() : game.stop()
			return !prev
		})
	}

	function changeFps(type: 'inc' | 'desc') {
		setFps(prev => {
			let updated: number
			switch (type) {
				case 'inc':
					updated = prev < FPS.length - 1 ? prev + 1 : prev
					break

				case 'desc':
					updated = prev > 0 ? prev - 1 : prev
					break
			}
			options.fps = FPS[updated]
			return updated
		})
	}

	function changeScale(e: ChangeEvent<HTMLInputElement>) {
		if (game instanceof GameOfLife && isGoLOptions(options)) {
			setScale(+e.target.value)
			options.scale = +e.target.value
			game.redraw()
		}
	}

	function changeSize(e: ChangeEvent<HTMLInputElement>, type: 'w' | 'h') {
		if (isSnakeOptions(options)) {
			setSize(prev => {
				switch (type) {
					case 'w':
						options.width = +e.target.value
						return { ...prev, w: +e.target.value }
					case 'h':
						options.height = +e.target.value
						return { ...prev, h: +e.target.value }
				}
			})
			queueMicrotask(() => {
				game.resize()
			})
		}
	}

	return (
		<div className={cls.options}>
			<Button onClick={playToggle}>{paused ? 'Start' : 'Stop'}</Button>
			<Button onClick={() => game.reset()}>Reset</Button>
			<Button onClick={() => game.oneStep()}>One step</Button>
			<div className={cls.fps}>
				<p>FPS: {FPS[fps]}</p>
				<div className={cls.fps__buttons}>
					<TbTriangleFilled
						onClick={() => changeFps('inc')}
						className={classNames({ [cls.fps__svg]: true, [cls.disabled]: fps === FPS.length - 1 })}
					/>
					<TbTriangleInvertedFilled
						onClick={() => changeFps('desc')}
						className={classNames({ [cls.fps__svg]: true, [cls.disabled]: fps === 0 })}
					/>
				</div>
			</div>
			{game instanceof Snake && isSnakeOptions(options) && paused && (
				<div className={cls.inputs}>
					<div className={cls.scale}>
						<label>
							Width: {size.w}
							<input
								onChange={e => changeSize(e, 'w')}
								type="range"
								value={options.width}
								min="10"
								max={game instanceof GameOfLife ? 80 : 40}
								step="5"
							/>
						</label>
					</div>
					<div className={cls.scale}>
						<label>
							Height: {size.h}
							<input
								onChange={e => changeSize(e, 'h')}
								type="range"
								value={options.height}
								min="10"
								max={game instanceof GameOfLife ? 40 : 20}
								step="5"
							/>
						</label>
					</div>
				</div>
			)}
			{game instanceof GameOfLife && (
				<div className={cls.scale}>
					<label>
						Scale: {scale.toFixed(2)}
						<input onChange={changeScale} type="range" value={scale} min="0.05" max="2" step="0.05" />
					</label>
				</div>
			)}
		</div>
	)
}

export default OptionsDefault
