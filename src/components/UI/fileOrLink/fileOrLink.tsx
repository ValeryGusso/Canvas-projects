import { ChangeEvent, Dispatch, FC, SetStateAction, useCallback, useRef } from 'react'
import { FaFileUpload } from 'react-icons/fa'
import { MdDeleteForever } from 'react-icons/md'
import cls from './fileOrLink.module.css'
import { cut } from '../../../utils/print'

interface FileOrLinkProps {
	type: 'file' | 'link'
	setType: Dispatch<SetStateAction<'file' | 'link'>>
	file: File | null
	setFile: Dispatch<SetStateAction<File | null>>
	link: string
	setLink: Dispatch<SetStateAction<string>>
}

const FileOrLink: FC<FileOrLinkProps> = ({ type, setType, file, setFile, link, setLink }) => {
	const inputRef = useRef<HTMLInputElement>(null)

	const upload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0] instanceof File) {
			setFile(e.target.files[0])
		}
	}, [])

	return (
		<div className={cls.container}>
			<ul className={cls.type}>
				<li className={type === 'link' ? cls.searched : ''} onClick={() => setType('link')}>
					Ссылка
				</li>
				<li className={type === 'file' ? cls.searched : ''} onClick={() => setType('file')}>
					Загрузить
				</li>
			</ul>
			<div className={cls.content}>
				{type === 'file' ? (
					<div className={cls.upload}>
						<input onChange={upload} ref={inputRef} type="file" hidden />
						<FaFileUpload className={cls.file} onClick={() => inputRef.current?.click()} size={64} />
						{file && (
							<>
								<MdDeleteForever className={cls.delete} onClick={() => setFile(null)} size={40} />
								<p className={cls.filename}>{cut(file?.name, 25)}</p>
							</>
						)}
					</div>
				) : (
					<textarea className={cls.input} value={link} onChange={e => setLink(e.target.value.trim())}></textarea>
				)}
			</div>
		</div>
	)
}

export default FileOrLink
