import { FC, useState } from 'react'
import cls from './header.module.css'
import { Link, useLocation } from 'react-router-dom'
import { headerItems, pathNames } from '../../assets/constants/constants'
import classNames from 'classnames'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

const Header: FC = () => {
	const location = useLocation()
	const [isVisible, setIsVisible] = useState(false)
	const [searched, setSearched] = useState(() => {
		switch (location.pathname) {
			case pathNames.SNAKE:
				return 0
			case pathNames.GOL:
				return 1
			case pathNames.IMAGE:
				return 2
			default:
				return 0
		}
	})

	function hover(i: number) {
		setSearched(i)
	}

	return (
		<div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} className={cls.container}>
			<nav className={cls.nav}>
				<div
					style={{ '--x': `${searched * 300}px` } as React.CSSProperties}
					className={classNames({ [cls.searched]: true, [cls.hidden]: !isVisible })}
				></div>
				{headerItems.map((el, i) => (
					<div onMouseEnter={() => hover(i)} className={cls.block} key={el.path}>
						<Link to={el.path}>
							{location.pathname === el.path && <FaArrowRight size={32} />}
							{el.title}
							{location.pathname === el.path && <FaArrowLeft size={32} />}
						</Link>
					</div>
				))}
			</nav>
		</div>
	)
}

export default Header
