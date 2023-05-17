import { FC } from 'react'
import cls from './button.module.css'

interface ButtonProps {
	onClick: () => void
	type?: 'button' | 'submit' | 'reset'
	children: JSX.Element | string
}

const Button: FC<ButtonProps> = ({ onClick, type, children }) => {
	return (
		<button className={cls.button} onClick={onClick} type={type}>
			{children}
		</button>
	)
}

export default Button
