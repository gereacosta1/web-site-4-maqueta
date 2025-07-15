import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import MotorcycleModal from './components/MotorcycleModal';

export interface Motorcycle {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  image: string;
  condition: 'Nueva' | 'Usada';
  engine: string;
  mileage?: number;
  featured?: boolean;
  description?: string;
  features?: string[];
}

function App() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<Motorcycle | null>(null);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Función para manejar llamadas telefónicas
  const handlePhoneCall = () => {
    window.open('tel:+1 (786) 253-0995', '_self');
  };

  // Función para abrir WhatsApp
  const handleWhatsApp = () => {
    const message = encodeURIComponent('¡Hola! Me interesa información sobre sus motocicletas. ¿Podrían ayudarme?');
    const whatsappUrl = `https://wa.me/+17862530995?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Función para abrir email
  const handleEmail = () => {
    window.open('mailto:onewaymotors2@gmail.com.mx?subject=Consulta sobre motocicletas', '_self');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header activeSection={activeSection} onNavigate={scrollToSection} />
      <Hero onNavigate={scrollToSection} />
      <Catalog onViewDetails={setSelectedMotorcycle} />
      <About />
      <Contact onPhoneCall={handlePhoneCall} onWhatsApp={handleWhatsApp} onEmail={handleEmail} />
      <Footer />
      {selectedMotorcycle && (
        <MotorcycleModal 
          motorcycle={selectedMotorcycle} 
          onClose={() => setSelectedMotorcycle(null)}
          onPhoneCall={handlePhoneCall}
          onWhatsApp={handleWhatsApp}
        />
      )}
    </div>
  );
}

export default App;