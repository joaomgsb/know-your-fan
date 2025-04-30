import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Users, BadgeCheck, Calendar } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            CONHEÇA SEU FÃ
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Junte-se à comunidade FURIA e tenha acesso a experiências exclusivas, 
            eventos especiais e recompensas personalizadas para os verdadeiros fãs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn btn-primary py-3 px-6 text-lg">
              Cadastre-se
            </Link>
            <Link to="/login" className="btn btn-outline border border-white py-3 px-6 text-lg text-white hover:bg-white hover:text-black">
              Entrar
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Por que se juntar a nós?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card p-6 text-center furia-animation">
              <div className="flex justify-center mb-4">
                <Trophy className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Recompensas Exclusivas</h3>
              <p className="text-gray-700">
                Ganhe acesso a produtos, descontos e itens exclusivos disponíveis apenas para membros.
              </p>
            </div>
            
            <div className="card p-6 text-center furia-animation">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Comunidade</h3>
              <p className="text-gray-700">
                Conecte-se com outros fãs, compartilhe experiências e participe de discussões.
              </p>
            </div>
            
            <div className="card p-6 text-center furia-animation">
              <div className="flex justify-center mb-4">
                <BadgeCheck className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Perfil Verificado</h3>
              <p className="text-gray-700">
                Ganhe um perfil verificado que comprova que você é um fã autêntico da FURIA.
              </p>
            </div>
            
            <div className="card p-6 text-center furia-animation">
              <div className="flex justify-center mb-4">
                <Calendar className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Eventos VIP</h3>
              <p className="text-gray-700">
                Acesso prioritário a ingressos e eventos exclusivos com os jogadores da FURIA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para se tornar um superfã?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Junte-se a milhares de fãs apaixonados e faça parte da comunidade FURIA.
          </p>
          <Link to="/register" className="btn btn-primary py-3 px-6 text-lg inline-flex items-center">
            Começar agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;