import { useState, useEffect } from 'react';
import { Mail, MapPin, Github, Linkedin, ExternalLink, Menu, X, Send, User, Code, Briefcase, FolderOpen, MessageCircle, ChevronDown, Star, Award, Calendar, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import logo from '../assets/myimg.png'

const TEMP_EMAILJS_CONFIG = {
  serviceId: 'service_your_actual_id',
  templateId: 'template_your_actual_id', 
  publicKey: 'your_actual_public_key'
};

const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || TEMP_EMAILJS_CONFIG.serviceId,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || TEMP_EMAILJS_CONFIG.templateId,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || TEMP_EMAILJS_CONFIG.publicKey
};

const isEmailJSConfigured = () => {
  const configured = EMAILJS_CONFIG.serviceId && 
         EMAILJS_CONFIG.templateId && 
         EMAILJS_CONFIG.publicKey &&
         EMAILJS_CONFIG.serviceId.startsWith('service_') &&
         EMAILJS_CONFIG.templateId.startsWith('template_');
  
  console.log('EmailJS Configuration Check:', {
    serviceId: !!EMAILJS_CONFIG.serviceId,
    templateId: !!EMAILJS_CONFIG.templateId,
    publicKey: !!EMAILJS_CONFIG.publicKey,
    configured: configured,
    fromEnvVars: !!import.meta.env.VITE_EMAILJS_SERVICE_ID,
    values: {
      serviceId: EMAILJS_CONFIG.serviceId,
      templateId: EMAILJS_CONFIG.templateId,
      publicKey: EMAILJS_CONFIG.publicKey?.slice(0, 10) + '...'
    }
  });
  
  return configured;
};

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('introduction');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  const [emailjsLoaded, setEmailjsLoaded] = useState(false);

  useEffect(() => {
    const loadEmailJS = () => {
      if (!isEmailJSConfigured()) {
        console.warn('EmailJS environment variables not configured. Using fallback mailto method.');
        setEmailjsLoaded(false);
        return;
      }

      if (window.emailjs) {
        window.emailjs.init(EMAILJS_CONFIG.publicKey);
        setEmailjsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.async = true;
      script.onload = () => {
        if (window.emailjs) {
          window.emailjs.init(EMAILJS_CONFIG.publicKey);
          setEmailjsLoaded(true);
          console.log('EmailJS loaded successfully');
        }
      };
      script.onerror = () => {
        console.error('Failed to load EmailJS');
        setEmailjsLoaded(false);
      };
      document.head.appendChild(script);
    };

    loadEmailJS();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = ['introduction', 'about', 'experience', 'projects', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    const { name, email, subject, message } = formData;
    
    if (!name || !email || !subject || !message) {
      setSubmitStatus({
        loading: false,
        success: false,
        error: 'Please fill in all fields before sending.'
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubmitStatus({
        loading: false,
        success: false,
        error: 'Please enter a valid email address.'
      });
      return;
    }

    setSubmitStatus({ loading: true, success: false, error: null });

    try {
      if (emailjsLoaded && window.emailjs && isEmailJSConfigured()) {
        const templateParams = {
          from_name: name,
          user_name: name,
          name: name,
          from_email: email,
          user_email: email,
          email: email,
          to_name: 'Abdullah Ahmed',
          to_email: import.meta.env.VITE_TO_EMAIL || 'abdullahmed1575@gmail.com',
          subject: subject,
          message: message,
          user_message: message,
          reply_to: email,
          timestamp: new Date().toLocaleString(),
          source: 'Portfolio Website',
          website_url: window.location.origin,
          contact_name: name,
          sender_name: name,
          visitor_name: name
        };

        console.log('Sending email with EmailJS...', { 
          serviceId: EMAILJS_CONFIG.serviceId, 
          templateId: EMAILJS_CONFIG.templateId,
          templateParams: {
            from_name: templateParams.from_name,
            from_email: templateParams.from_email,
            subject: templateParams.subject,
            message: templateParams.message
          }
        });

        const response = await window.emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams
        );

        if (response.status === 200) {
          console.log('Email sent successfully via EmailJS');
          setSubmitStatus({
            loading: false,
            success: true,
            error: null
          });

          setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
          });

          setTimeout(() => {
            setSubmitStatus(prev => ({ ...prev, success: false }));
          }, 5000);

        } else {
          throw new Error(`EmailJS service returned status: ${response.status}`);
        }
      } else {
        console.log('Using mailto fallback...');
        const toEmail = import.meta.env.VITE_TO_EMAIL ;
        const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(`Portfolio Contact: ${subject}`)}&body=${encodeURIComponent(`
        Name: ${name}
        Email: ${email}
        Subject: ${subject}

        Message:
        ${message}

        ---
        Sent from your portfolio website at ${new Date().toLocaleString()}
        Website: ${window.location.origin}
        `)}`;
        
        window.open(mailtoLink, '_blank');

        setSubmitStatus({
          loading: false,
          success: true,
          error: null
        });

        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });

        setTimeout(() => {
          setSubmitStatus(prev => ({ ...prev, success: false }));
        }, 5000);
      }

    } catch (error) {
      console.error('Error sending email:', error);
      
      let errorMessage = 'Failed to send message. ';
      
      if (!isEmailJSConfigured()) {
        errorMessage += 'Email service is not configured. ';
      } else if (!emailjsLoaded) {
        errorMessage += 'Email service is loading, please try again in a moment. ';
      } else if (error.text) {
        errorMessage += `Service error: ${error.text} `;
      } else if (error.status) {
        errorMessage += `Network error (${error.status}). `;
      }
      
      errorMessage += 'Please try again or contact me directly at abdullahmed1575@gmail.com';

      setSubmitStatus({
        loading: false,
        success: false,
        error: errorMessage
      });
    }
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ease-in-out ${
        scrollY > 50 
          ? 'bg-black/90 backdrop-blur-xl shadow-2xl border-b border-cyan-500/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4 md:py-6">
            <div className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              &lt;Abdullah /&gt;
            </div>
            
            <div className="hidden lg:flex space-x-1 xl:space-x-2">
              {['introduction', 'about', 'experience', 'projects', 'contact'].map((section) => (
                <button 
                  key={section}
                  onClick={() => scrollToSection(section)} 
                  className={`relative px-3 lg:px-4 xl:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl xl:rounded-2xl transition-all duration-500 ease-in-out transform hover:scale-110 capitalize font-semibold text-xs lg:text-sm ${
                    activeSection === section 
                      ? 'text-black bg-gradient-to-r from-cyan-400 to-purple-400 shadow-lg shadow-cyan-400/25' 
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 border border-gray-700 hover:border-cyan-400/50'
                  }`}
                >
                  {section}
                  {activeSection === section && (
                    <div className="absolute -top-1.5 lg:-top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-cyan-400 rounded-full animate-ping"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="lg:hidden">
              <button 
                onClick={toggleMenu} 
                className="relative p-2 text-cyan-400 hover:text-purple-400 transition-colors duration-300 border border-gray-700 rounded-lg hover:border-cyan-400/50"
              >
                <div className="relative w-5 h-5">
                  <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-2' : 'top-0.5'}`}></span>
                  <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'top-2'}`}></span>
                  <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-2' : 'top-3.5'}`}></span>
                </div>
              </button>
            </div>
          </div>

          <div className={`lg:hidden transition-all duration-700 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}>
            <div className="px-3 pt-3 pb-6 space-y-2 bg-gray-900/95 backdrop-blur-xl rounded-xl mx-2 mb-4 shadow-2xl border border-gray-700">
              {['introduction', 'about', 'experience', 'projects', 'contact'].map((section, index) => (
                <button 
                  key={section}
                  onClick={() => scrollToSection(section)} 
                  className={`block w-full text-left px-3 sm:px-4 py-3 rounded-lg transition-all duration-500 ease-in-out transform hover:scale-105 capitalize font-semibold text-sm ${
                    activeSection === section 
                      ? 'text-black bg-gradient-to-r from-cyan-400 to-purple-400' 
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 border border-gray-700 hover:border-cyan-400/50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <section id="introduction" className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(cyan 1px, transparent 1px),
                linear-gradient(90deg, cyan 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px'
            }}
          ></div>
          
          <div className="absolute top-1/4 left-1/4 w-32 sm:w-48 md:w-64 lg:w-96 h-32 sm:h-48 md:h-64 lg:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-28 sm:w-40 md:w-56 lg:w-80 h-28 sm:h-40 md:h-56 lg:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-36 md:w-48 lg:w-64 h-24 sm:h-36 md:h-48 lg:h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          
          <div className="absolute top-16 sm:top-20 left-6 sm:left-10 md:left-20 text-cyan-400/30 animate-bounce">
            <Code size={20} className="sm:hidden" />
            <Code size={24} className="hidden sm:block md:hidden" />
            <Code size={32} className="hidden md:block" />
          </div>
          <div className="absolute bottom-24 sm:bottom-32 right-8 sm:right-16 md:right-32 text-purple-400/30 animate-bounce" style={{ animationDelay: '1s' }}>
            <Zap size={16} className="sm:hidden" />
            <Zap size={20} className="hidden sm:block md:hidden" />
            <Zap size={28} className="hidden md:block" />
          </div>
          <div className="absolute top-24 sm:top-32 right-6 sm:right-10 md:right-20 text-pink-400/30 animate-bounce" style={{ animationDelay: '2s' }}>
            <Star size={14} className="sm:hidden" />
            <Star size={18} className="hidden sm:block md:hidden" />
            <Star size={24} className="hidden md:block" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center min-h-screen py-16 sm:py-20">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in-up">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs sm:text-sm font-bold tracking-wider">
                  <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
                  <span>FULL STACK DEVELOPER</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                  <span className="text-white">Hi, I'm</span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Abdullah
                  </span>
                  <br />
                  <span className="text-gray-300">Ahmed</span>
                </h1>
                
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-base sm:text-lg md:text-xl text-gray-400 font-medium">Full Stack Developer & Software Engineer</p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-500">Specializing in Modern Web Technologies</p>
                </div>
              </div>
              
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 md:gap-6">
                <button 
                  onClick={() => scrollToSection('projects')}
                  className="group relative px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold rounded-lg md:rounded-xl lg:rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/25 flex items-center justify-center gap-2 sm:gap-3"
                >
                  <FolderOpen size={16} className="sm:hidden group-hover:rotate-12 transition-transform duration-300" />
                  <FolderOpen size={18} className="hidden sm:block md:hidden group-hover:rotate-12 transition-transform duration-300" />
                  <FolderOpen size={22} className="hidden md:block group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-sm md:text-base">View My Work</span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg md:rounded-xl lg:rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                </button>
                
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="group px-4 sm:px-6 md:px-8 py-3 md:py-4 border-2 border-cyan-400/50 text-cyan-400 font-bold rounded-lg md:rounded-xl lg:rounded-2xl transition-all duration-500 hover:scale-110 hover:bg-cyan-400/10 hover:border-cyan-400 flex items-center justify-center gap-2 sm:gap-3"
                >
                  <MessageCircle size={16} className="sm:hidden group-hover:rotate-12 transition-transform duration-300" />
                  <MessageCircle size={18} className="hidden sm:block md:hidden group-hover:rotate-12 transition-transform duration-300" />
                  <MessageCircle size={22} className="hidden md:block group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-sm md:text-base">Let's Connect</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end animate-fade-in-right" style={{ animationDelay: '0.5s' }}>
              <div className="relative">
                <div className="relative w-48 sm:w-60 md:w-64 lg:w-80 xl:w-[500px] h-32 sm:h-60 md:h-48 lg:h-64 xl:h-[500px]">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500  flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-1 sm:inset-2 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                      <div className="text-center space-y-2 sm:space-y-4">
                        <div className="text-white flex justify-center">
                          <div className="w-56 h-56 md:w-56 md:h-56 lg:w-64 lg:h-72 xl:w-96 xl:h-96 bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center">
                            <img src={logo} alt="Profile" className="w-full h-full object-fill" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -top-2 sm:-top-3 md:-top-4 -right-2 sm:-right-3 md:-right-4 w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
                    <Code size={8} className="sm:hidden text-white" />
                    <Code size={12} className="hidden sm:block md:hidden text-white" />
                    <Code size={16} className="hidden md:block text-white" />
                  </div>
                  <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 -left-2 sm:-left-3 md:-left-4 w-3 sm:w-4 md:w-5 lg:w-6 h-3 sm:h-4 md:h-5 lg:h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                    <Briefcase size={6} className="sm:hidden text-white" />
                    <Briefcase size={8} className="hidden sm:block md:hidden text-white" />
                    <Briefcase size={10} className="hidden md:block lg:hidden text-white" />
                    <Briefcase size={12} className="hidden lg:block text-white" />
                  </div>
                  <div className="absolute top-1/4 -right-1 sm:-right-2 md:-right-3 w-2 sm:w-3 md:w-4 h-2 sm:h-3 md:h-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1/4 -left-1 sm:-left-2 md:-left-3 w-1.5 sm:w-2 md:w-3 h-1.5 sm:h-2 md:h-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <span className="text-gray-400 text-xs sm:text-sm font-medium">Scroll to explore</span>
              <ChevronDown size={16} className="sm:hidden text-cyan-400" />
              <ChevronDown size={20} className="hidden sm:block md:hidden text-cyan-400" />
              <ChevronDown size={24} className="hidden md:block text-cyan-400" />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="min-h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 sm:top-20 left-6 sm:left-10 md:left-20 w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 bg-cyan-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 sm:bottom-20 right-6 sm:right-10 md:right-20 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10 min-h-screen py-12 sm:py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 min-h-screen items-center">
            <div className="relative animate-fade-in-up">
              <div className="relative bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-sm border border-gray-700">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
                  {['React', 'TypeScript', 'Node.js', 'MongoDB', 'FastAPI', 'Django', 'Git', 'JavaScript', 'Python'].map((tech, index) => (
                    <div 
                      key={tech}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 text-center border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-md lg:rounded-lg mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                        <Code size={8} className="sm:hidden text-black" />
                        <Code size={12} className="hidden sm:block md:hidden text-black" />
                        <Code size={16} className="hidden md:block text-black" />
                      </div>
                      <span className="text-gray-300 text-xs sm:text-sm font-semibold">{tech}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full px-3 sm:px-4 md:px-6 py-2 md:py-3">
                    <Award size={12} className="sm:hidden text-black" />
                    <Award size={16} className="hidden sm:block md:hidden text-black" />
                    <Award size={20} className="hidden md:block text-black" />
                    <span className="text-black font-bold text-xs sm:text-sm md:text-base">Tech Enthusiast</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs sm:text-sm font-bold tracking-wider">
                  <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
                  <span>ABOUT ME</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white">
                  Passionate Developer
                  <span className="block text-lg sm:text-xl md:text-2xl text-gray-400 font-normal mt-1 sm:mt-2">Building the Future</span>
                </h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4 md:space-y-6 text-gray-400 leading-relaxed text-sm md:text-base">
                <p>
                  Dedicated and skilled Website Developer with hands-on experience in modern web technologies. 
                  Currently pursuing Computer Science degree with proven ability to build responsive, secure, 
                  and user-friendly applications.
                </p>
                <p>
                  Strong foundation in both frontend and backend development with experience in collaborative 
                  development environments. I'm passionate about writing clean, efficient code and staying 
                  up-to-date with the latest industry trends.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg md:rounded-xl lg:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-700">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 md:mb-4">
                    <div className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg xl:rounded-xl flex items-center justify-center">
                      <Code size={12} className="sm:hidden text-white" />
                      <Code size={16} className="hidden sm:block md:hidden text-white" />
                      <Code size={20} className="hidden md:block text-white" />
                    </div>
                    <span className="text-white font-bold text-sm md:text-base">Frontend</span>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm">React, TypeScript, Tailwind CSS</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg md:rounded-xl lg:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-700">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 md:mb-4">
                    <div className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg xl:rounded-xl flex items-center justify-center">
                      <Briefcase size={12} className="sm:hidden text-white" />
                      <Briefcase size={16} className="hidden sm:block md:hidden text-white" />
                      <Briefcase size={20} className="hidden md:block text-white" />
                    </div>
                    <span className="text-white font-bold text-sm md:text-base">Backend</span>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm">Node.js, FastAPI, MongoDB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="min-h-screen overflow-y-auto bg-black relative">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10 min-h-screen py-12 sm:py-16 md:py-20">
          <div className="space-y-6 sm:space-y-8 md:space-y-12 min-h-screen">
            <div className="text-center space-y-2 sm:space-y-3 md:space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-center space-x-2 text-cyan-400 text-xs sm:text-sm font-bold tracking-wider">
                <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-gradient-to-r from-transparent to-cyan-400"></div>
                <span>EXPERIENCE</span>
                <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white">
                Professional Journey
              </h2>
            </div>
            
            <div className="relative flex-1">
              <div className="absolute left-4 sm:left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500"></div>
              
              <div className="space-y-6 sm:space-y-8 md:space-y-12">
                <div className="relative pl-12 sm:pl-16 md:pl-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="absolute left-2.5 sm:left-4 md:left-6 w-3 sm:w-4 h-3 sm:h-4 bg-cyan-500 rounded-full border-2 sm:border-4 border-black"></div>
                  
                  <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-lg md:rounded-xl lg:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-700 hover:border-cyan-400/50 transition-all duration-500 backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 sm:mb-4 md:mb-6">
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Web Developer Intern</h3>
                        <p className="text-cyan-400 text-sm sm:text-base md:text-lg font-semibold">Symcloud</p>
                      </div>
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg md:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-cyan-400/30 mt-2 lg:mt-0">
                        <Calendar size={12} className="sm:hidden text-cyan-400" />
                        <Calendar size={14} className="hidden sm:block md:hidden text-cyan-400" />
                        <Calendar size={16} className="hidden md:block text-cyan-400" />
                        <span className="text-gray-300 text-xs md:text-sm font-medium">July 2024 – December 2024</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      {[
                        'Developed web applications using React.js and TypeScript',
                        'Built robust backend APIs using FastAPI and Django',
                        'Collaborated with cross-functional teams',
                        'Implemented responsive design principles',
                        'Participated in code reviews and version control',
                        'Gained full-stack development experience'
                      ].map((item, index) => (
                        <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-gray-800/50 transition-all duration-300">
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-1 sm:mt-1.5 md:mt-2 flex-shrink-0"></div>
                          <span className="text-gray-300 text-xs md:text-sm leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="min-h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-32 sm:top-40 right-6 sm:right-10 md:right-20 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 sm:bottom-40 left-6 sm:left-10 md:left-20 w-24 sm:w-36 md:w-48 h-24 sm:h-36 md:h-48 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10 min-h-screen py-12 sm:py-16 md:py-20">
          <div className="space-y-6 sm:space-y-8 md:space-y-12 min-h-screen">
            <div className="text-center space-y-2 sm:space-y-3 md:space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-center space-x-2 text-purple-400 text-xs sm:text-sm font-bold tracking-wider">
                <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-gradient-to-r from-transparent to-purple-400"></div>
                <span>PROJECTS</span>
                <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white">
                Featured Work
              </h2>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-700 hover:border-cyan-400/50 transition-all duration-700 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-xl md:rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="relative z-10 space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center">
                          <FolderOpen size={16} className="sm:hidden text-white" />
                          <FolderOpen size={20} className="hidden sm:block md:hidden text-white" />
                          <FolderOpen size={24} className="hidden md:block text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">Blog Platform</h3>
                          <p className="text-gray-400 text-xs md:text-sm">MERN Stack Project</p>
                        </div>
                      </div>
                      <span className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 px-2 md:px-3 py-1 rounded-full text-xs font-bold border border-cyan-400/30">2024</span>
                    </div>
                    
                    <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                      Full-featured blog platform with user authentication, content management, 
                      and responsive design. Built with modern web technologies.
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {['MongoDB', 'Express.js', 'React.js', 'Node.js'].map((tech) => (
                        <span key={tech} className="bg-gray-800 text-gray-300 px-2 md:px-3 py-1 rounded-lg text-xs font-medium border border-gray-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <a 
                      href="https://github.com/ABDULLAHAHMED1575/blog" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center space-x-2 text-cyan-400 hover:text-white font-semibold transition-all duration-300 text-sm md:text-base"
                    >
                      <Github size={14} className="sm:hidden group-hover/link:rotate-12 transition-transform duration-300" />
                      <Github size={16} className="hidden sm:block md:hidden group-hover/link:rotate-12 transition-transform duration-300" />
                      <Github size={20} className="hidden md:block group-hover/link:rotate-12 transition-transform duration-300" />
                      <span>View Project</span>
                      <ExternalLink size={10} className="sm:hidden group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                      <ExternalLink size={12} className="hidden sm:block md:hidden group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                      <ExternalLink size={16} className="hidden md:block group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                    </a>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-700 hover:border-purple-400/50 transition-all duration-700 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl md:rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="relative z-10 space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center">
                          <Briefcase size={16} className="sm:hidden text-white" />
                          <Briefcase size={20} className="hidden sm:block md:hidden text-white" />
                          <Briefcase size={24} className="hidden md:block text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">E-Commerce Platform</h3>
                          <p className="text-gray-400 text-xs md:text-sm">Full-Stack Solution</p>
                        </div>
                      </div>
                      <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 px-2 md:px-3 py-1 rounded-full text-xs font-bold border border-purple-400/30">2024</span>
                    </div>
                    
                    <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                      Complete e-commerce solution with product catalog, shopping cart, 
                      and order management. Modern API-driven architecture.
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {['React.js', 'FastAPI', 'MongoDB', 'TypeScript'].map((tech) => (
                        <span key={tech} className="bg-gray-800 text-gray-300 px-2 md:px-3 py-1 rounded-lg text-xs font-medium border border-gray-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <a 
                      href="https://github.com/ABDULLAHAHMED1575/ecommerce" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center space-x-2 text-purple-400 hover:text-white font-semibold transition-all duration-300 text-sm md:text-base"
                    >
                      <Github size={14} className="sm:hidden group-hover/link:rotate-12 transition-transform duration-300" />
                      <Github size={16} className="hidden sm:block md:hidden group-hover/link:rotate-12 transition-transform duration-300" />
                      <Github size={20} className="hidden md:block group-hover/link:rotate-12 transition-transform duration-300" />
                      <span>View Project</span>
                      <ExternalLink size={10} className="sm:hidden group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                      <ExternalLink size={12} className="hidden sm:block md:hidden group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                      <ExternalLink size={16} className="hidden md:block group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                    </a>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-700 hover:border-purple-400/50 transition-all duration-700 backdrop-blur-sm animate-fade-in-up md:col-span-2" style={{ animationDelay: '0.6s' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl md:rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="relative z-10 space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center">
                          <Briefcase size={16} className="sm:hidden text-white" />
                          <Briefcase size={20} className="hidden sm:block md:hidden text-white" />
                          <Briefcase size={24} className="hidden md:block text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">Task Manager</h3>
                          <p className="text-gray-400 text-xs md:text-sm">Full-Stack Solution</p>
                        </div>
                      </div>
                      <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 px-2 md:px-3 py-1 rounded-full text-xs font-bold border border-purple-400/30 mt-2 sm:mt-0 self-start sm:self-auto">2024</span>
                    </div>
                    
                    <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                      Complete team collaboration platform with task management, member roles, and project tracking. 
                      Built with React, Node.js, and PostgreSQL for scalable workflow organization.
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {['React.js', 'Node.js' , 'Express.js', 'Postgressql', 'Javascript'].map((tech) => (
                        <span key={tech} className="bg-gray-800 text-gray-300 px-2 md:px-3 py-1 rounded-lg text-xs font-medium border border-gray-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                      <a 
                        href="https://github.com/ABDULLAHAHMED1575/task-manager" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center space-x-2 text-purple-400 hover:text-white font-semibold transition-all duration-300 text-sm md:text-base"
                      >
                        <Github size={14} className="sm:hidden group-hover/link:rotate-12 transition-transform duration-300" />
                        <Github size={16} className="hidden sm:block md:hidden group-hover/link:rotate-12 transition-transform duration-300" />
                        <Github size={20} className="hidden md:block group-hover/link:rotate-12 transition-transform duration-300" />
                        <span>View Code</span>
                        <ExternalLink size={10} className="sm:hidden group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                        <ExternalLink size={12} className="hidden sm:block md:hidden group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                        <ExternalLink size={16} className="hidden md:block group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                      </a>
                      <a 
                        href="https://task-manager-sigma-neon.vercel.app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center space-x-2 text-cyan-400 hover:text-white font-semibold transition-all duration-300 text-sm md:text-base"
                      >
                        <ExternalLink size={14} className="sm:hidden group-hover/link:rotate-12 transition-transform duration-300" />
                        <ExternalLink size={16} className="hidden sm:block md:hidden group-hover/link:rotate-12 transition-transform duration-300" />
                        <ExternalLink size={20} className="hidden md:block group-hover/link:rotate-12 transition-transform duration-300" />
                        <span>Live Demo</span>
                        <ExternalLink size={10} className="sm:hidden group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                        <ExternalLink size={12} className="hidden sm:block md:hidden group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                        <ExternalLink size={16} className="hidden md:block group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="min-h-screen overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-black relative">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10 min-h-screen py-12 sm:py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 min-h-screen items-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in-up">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center space-x-2 text-purple-400 text-xs sm:text-sm font-bold tracking-wider">
                  <div className="w-4 sm:w-6 md:w-8 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></div>
                  <span>GET IN TOUCH</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white">
                  Let's Create
                  <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Something Amazing
                  </span>
                </h2>
              </div>
              
              <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">
                Ready to bring your ideas to life? I'm always excited to work on new projects 
                and collaborate with amazing people.
              </p>
              
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg md:rounded-xl lg:rounded-2xl border border-gray-700">
                  <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg md:rounded-xl flex items-center justify-center">
                    <Mail size={16} className="sm:hidden text-white" />
                    <Mail size={20} className="hidden sm:block md:hidden text-white" />
                    <Mail size={24} className="hidden md:block text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm">Email</p>
                    <p className="text-white font-semibold text-sm md:text-base">abdullahmed1575@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg md:rounded-xl lg:rounded-2xl border border-gray-700">
                  <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center">
                    <MapPin size={16} className="sm:hidden text-white" />
                    <MapPin size={20} className="hidden sm:block md:hidden text-white" />
                    <MapPin size={24} className="hidden md:block text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm">Location</p>
                    <p className="text-white font-semibold text-sm md:text-base">Rawalpindi, Punjab, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-700 backdrop-blur-sm">
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2 md:mb-3">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2.5 sm:py-3 md:py-4 bg-gray-800/50 border border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm md:text-base"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2 md:mb-3">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2.5 sm:py-3 md:py-4 bg-gray-800/50 border border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm md:text-base"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2 md:mb-3">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2.5 sm:py-3 md:py-4 bg-gray-800/50 border border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm md:text-base"
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2 md:mb-3">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 md:px-4 py-2.5 sm:py-3 md:py-4 bg-gray-800/50 border border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none transition-all duration-300 text-white placeholder-gray-400 text-sm md:text-base"
                      placeholder="Tell me about your project..."
                    ></textarea>
                  </div>

                  {submitStatus.error && (
                    <div className="flex items-start space-x-3 p-3 sm:p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      <AlertCircle size={16} className="sm:hidden flex-shrink-0 mt-0.5" />
                      <AlertCircle size={20} className="hidden sm:block flex-shrink-0" />
                      <span className="leading-relaxed">{submitStatus.error}</span>
                    </div>
                  )}

                  {submitStatus.success && (
                    <div className="flex items-start space-x-3 p-3 sm:p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                      <CheckCircle size={16} className="sm:hidden flex-shrink-0 mt-0.5" />
                      <CheckCircle size={20} className="hidden sm:block flex-shrink-0" />
                      <span className="leading-relaxed">Thank you! Your message has been sent successfully. I'll get back to you soon!</span>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSubmit}
                    disabled={submitStatus.loading}
                    className={`group w-full py-3 md:py-4 font-bold rounded-lg md:rounded-xl transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 text-sm md:text-base relative overflow-hidden ${
                      submitStatus.loading 
                        ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                        : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-black hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25'
                    }`}
                  >
                    {submitStatus.loading ? (
                      <>
                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} className="sm:hidden group-hover:rotate-12 transition-transform duration-300" />
                        <Send size={16} className="hidden sm:block md:hidden group-hover:rotate-12 transition-transform duration-300" />
                        <Send size={20} className="hidden md:block group-hover:rotate-12 transition-transform duration-300" />
                        <span>{emailjsLoaded ? 'Send Message' : 'Send via Email Client'}</span>
                      </>
                    )}
                    {!submitStatus.loading && (
                      <div className="absolute inset-0 bg-white/20 rounded-lg md:rounded-xl scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                    )}
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${
                      isEmailJSConfigured() && emailjsLoaded 
                        ? 'bg-green-500' 
                        : isEmailJSConfigured() 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                    }`}></div>
                    <span className="text-center">
                      {isEmailJSConfigured() && emailjsLoaded 
                        ? 'Email service ready' 
                        : isEmailJSConfigured() 
                        ? 'Loading email service...' 
                        : 'Using email client fallback'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-gray-800 py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
            <div className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              &lt;Abdullah /&gt;
            </div>
            <p className="text-gray-400 text-sm md:text-base">
              © 2024 Abdullah Ahmed. Crafted with React.js & Tailwind CSS.
            </p>
            <div className="flex justify-center items-center space-x-4 sm:space-x-6">
                <a 
                    href="https://www.linkedin.com/in/abdullahmed1575/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25"
                    aria-label="LinkedIn Profile"
                >
                    <Linkedin size={20} className="sm:hidden group-hover:rotate-12 transition-transform duration-300" />
                    <Linkedin size={24} className="hidden sm:block group-hover:rotate-12 transition-transform duration-300" />
                </a>
                
                <a 
                    href="https://github.com/ABDULLAHAHMED1575" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-500/25"
                    aria-label="GitHub Profile"
                >
                    <Github size={20} className="sm:hidden group-hover:rotate-12 transition-transform duration-300" />
                    <Github size={24} className="hidden sm:block group-hover:rotate-12 transition-transform duration-300" />
                </a>
            </div>
            <div className="flex justify-center space-x-2 md:space-x-4">
              <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
              <div className="w-6 sm:w-8 md:w-12 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <div className="w-10 sm:w-16 md:w-20 h-0.5 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out forwards;
          opacity: 0;
        }

        /* Custom breakpoint for extra small devices */
        @media (min-width: 475px) {
          .xs\\:flex-row {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  );
}