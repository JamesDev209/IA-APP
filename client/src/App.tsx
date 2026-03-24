import Navbar from './components/Navbar';
import Home from './pages/Home';
import SoftBackdrop from './components/SoftBackdrop';
import Footer from './components/Footer';
import LenisScroll from './components/lenis';
import { Routes, Route } from 'react-router-dom';
import { Genetator } from './pages/Genetator';
import { Plans } from './pages/Plans';
import { MyGenerations } from './pages/MyGenerations';
import { Result } from './pages/Result';
import { Loading } from './pages/Loading';
import { Community } from './pages/community';


function App() {
	return (
		<>
			<SoftBackdrop />
			<LenisScroll />
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/generate" element={<Genetator />} />
				<Route path="/plans" element={<Plans />} />
				<Route path="/my-generations" element={<MyGenerations />} />
				<Route path="/result/:projectId" element={<Result />} />
				<Route path="/loading" element={<Loading />} />
				<Route path="/community" element={<Community />} />
				{/* Add more routes as needed */}
			</Routes>
			<Footer />
		</>
	);
}
export default App;