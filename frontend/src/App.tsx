import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Беттер кейінірек қосылады
// import LoginPage from './pages/LoginPage';
// import DashboardPage from './pages/DashboardPage';
// import EquipmentPage from './pages/EquipmentPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Колледж жабдықтарын түгендеу</h1>} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
        {/* <Route path="/equipment" element={<EquipmentPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
