import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import FuriaLogo from './FuriaLogo';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useUser();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user ? [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Perfil' },
    { path: '/documents', label: 'Documentos' },
    { path: '/social-media', label: 'Redes Sociais' },
    { path: '/faceit', label: 'Faceit' },
    { path: '/events', label: 'Eventos' }
  ] : [
    { path: '/login', label: 'Entrar' },
    { path: '/register', label: 'Cadastrar' }
  ];

  return (
    <nav className="bg-black text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              <FuriaLogo className="h-8 w-auto object-contain" />
              <span className="ml-2 text-xl font-bold">FURIA Fan</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium furia-animation 
                  ${isActive(link.path) 
                    ? 'bg-white text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                {link.label}
              </Link>
            ))}
            
            {user && (
              <button
                onClick={logout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white furia-animation"
              >
                Sair
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Abrir menu principal</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-black">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium furia-animation
                  ${isActive(link.path)
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            
            {user && (
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white furia-animation"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;