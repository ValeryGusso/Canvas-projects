import { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import cls from './inputRange.module.css'

const InputRange: FC = () => {
	const rangeSlider = useRef(null)
	const rangeBullet = useRef(null)
	const [value, setValue] = useState(1)
	const [left, setLeft] = useState(0)

	// useEffect(() => {
	// 	rangeSlider.current?.addEventListener('input', showSliderValue, false)
	// }, [])

	function showSliderValue() {
		// rangeBullet.innerHTML = rangeSlider.value;
		// var bulletPosition = (rangeSlider.value /rangeSlider.max);
		// rangeBullet.style.left = (bulletPosition * 578) + "px";
	}

	function change(e: ChangeEvent<HTMLInputElement>) {
		setValue(+e.target.value)
		const bulletPosition = value
		setLeft(80 * value)
	}

	return (
		<div className={cls.container}>
			<div className={cls.range_slider}>
				<span style={{ left: left + 'px' }} ref={rangeBullet} className={cls.rs_label}>
					0
				</span>
				<input
					ref={rangeSlider}
					onChange={e => change(e)}
					className={cls.rs_range}
					type="range"
					value={value}
					min="0.05"
					step="0.05"
					max="2"
				/>
			</div>

			<div className={cls.box_minmax}>
				<span>0</span>
				<span>200</span>
			</div>
		</div>
	)
}

export default InputRange
