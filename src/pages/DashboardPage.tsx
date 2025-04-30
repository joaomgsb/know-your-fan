import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Activity, Calendar, ShoppingBag, FileText, User, Clock, Award, Bell } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  // Calculate profile completion percentage
  const getProfileCompletionPercentage = () => {
    let total = 6; // Total number of profile sections
    let completed = 1; // Start with 1 for basic info which is required
    
    if (user.documents && user.documents.length > 0) completed += 1;
    if (user.socialProfiles && user.socialProfiles.length > 0) completed += 1;
    if (user.interests && user.interests.length > 0) completed += 1;
    if (user.events && user.events.length > 0) completed += 1;
    if (user.purchaseHistory && user.purchaseHistory.length > 0) completed += 1;
    
    return Math.floor((completed / total) * 100);
  };

  const completionPercentage = getProfileCompletionPercentage();

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-black text-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bem-vindo, {user.name.split(' ')[0]}!</h1>
              <p className="text-gray-300">
                Membro desde {formatDate(user.createdAt)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/profile" className="btn py-2 px-4 bg-white text-black hover:bg-gray-200">
                Ver Perfil
              </Link>
            </div>
          </div>
        </div>
        
        {/* Profile Completion */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Complete seu perfil</h2>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span>Progresso</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(!user.documents || user.documents.length === 0) && (
              <Link to="/documents" className="group border border-gray-200 rounded-md p-4 hover:border-black transition-all">
                <FileText className="h-6 w-6 mb-2 text-gray-400 group-hover:text-black" />
                <h3 className="font-medium mb-1">Adicionar documentos</h3>
                <p className="text-sm text-gray-500">Verifique sua identidade</p>
              </Link>
            )}
            
            {(!user.socialProfiles || user.socialProfiles.length === 0) && (
              <Link to="/social-media" className="group border border-gray-200 rounded-md p-4 hover:border-black transition-all">
                <Activity className="h-6 w-6 mb-2 text-gray-400 group-hover:text-black" />
                <h3 className="font-medium mb-1">Conectar redes sociais</h3>
                <p className="text-sm text-gray-500">Vincule seus perfis</p>
              </Link>
            )}
            
            {(!user.interests || user.interests.length === 0) && (
              <Link to="/profile" className="group border border-gray-200 rounded-md p-4 hover:border-black transition-all">
                <User className="h-6 w-6 mb-2 text-gray-400 group-hover:text-black" />
                <h3 className="font-medium mb-1">Completar perfil</h3>
                <p className="text-sm text-gray-500">Adicione seus interesses</p>
              </Link>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Suas Atividades</h2>
              
              {(!user.events && !user.purchaseHistory) && (
                <p className="text-gray-500 italic">Nenhuma atividade registrada ainda.</p>
              )}
              
              <div className="space-y-6">
                {user.events && user.events.map((event, index) => (
                  <div key={`event-${index}`} className="flex">
                    <div className="mr-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(event.date)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.attended ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {event.attended ? 'Participou' : 'Inscrito'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {user.purchaseHistory && user.purchaseHistory.map((purchase, index) => (
                  <div key={`purchase-${index}`} className="flex">
                    <div className="mr-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{purchase.product}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(purchase.date)} • R$ {purchase.price.toFixed(2)}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        Compra
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Próximos Eventos</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-md p-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 mb-2 inline-block">
                    Novo
                  </span>
                  <h3 className="font-medium">FURIA Fan Fest 2025</h3>
                  <p className="text-sm text-gray-500 mb-2">25 de Janeiro, 2025 • São Paulo</p>
                  <button className="btn btn-primary py-1 px-3 text-sm w-full">
                    Participar
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-md p-3">
                  <h3 className="font-medium">Transmissão ao vivo com jogadores</h3>
                  <p className="text-sm text-gray-500 mb-2">15 de Dezembro, 2024 • Online</p>
                  <button className="btn btn-primary py-1 px-3 text-sm w-full">
                    Participar
                  </button>
                </div>
              </div>
              
              <Link to="/events" className="block text-sm text-center mt-4 link">
                Ver todos os eventos
              </Link>
            </div>
            
            {/* Rewards */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Suas Recompensas</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  250 pontos
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Status de Fã Silver</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    Ativo
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Notificações exclusivas</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    Ativado
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Acesso antecipado</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    Em breve
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">
                  Complete seu perfil para desbloquear mais recompensas.
                </p>
                <Link to="/rewards" className="btn btn-secondary py-1 px-3 text-sm w-full">
                  Ver todas as recompensas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;