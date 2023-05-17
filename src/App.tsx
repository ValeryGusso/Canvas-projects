import Canvas from './components/canvas/canvas'
import Header from './components/header/header'
import { Toaster } from 'react-hot-toast'
import './main.css'

function App() {
	return (
		<>
			<Toaster />
			<header>
				<Header />
			</header>
			<main>
				<Canvas />
			</main>
			<footer></footer>
		</>
	)
}

export default App
