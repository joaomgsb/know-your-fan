import React from 'react';
import { Link } from 'react-router-dom';
import FuriaLogo from './FuriaLogo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <FuriaLogo className="h-8 w-auto object-contain" />
              <span className="ml-2 text-xl font-bold">FURIA Fan</span>
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              Conectando fãs apaixonados ao time que amam.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white furia-animation">Home</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white furia-animation">Entrar</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-white furia-animation">Cadastrar</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Acompanhe</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="https://twitter.com/FURIA" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white furia-animation">Twitter</a></li>
              <li><a href="https://www.instagram.com/furiagg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white furia-animation">Instagram</a></li>
              <li><a href="https://www.twitch.tv/furiatv" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white furia-animation">Twitch</a></li>
              <li><a href="https://www.youtube.com/furiatv" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white furia-animation">YouTube</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white furia-animation">Privacidade</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white furia-animation">Termos de Uso</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white furia-animation">Cookies</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} FURIA Esports. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;