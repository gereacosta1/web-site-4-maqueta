import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

interface ContactProps {
  onPhoneCall: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
}

const Contact: React.FC<ContactProps> = ({ onPhoneCall, onWhatsApp, onEmail }) => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: 'Información sobre motos',
    message: ''
  });

  const [errors, setErrors] = React.useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[\d\s\-\+\(\)]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Teléfono inválido (10-15 dígitos)';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Simular envío de formulario
      alert('¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        reason: 'Información sobre motos',
        message: ''
      });
      setErrors({});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validación especial para teléfono
    if (name === 'phone') {
      // Solo permitir números, espacios, guiones, paréntesis y signo +
      const phoneValue = value.replace(/[^\d\s\-\+\(\)]/g, '');
      // Limitar a 15 caracteres
      if (phoneValue.length <= 15) {
        setFormData(prev => ({ ...prev, [name]: phoneValue }));
      }
    } else if (name === 'firstName' || name === 'lastName') {
      // Limitar nombres a 18 caracteres
      if (value.length <= 18) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'email') {
      // Limitar email a 50 caracteres
      if (value.length <= 50) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'message') {
      // Limitar mensaje a 500 caracteres
      if (value.length <= 500) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGoogleMaps = () => {
    window.open('https://maps.app.goo.gl/TVEdNoY3SyXYKEyU8', '_blank');
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Dirección",
      content: "297 Northwest 54th Street, Miami, FL 33127"
    },
    {
      icon: Phone,
      title: "Teléfono",
      content: "+54 9 3814 65-5651"
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@motocentral.com"
    },
    {
      icon: Clock,
      title: "Horarios",
      content: "Lun - Sab: 10:00 AM - 7:30 PM\n Dom: 10:00 AM - 6:00 PM"
    }
  ];

  return (
    <section id="contacto" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Contáctanos
          </h2>
          <p className="text-white text-xl md:text-2xl max-w-3xl mx-auto font-bold">
            ¿Tienes alguna pregunta o quieres agendar una cita? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-3xl font-black text-white mb-8">
              Información de Contacto
            </h3>
            
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <button 
                  key={index} 
                  onClick={() => {
                    if (info.title === 'Teléfono') onPhoneCall();
                    else if (info.title === 'Email') onEmail();
                    else if (info.title === 'Dirección') handleGoogleMaps();
                  }}
                  className="flex items-start space-x-4 w-full text-left hover:bg-red-600/10 p-3 rounded-lg transition-colors duration-300"
                  disabled={info.title === 'Horarios'}
                >
                  <div className="bg-red-600 p-3 rounded-lg">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-1">{info.title}</h4>
                    <p className="text-white text-lg font-bold whitespace-pre-line">{info.content}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-red-600/90 backdrop-blur-md border border-red-600/50 rounded-lg p-8 text-center shadow-2xl">
              <MapPin className="w-12 h-12 text-white-500 mx-auto mb-4" />
              <h4 className="text-xl font-black text-white mb-2">
                Visítanos en Nuestra Tienda
              </h4>
              <p className="text-white text-lg font-bold mb-4">
                Estamos ubicados en el corazón de la ciudad, fácil acceso en transporte público.
              </p>
              <button 
                onClick={handleGoogleMaps}
                className="bg-black/90 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-lg text-lg font-black hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
              >
                Ver en Google Maps
              </button>
            </div>

            {/* WhatsApp Button */}
            <div className="mt-6">
              <button 
                onClick={onWhatsApp}
                className="w-full bg-green-600/90 backdrop-blur-md border border-green-600/50 text-white px-8 py-4 rounded-lg text-xl font-black hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>¡Chatea con Nosotros por WhatsApp!</span>
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-3xl font-black text-white mb-8">
              Envíanos un Mensaje
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-white mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${errors.firstName ? 'focus:ring-red-300' : 'focus:ring-white'}`}
                    placeholder="Tu nombre"
                    maxLength={18}
                  />
                  {errors.firstName && <p className="text-red-300 text-sm mt-1">{errors.firstName}</p>}
                  <p className="text-white/60 text-sm mt-1">{formData.firstName.length}/18</p>
                </div>
                <div>
                  <label className="block text-lg font-bold text-white mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${errors.lastName ? 'focus:ring-red-300' : 'focus:ring-white'}`}
                    placeholder="Tu apellido"
                    maxLength={18}
                  />
                  {errors.lastName && <p className="text-red-300 text-sm mt-1">{errors.lastName}</p>}
                  <p className="text-white/60 text-sm mt-1">{formData.lastName.length}/18</p>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-white mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-300' : 'focus:ring-white'}`}
                  placeholder="tu@email.com"
                  maxLength={50}
                />
                {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
                <p className="text-white/60 text-sm mt-1">{formData.email.length}/50</p>
              </div>

              <div>
                <label className="block text-lg font-bold text-white mb-2">
                  Teléfono * (solo números)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${errors.phone ? 'focus:ring-red-300' : 'focus:ring-white'}`}
                  placeholder="+52 55 1234 5678"
                  maxLength={15}
                />
                {errors.phone && <p className="text-red-300 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-lg font-bold text-white mb-2">
                  Motivo de Contacto
                </label>
                <select 
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option>Información sobre motos</option>
                  <option>Financiamiento</option>
                  <option>Servicio técnico</option>
                  <option>Garantía</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-bold text-white mb-2">
                  Mensaje * ({formData.message.length}/500)
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full bg-red-600/90 backdrop-blur-md border border-red-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${errors.message ? 'focus:ring-red-300' : 'focus:ring-white'}`}
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                  maxLength={500}
                ></textarea>
                {errors.message && <p className="text-red-300 text-sm mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-black/90 backdrop-blur-md border border-white/20 text-white py-4 rounded-lg text-xl font-black hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar Mensaje</span>
              </button>
            </form>

            <div className="mt-8 p-4 bg-red-600/90 backdrop-blur-md border border-red-600/50 rounded-lg shadow-lg">
              <p className="text-lg text-white font-bold">
                <strong>Respuesta rápida:</strong> Nos comprometemos a responder todos los mensajes 
                en menos de 24 horas durante días hábiles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;