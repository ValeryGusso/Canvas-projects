import { GameOfLifeOptions } from '../entities/gameOfLife/types'
import { SnakeOptions } from '../entities/snake/types'

export function isGoLOptions(options: unknown): options is GameOfLifeOptions {
	if (options && typeof options === 'object') {
		return (
			options.hasOwnProperty('scale') &&
			options.hasOwnProperty('min') &&
			options.hasOwnProperty('max') &&
			options.hasOwnProperty('alive')
		)
	} else {
		return false
	}
}

export function isSnakeOptions(options: unknown): options is SnakeOptions {
	if (options && typeof options === 'object') {
		return options.hasOwnProperty('width') && options.hasOwnProperty('height')
	} else {
		return false
	}
}
