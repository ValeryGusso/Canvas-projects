import { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from 'react'
import cls from './optionsImage.module.css'
import { ImageDestroyer } from '../../entities/image/image'
import { ImageOptions } from '../../entities/image/types'
import { toast } from 'react-hot-toast'
import FileOrLink from '../UI/fileOrLink/fileOrLink'
import Button from '../UI/button/button'
import CheckBox from '../UI/checkBox/checkBox'

interface OptionsImageProps {
	game: ImageDestroyer
	options: ImageOptions
}

const OptionsImage: FC<OptionsImageProps> = ({ game, options }) => {
	const img = useRef<HTMLImageElement>(new Image())
	const [type, setType] = useState<'file' | 'link'>('file')
	const [file, setFile] = useState<File | null>(null)
	const [link, setLink] = useState('')
	const [scale, setScale] = useState(options.pixelSize)
	const [radius, setRadius] = useState(options.radius)
	const [pushForce, setPushForce] = useState(options.pushForce)

	useEffect(() => {
		img.current.addEventListener('error', () => {
			toast.error('Invalid image source')
		})

		img.current.addEventListener('load', e => {
			game.toBase64(img.current)
		})
	}, [])

	const start = useCallback(() => {
		if (type === 'file' && file) {
			game.toBase64(file)
			return
		}

		if (type === 'file' && !file) {
			toast.error('Invalid image source')
			return
		}

		if (type === 'link') {
			img.current.src = link
		}
	}, [type, file, link])

	useEffect(() => {
		options.pushForce = pushForce
	}, [pushForce])

	const changeScale = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const newVal = +e.target.value
			if (newVal) {
				setScale(newVal)
				options.pixelSize = newVal
				game.resize()
			}
		},
		[type, file, link]
	)

	const changeRadius = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const newVal = +e.target.value
		setRadius(newVal)
		options.radius = newVal
	}, [])

	return (
		<div className={cls.container}>
			<FileOrLink type={type} setType={setType} file={file} setFile={setFile} link={link} setLink={setLink} />
			<CheckBox title="Push" active={pushForce} setActive={setPushForce} />
			<div className={cls.scale}>
				<label>
					Pixel size: {scale}
					<input min="1" max="15" step="1" type="range" value={scale} onChange={changeScale} />
				</label>
			</div>
			<div className={cls.scale}>
				<label>
					Mouse: {radius}
					<input min="10" max="150" step="10" type="range" value={radius} onChange={changeRadius} />
				</label>
			</div>
			<Button onClick={start}>GO</Button>
			<Button onClick={() => game.refresh()}>Reset</Button>
		</div>
	)
}

export default OptionsImage
