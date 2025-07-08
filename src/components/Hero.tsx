import React from 'react';
import { ArrowRight, Star, Shield, Wrench } from 'lucide-react';

interface HeroProps {
  onNavigate: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/60 z-10"></div>
        <img
          src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
          alt="Motorcycle Hero"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight">
            Tu Próxima
            <span className="text-red-500"> Moto</span>
            <br />
            Te Está Esperando
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-white mb-12 max-w-3xl mx-auto font-bold">
            Descubre nuestra amplia selección de motocicletas nuevas y usadas. 
            Calidad garantizada, financiamiento disponible.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button 
              onClick={() => onNavigate('catalogo')}
              className="bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white px-12 py-4 rounded-lg text-xl font-black hover:bg-red-700 transition-all duration-300 flex items-center justify-center space-x-3 group transform hover:scale-105 shadow-2xl"
            >
              <span>Ver Catálogo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('contacto')}
              className="border-2 border-red-600/80 bg-black/30 backdrop-blur-md text-red-500 px-12 py-4 rounded-lg text-xl font-black hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Financiamiento
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 text-white">
              <Star className="w-8 h-8 text-red-500" />
              <span className="text-xl md:text-2xl font-bold">Calidad Garantizada</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white">
              <Shield className="w-8 h-8 text-red-500" />
              <span className="text-xl md:text-2xl font-bold">Garantía Extendida</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white">
              <Wrench className="w-8 h-8 text-red-500" />
              <span className="text-xl md:text-2xl font-bold">Servicio Técnico</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;