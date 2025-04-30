import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-black mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Página não encontrada</h2>
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/" className="btn btn-primary py-2 px-4 inline-flex items-center">
          <Home className="h-4 w-4 mr-2" />
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;