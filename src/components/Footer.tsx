import React from 'react';
import { Bike, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/motocentral", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/motocentral", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com/motocentral", label: "Twitter" },
    { icon: Youtube, href: "https://youtube.com/motocentral", label: "YouTube" }
  ];

  const quickLinks = [
    { text: "Inicio", href: "#inicio" },
    { text: "Catálogo", href: "#catalogo" },
    { text: "Nosotros", href: "#nosotros" },
    { text: "Contacto", href: "#contacto" }
  ];

  const services = [
    { text: "Motos Nuevas", href: "#catalogo" },
    { text: "Motos Usadas", href: "#catalogo" },
    { text: "Financiamiento", href: "#contacto" },
    { text: "Servicio Técnico", href: "#contacto" }
  ];

  const handleSocialClick = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTermsClick = () => {
    alert('Términos y Condiciones: Documento en desarrollo. Para más información, contáctanos.');
  };

  const handlePrivacyClick = () => {
    alert('Política de Privacidad: Documento en desarrollo. Para más información, contáctanos.');
  };

  const handleCookiesClick = () => {
    alert('Política de Cookies: Documento en desarrollo. Para más información, contáctanos.');
  };

  return (
    <footer className="bg-black border-t border-red-600">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-2 mb-4 hover:scale-105 transition-transform duration-300"
            >
              <div className="bg-red-600 p-2 rounded-lg">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-wide">MotoCentral</h3>
                <p className="text-lg text-red-400 font-bold">Motos Nuevas y Usadas</p>
              </div>
            </button>
            <p className="text-white text-lg font-bold mb-6 max-w-md">
              Tu tienda de confianza para motocicletas nuevas y usadas. 
              Más de 15 años brindando calidad, servicio y los mejores precios.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <button
                  key={index}
                  onClick={() => handleSocialClick(social.href)}
                  className="bg-red-600/90 backdrop-blur-md border border-red-600/50 p-3 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-white" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-black text-white mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleLinkClick(link.href)}
                    className="text-white text-lg font-bold hover:text-red-400 transition-colors"
                  >
                    {link.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-black text-white mb-4">Servicios</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleLinkClick(service.href)}
                    className="text-white text-lg font-bold hover:text-red-400 transition-colors"
                  >
                    {service.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-red-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white text-lg font-bold">
            © 2024 MotoCentral. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button 
              onClick={handleTermsClick}
              className="text-white hover:text-red-400 text-lg font-bold transition-colors"
            >
              Términos y Condiciones
            </button>
            <button 
              onClick={handlePrivacyClick}
              className="text-white hover:text-red-400 text-lg font-bold transition-colors"
            >
              Política de Privacidad
            </button>
            <button 
              onClick={handleCookiesClick}
              className="text-white hover:text-red-400 text-lg font-bold transition-colors"
            >
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;