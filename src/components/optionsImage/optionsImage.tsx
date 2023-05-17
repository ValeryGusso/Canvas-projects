import { FC, useCallback, useEffect, useRef, useState } from 'react'
import cls from './optionsImage.module.css'
import { ImageDestroyer } from '../../entities/image/image'
import { ImageOptions } from '../../entities/image/types'
import { toast } from 'react-hot-toast'
import FileOrLink from '../UI/fileOrLink/fileOrLink'
import Button from '../UI/button/button'

interface OptionsImageProps {
	game: ImageDestroyer
	options: ImageOptions
}

const OptionsImage: FC<OptionsImageProps> = ({ game, options }) => {
	const img = useRef<HTMLImageElement>(new Image())
	const [type, setType] = useState<'file' | 'link'>('file')
	const [file, setFile] = useState<File | null>(null)
	const [link, setLink] = useState('')

	useEffect(() => {
		img.current.addEventListener('error', () => {
			toast.error('Invalid image source')
		})

		img.current.addEventListener('load', e => {
			game.toBase64(img.current)
			console.log(e)
		})

		img.current.addEventListener('abort', () => {
			console.log(123)
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

	return (
		<div className={cls.container}>
			<FileOrLink type={type} setType={setType} file={file} setFile={setFile} link={link} setLink={setLink} />
			<Button onClick={start}>GO</Button>
			<Button onClick={() => game.refresh()}>Refresh</Button>
		</div>
	)
}

export default OptionsImage
