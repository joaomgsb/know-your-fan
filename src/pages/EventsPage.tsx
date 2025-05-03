import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Tag, Filter, ChevronDown } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

// Mock upcoming events
const UPCOMING_EVENTS = [
  {
    id: 'e1',
    name: 'FURIA Fan Fest 2025',
    date: '2025-01-25',
    time: '12:00 - 20:00',
    location: 'São Paulo, SP',
    description: 'O maior evento para fãs da FURIA com meet & greet, competições e muito mais!',
    image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Presencial',
    tags: ['Meet & Greet', 'Competição'],
    capacity: 500,
    registered: 325
  },
  {
    id: 'e2',
    name: 'Transmissão ao vivo com jogadores',
    date: '2024-12-15',
    time: '19:00 - 21:00',
    location: 'Online',
    description: 'Transmissão exclusiva com jogadores de CS:GO da FURIA respondendo perguntas dos fãs.',
    image: 'https://images.pexels.com/photos/9072388/pexels-photo-9072388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Online',
    tags: ['CS2', 'Q&A'],
    capacity: 2000,
    registered: 756
  },
  {
    id: 'e3',
    name: 'Workshop de Estratégias de CS:GO',
    date: '2025-02-10',
    time: '15:00 - 17:00',
    location: 'Online',
    description: 'Aprenda estratégias avançadas de CS2 com os treinadores da FURIA.',
    image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Online',
    tags: ['CS2', 'Workshop', 'Educativo'],
    capacity: 1000,
    registered: 432
  },
  {
    id: 'e4',
    name: 'FURIA na Brasil Game Show',
    date: '2025-03-20',
    time: '10:00 - 18:00',
    location: 'Rio de Janeiro, RJ',
    description: 'Visite o stand da FURIA na Brasil Game Show e participe de atividades exclusivas.',
    image: 'https://images.pexels.com/photos/5477919/pexels-photo-5477919.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Presencial',
    tags: ['Feira', 'Meet & Greet'],
    capacity: 1500,
    registered: 873
  }
];

// Event category options
const EVENT_CATEGORIES = ['Todos', 'Online', 'Presencial'];

const EventsPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  // Filter events by category
  const filteredEvents = selectedCategory === 'Todos'
    ? UPCOMING_EVENTS
    : UPCOMING_EVENTS.filter(event => event.category === selectedCategory);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Calculate percentage of capacity filled
  const getCapacityPercentage = (registered: number, capacity: number) => {
    return Math.floor((registered / capacity) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-black text-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Eventos FURIA</h1>
          <p className="text-gray-300">
            Descubra e participe de eventos exclusivos para fãs da FURIA
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Filter className="h-5 w-5 mr-2" />
            <span className="font-medium">Filtros:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {EVENT_CATEGORIES.map((category) => (
              <button
                key={category}
                className={`py-1.5 px-3 rounded-md text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
            
            <div className="relative">
              <button
                className="py-1.5 px-3 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                Mais filtros
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-2">
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase">Tags</div>
                  <div className="px-4 py-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox h-4 w-4 text-black" />
                      <span className="ml-2 text-sm">CS:GO</span>
                    </label>
                  </div>
                  <div className="px-4 py-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox h-4 w-4 text-black" />
                      <span className="ml-2 text-sm">Meet & Greet</span>
                    </label>
                  </div>
                  <div className="px-4 py-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox h-4 w-4 text-black" />
                      <span className="ml-2 text-sm">Workshop</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="inline-block px-2 py-1 bg-black text-white text-xs rounded">
                    {event.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {event.registered} inscritos
                    </span>
                    <span>{getCapacityPercentage(event.registered, event.capacity)}% da capacidade</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full" 
                      style={{ width: `${getCapacityPercentage(event.registered, event.capacity)}%` }}
                    ></div>
                  </div>
                </div>
                
                <button className="btn btn-primary w-full py-2">
                  Inscrever-se
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Nenhum evento encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;