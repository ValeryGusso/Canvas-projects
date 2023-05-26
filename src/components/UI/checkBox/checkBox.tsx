import { Dispatch, FC, SetStateAction } from 'react'
import cls from './checkBox.module.css'

interface CheckBoxProps {
	title: string
	active: boolean
	setActive: Dispatch<SetStateAction<boolean>>
}

const CheckBox: FC<CheckBoxProps> = ({ title, active, setActive }) => {
	function toggle() {
		setActive(prev => !prev)
	}

	return (
		<div className={cls.container}>
			<p>{title}</p>
			<div onClick={toggle} className={cls.box}>
				<p className={active ? cls.active : ''}>{active ? '✓' : '✘'}</p>
			</div>
		</div>
	)
}

export default CheckBox
