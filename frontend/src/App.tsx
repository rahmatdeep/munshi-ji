import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import VerifyMagicLink from './pages/VerifyMagicLink';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/verify-magic-link" element={<VerifyMagicLink />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
