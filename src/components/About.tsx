import React, { useState } from 'react';
import { Award, Users, Clock, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';

const About: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const storeImages = [
    "public/IMG/IMG-TIENDA.jpeg",
    "public/IMG/IMG-TIENDA(2).webp",
    "public/IMG/IMG-TIENDA(3).webp",
    "public/IMG/IMG-TIENDA(2).webp",
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % storeImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + storeImages.length) % storeImages.length);
  };

  const stats = [
    { icon: Award, number: "15+", text: "Años de Experiencia" },
    { icon: Users, number: "5000+", text: "Clientes Satisfechos" },
    { icon: Clock, number: "24/7", text: "Soporte Técnico" },
    { icon: Wrench, number: "100%", text: "Garantía de Calidad" }
  ];

  const services = [
    {
      title: "Venta de Motos Nuevas",
      description: "Amplia selección de las mejores marcas del mercado con garantía completa.",
      icon: "🏍️"
    },
    {
      title: "Motos Usadas Certificadas",
      description: "Motocicletas usadas revisadas y certificadas con garantía extendida.",
      icon: "✅"
    },
    {
      title: "Financiamiento Flexible",
      description: "Opciones de financiamiento adaptadas a tu presupuesto y necesidades.",
      icon: "💳"
    },
    {
      title: "Servicio Técnico",
      description: "Taller especializado con técnicos certificados y repuestos originales.",
      icon: "🔧"
    }
  ];

  return (
    <section id="nosotros" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Sobre Nosotros
          </h2>
          <p className="text-white text-xl md:text-2xl max-w-4xl mx-auto font-bold">
            Con más de 15 años de experiencia en el mercado, somos la tienda de motocicletas 
            más confiable de la región. Ofrecemos calidad, servicio y precios competitivos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-red-600/90 backdrop-blur-md border border-red-600/50 p-4 rounded-lg inline-block mb-4 shadow-xl">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{stat.number}</h3>
              <p className="text-white text-lg font-bold">{stat.text}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-black text-white mb-6">
              Tu Confianza es Nuestra Prioridad
            </h3>
            <p className="text-white text-lg font-bold mb-6">
              En ONE WAY MOTORS, entendemos que comprar una motocicleta es una decisión importante. 
              Por eso, nos comprometemos a brindarte la mejor experiencia de compra, 
              desde la selección hasta el servicio post-venta.
            </p>
            <p className="text-white text-lg font-bold mb-6">
              Nuestro equipo de expertos está capacitado para ayudarte a encontrar la moto 
              perfecta según tus necesidades y presupuesto. Ofrecemos financiamiento flexible 
              y garantías extendidas para tu tranquilidad.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                Calidad Garantizada
              </span>
              <span className="bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                Precios Competitivos
              </span>
              <span className="bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                Servicio Profesional
              </span>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg">
            <img
                src={storeImages[currentImageIndex]}
              alt="Nuestra tienda"
                className="w-full h-80 object-cover transition-transform duration-500"
            />
              
              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {storeImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors border ${
                      index === currentImageIndex ? 'bg-red-600/90 backdrop-blur-sm border-red-600' : 'bg-white/50 backdrop-blur-sm border-white/30'
                    }`}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-3xl font-black text-white text-center mb-12">
            Nuestros Servicios
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <button 
                key={index} 
                onClick={() => {
                  // Simular navegación a servicio específico
                  alert(`Más información sobre: ${service.title}. ¡Contáctanos para detalles!`);
                }}
                className="bg-red-600/90 backdrop-blur-md border border-red-600/50 p-6 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl text-left"
              >
                <div className="text-3xl mb-4">{service.icon}</div>
                <h4 className="text-xl font-black text-white mb-3">{service.title}</h4>
                <p className="text-white text-lg font-bold">{service.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;