import React, { useState } from 'react';
import { Heart, Eye, Fuel, Gauge, Calendar } from 'lucide-react';
import { Motorcycle } from '../App';

interface CatalogProps {
  onViewDetails: (motorcycle: Motorcycle) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onViewDetails }) => {
  const [filter, setFilter] = useState<'all' | 'nueva' | 'usada'>('all');
  const [favorites, setFavorites] = useState<number[]>([]);

  const motorcycles: Motorcycle[] = [
    {
      id: 1,
      name: "Yamaha YZF-R3",
      brand: "Yamaha",
      model: "YZF-R3",
      year: 2024,
      price: 85000,
      image: "https://images.pexels.com/photos/3205735/pexels-photo-3205735.jpeg?auto=compress&cs=tinysrgb&w=800",
      condition: "Nueva",
      engine: "321cc",
      featured: true,
      description: "La Yamaha YZF-R3 es perfecta para principiantes y riders experimentados. Con su motor de 321cc, ofrece la potencia ideal para la ciudad y carretera.",
      features: ["ABS", "Frenos de disco", "Tablero digital", "LED", "Arranque eléctrico"]
    },
    {
      id: 2,
      name: "Honda CB650R",
      brand: "Honda",
      model: "CB650R",
      year: 2023,
      price: 120000,
      image: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800",
      condition: "Nueva",
      engine: "649cc",
      description: "La Honda CB650R combina estilo naked con tecnología avanzada. Motor de 4 cilindros en línea para máximo rendimiento.",
      features: ["ABS", "Control de tracción", "Modos de conducción", "Suspensión ajustable", "Frenos Brembo"]
    },
    {
      id: 3,
      name: "Kawasaki Ninja 400",
      brand: "Kawasaki",
      model: "Ninja 400",
      year: 2022,
      price: 65000,
      image: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800",
      condition: "Usada",
      engine: "399cc",
      mileage: 8500,
      description: "Kawasaki Ninja 400 en excelente estado. Perfecta para quienes buscan deportividad y eficiencia en combustible.",
      features: ["ABS", "Frenos de disco", "Carenado completo", "Asiento biplaza", "Luces LED"]
    },
    {
      id: 4,
      name: "BMW G310R",
      brand: "BMW",
      model: "G310R",
      year: 2024,
      price: 95000,
      image: "https://images.pexels.com/photos/3205735/pexels-photo-3205735.jpeg?auto=compress&cs=tinysrgb&w=800",
      condition: "Nueva",
      engine: "313cc",
      featured: true,
      description: "BMW G310R ofrece la calidad alemana en una moto accesible. Ideal para uso urbano con toque premium.",
      features: ["ABS", "Suspensión invertida", "Tablero LCD", "Frenos de disco", "Diseño premium"]
    },
    {
      id: 5,
      name: "Ducati Monster 821",
      brand: "Ducati",
      model: "Monster 821",
      year: 2021,
      price: 180000,
      image: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800",
      condition: "Usada",
      engine: "821cc",
      mileage: 12000,
      description: "Ducati Monster 821, la naked italiana por excelencia. Potencia, estilo y exclusividad en una sola moto.",
      features: ["ABS", "Control de tracción", "Modos de conducción", "Suspensión Öhlins", "Escape Termignoni"]
    },
    {
      id: 6,
      name: "KTM Duke 390",
      brand: "KTM",
      model: "Duke 390",
      year: 2023,
      price: 78000,
      image: "https://images.pexels.com/photos/3205735/pexels-photo-3205735.jpeg?auto=compress&cs=tinysrgb&w=800",
      condition: "Nueva",
      engine: "373cc",
      description: "KTM Duke 390, la bestia naranja que domina las calles. Máxima diversión y adrenalina garantizada.",
      features: ["ABS", "Control de tracción", "Ride by Wire", "Suspensión WP", "Frenos ByBre"]
    }
  ];

  const filteredMotorcycles = motorcycles.filter(moto => {
    if (filter === 'all') return true;
    return moto.condition.toLowerCase() === filter;
  });

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  return (
    <section id="catalogo" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Nuestro Catálogo
          </h2>
          <p className="text-white text-xl md:text-2xl max-w-3xl mx-auto font-bold">
            Explora nuestra selección de motocicletas nuevas y usadas. 
            Encuentra la moto perfecta para ti.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-red-600/90 backdrop-blur-md border border-red-600/50 rounded-lg p-2 flex space-x-2 shadow-2xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-8 py-3 rounded-md text-lg font-black transition-all duration-300 ${
                filter === 'all' 
                  ? 'bg-black/90 backdrop-blur-sm text-white shadow-lg' 
                  : 'text-white hover:bg-black/30'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('nueva')}
              className={`px-8 py-3 rounded-md text-lg font-black transition-all duration-300 ${
                filter === 'nueva' 
                  ? 'bg-black/90 backdrop-blur-sm text-white shadow-lg' 
                  : 'text-white hover:bg-black/30'
              }`}
            >
              Nuevas
            </button>
            <button
              onClick={() => setFilter('usada')}
              className={`px-8 py-3 rounded-md text-lg font-black transition-all duration-300 ${
                filter === 'usada' 
                  ? 'bg-black/90 backdrop-blur-sm text-white shadow-lg' 
                  : 'text-white hover:bg-black/30'
              }`}
            >
              Usadas
            </button>
          </div>
        </div>

        {/* Motorcycles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMotorcycles.map((moto) => (
            <div
              key={moto.id}
              className="bg-red-600/95 backdrop-blur-md border border-red-600/30 rounded-lg overflow-hidden shadow-2xl hover:shadow-red-500/50 transition-all duration-300 group transform hover:scale-105"
            >
              <div className="relative">
                <img
                  src={moto.image}
                  alt={moto.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    moto.condition === 'Nueva' 
                      ? 'bg-black text-white font-bold' 
                      : 'bg-white text-black font-bold'
                  }`}>
                    {moto.condition}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => toggleFavorite(moto.id)}
                    className="p-2 rounded-full bg-black/80 backdrop-blur-sm hover:bg-black transition-colors border border-white/20"
                    aria-label={favorites.includes(moto.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        favorites.includes(moto.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-white'
                      }`} 
                    />
                  </button>
                </div>
                {moto.featured && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-black/90 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold">
                      Destacada
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-black text-white mb-2">{moto.name}</h3>
                <p className="text-white mb-4 text-lg font-bold">{moto.brand} • {moto.model}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-white">
                    <Calendar className="w-4 h-4" />
                    <span className="text-lg font-bold">{moto.year}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white">
                    <Fuel className="w-4 h-4" />
                    <span className="text-lg font-bold">{moto.engine}</span>
                  </div>
                  {moto.mileage && (
                    <div className="flex items-center space-x-2 text-white col-span-2">
                      <Gauge className="w-4 h-4" />
                      <span className="text-lg font-bold">{moto.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black text-white">
                      ${moto.price.toLocaleString()}
                    </p>
                    <p className="text-lg text-white font-bold">MXN</p>
                  </div>
                  <button 
                    onClick={() => onViewDetails(moto)}
                    className="bg-black/90 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg text-lg font-black hover:bg-white hover:text-black transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
                    aria-label={`Ver detalles de ${moto.name}`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalles</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={() => {
              // Simular carga de más motos
              alert('Próximamente más motocicletas disponibles. ¡Contáctanos para conocer nuestro inventario completo!');
            }}
            className="bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white px-12 py-4 rounded-lg text-xl font-black hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Ver Más Motos
          </button>
        </div>
      </div>
    </section>
  );
};

export default Catalog;