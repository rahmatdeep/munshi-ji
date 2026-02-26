import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome to Munshi Ji</h1>
      <p className="text-lg text-slate-600 mb-8">Your personal financial assistant.</p>
      <Link
        to="/about"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Learn More
      </Link>
    </div>
  );
}

function About() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">About Munshi Ji</h1>
      <p className="text-lg text-slate-600 mb-8">Managing finances simplified.</p>
      <Link
        to="/"
        className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="p-6 bg-white shadow-sm flex justify-between items-center">
          <div className="text-2xl font-black text-indigo-600 tracking-tighter">MUNSHI JI</div>
          <div className="space-x-8 font-medium text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-indigo-600 transition-colors">About</Link>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
