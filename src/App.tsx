import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import SocialMediaPage from './pages/SocialMediaPage';
import EventsPage from './pages/EventsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/social-media" element={<SocialMediaPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;