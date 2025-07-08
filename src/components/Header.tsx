import React, { useState } from 'react';
import { Menu, X, Phone, MapPin } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'catalogo', label: 'Catálogo' },
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handlePhoneCall = () => {
    window.open('tel:+525512345678', '_self');
  };

  const handleLogoClick = () => {
    onNavigate('inicio');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-md border-b border-red-600">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-red-600 p-2 rounded-lg">
              <img 
                  src="/IMG/One_Way_Motors_Logo-1.png" 
                  alt="Logo de One Way Motors"
                  className="w-10 h-10 object-contain rounded-lg"
                  />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">ONE WAY MOTORS</h1>
              <p className="text-sm text-red-400 font-medium">Motos Nuevas y Usadas</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-lg font-bold transition-all duration-300 hover:text-red-400 hover:scale-105 ${
                  activeSection === item.id ? 'text-red-500 border-b-2 border-red-500' : 'text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Contact Info - Desktop */}
          <div className="hidden lg:flex items-center space-x-6 text-white">
            <button 
              onClick={handlePhoneCall}
              className="flex items-center space-x-2 hover:text-red-400 transition-colors duration-300"
            >
              <Phone className="w-4 h-4 text-red-500" />
              <span className="text-lg font-semibold">+54 9 3814 65-5651</span>
            </button>
            <button 
              onClick={() => onNavigate('contacto')}
              className="flex items-center space-x-2 hover:text-red-400 transition-colors duration-300"
            >
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-lg font-semibold">MIAMI</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={handlePhoneCall}
              className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors duration-300"
            >
              <Phone className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold">Llamar</span>
            </button>
            <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-red-400 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-red-600">
            <nav className="flex flex-col space-y-2 pt-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left py-3 px-4 text-lg font-bold transition-colors duration-200 hover:text-red-400 hover:bg-red-600/20 rounded ${
                    activeSection === item.id ? 'text-red-500 bg-red-600/20' : 'text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;