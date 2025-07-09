import React from 'react';
import { X, Calendar, Fuel, Gauge, Star, Shield, Wrench, Phone } from 'lucide-react';
import { Motorcycle } from '../App';

interface MotorcycleModalProps {
  motorcycle: Motorcycle;
  onClose: () => void;
  onPhoneCall: () => void;
  onWhatsApp: () => void;
}

const MotorcycleModal: React.FC<MotorcycleModalProps> = ({ motorcycle, onClose, onPhoneCall, onWhatsApp }) => {
  const handleFinancing = () => {
    const message = encodeURIComponent(`¡Hola! Me interesa información sobre financiamiento para la ${motorcycle.name} ${motorcycle.year}. ¿Qué opciones tienen disponibles?`);
    const whatsappUrl = `https://wa.me/+5493814655651?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-black/95 backdrop-blur-md border border-red-600/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-red-600/30">
            <h2 className="text-3xl font-black text-white">{motorcycle.name}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Image */}
              <div className="relative">
                <img
                  src={motorcycle.image}
                  alt={motorcycle.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-2 rounded-full text-lg font-bold ${
                    motorcycle.condition === 'Nueva' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black'
                  }`}>
                    {motorcycle.condition}
                  </span>
                </div>
                {motorcycle.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold">
                      Destacada
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">{motorcycle.brand} {motorcycle.model}</h3>
                  <p className="text-white text-lg font-bold mb-4">{motorcycle.description}</p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-white">
                    <Calendar className="w-6 h-6" />
                    <div>
                      <p className="text-lg font-bold">Año</p>
                      <p className="text-xl font-black">{motorcycle.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <Fuel className="w-6 h-6" />
                    <div>
                      <p className="text-lg font-bold">Motor</p>
                      <p className="text-xl font-black">{motorcycle.engine}</p>
                    </div>
                  </div>
                  {motorcycle.mileage && (
                    <div className="flex items-center space-x-3 text-white col-span-2">
                      <Gauge className="w-6 h-6" />
                      <div>
                        <p className="text-lg font-bold">Kilometraje</p>
                        <p className="text-xl font-black">{motorcycle.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                {motorcycle.features && (
                  <div>
                    <h4 className="text-xl font-black text-white mb-3">Características</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {motorcycle.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-white">
                          <Star className="w-4 h-4" />
                          <span className="text-lg font-bold">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="bg-red-600/90 backdrop-blur-sm p-6 rounded-lg border border-red-600/50">
                  {/* <p className="text-white text-lg font-bold mb-2">Precio</p> */}
                  <p className="text-4xl font-black text-white mb-4">
                    {/* ${motorcycle.price.toLocaleString()} <span className="text-xl">$</span> */}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={onPhoneCall}
                      className="bg-black/80 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg text-lg font-black hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Contactar</span>
                    </button>
                    <button 
                      onClick={handleFinancing}
                      className="bg-black/80 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg text-lg font-black hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      Financiamiento
                    </button>
                  </div>
                  <button 
                    onClick={onWhatsApp}
                    className="w-full mt-4 bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-black hover:bg-green-700 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Consultar por WhatsApp
                  </button>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="text-white">
                    <Shield className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-lg font-bold">Garantía</p>
                  </div>
                  <div className="text-white">
                    <Wrench className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-lg font-bold">Servicio</p>
                  </div>
                  <div className="text-white">
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-lg font-bold">Calidad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleModal;