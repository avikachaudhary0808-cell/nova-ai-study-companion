import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useInView from '../hooks/useInView'
import {
  BookOpen,
  Sparkles,
  Brain,
  BarChart3,
  Zap,
  Shield,
  Clock,
  Users,
  Star,
  ChevronRight,
  CheckCircle2,
  Play,
  Menu,
  X,
  Mail,
  Twitter,
  Github,
  Linkedin,
  ChevronDown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, isInView] = useInView({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function TestimonialCard({ name, role, content, avatarColor }) {
  const [ref, isInView] = useInView()

  return (
    <div
      ref={ref}
      className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 ${
        isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed">"{content}"</p>
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg mr-4`}>
          {name[0]}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer, isOpen, onClick }) {
  const [ref, isInView] = useInView()

  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 ${
        isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 px-6 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [openFAQ, setOpenFAQ] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [heroRef, heroInView] = useInView()
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2 })
  const [howItWorksRef, howItWorksInView] = useInView({ threshold: 0.2 })
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.2 })
  const [ctaRef, ctaInView] = useInView()

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/register')
    }
  }

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Medical Student',
      content: 'This app completely transformed how I study. The AI-generated flashcards saved me hours of work and my retention has improved dramatically.',
      avatarColor: 'bg-blue-500',
    },
    {
      name: 'James Wilson',
      role: 'Software Engineer',
      content: 'I use it to learn new programming concepts. The spaced repetition system is incredibly effective. Best study tool I have ever used.',
      avatarColor: 'bg-green-500',
    },
    {
      name: 'Emma Rodriguez',
      role: 'Graduate Student',
      content: 'Finally, a study app that understands how I learn. The interface is beautiful and the AI features are surprisingly accurate.',
      avatarColor: 'bg-purple-500',
    },
  ]

  const faqs = [
    {
      question: 'How does the AI generate flashcards?',
      answer: 'Our AI analyzes your study materials - notes, PDFs, or text - and automatically generates question-answer pairs optimized for learning. It uses advanced NLP to identify key concepts and create effective flashcards.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use industry-standard encryption for all data transmission and storage. Your study materials and personal information are protected with enterprise-grade security measures.',
    },
    {
      question: 'Can I use this for any subject?',
      answer: 'Yes! Our AI works with any subject - from medicine and law to programming and languages. The system adapts to different content types and creates appropriate flashcards for each field.',
    },
    {
      question: 'How does spaced repetition work?',
      answer: 'Spaced repetition is a learning technique where you review flashcards at increasing intervals. Our algorithm schedules reviews based on how well you know each card, showing difficult cards more often.',
    },
    {
      question: 'Can I collaborate with classmates?',
      answer: 'Yes, you can share flashcard decks with study groups, collaborate on creating materials, and track group progress. Perfect for team-based learning environments.',
    },
    {
      question: 'Is there a mobile app?',
      answer: 'Yes! We have native iOS and Android apps that sync seamlessly with your web account. Study on any device, anywhere.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">AI Study Companion</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-primary-600 transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 hover:text-primary-600 transition-colors">Testimonials</button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-primary-600 transition-colors">FAQ</button>
              {user ? (
                <Link to="/dashboard" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-all hover:scale-105">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Login</Link>
                  <Link to="/register" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-all hover:scale-105">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t animate-fadeIn">
              <div className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-primary-600 transition-colors text-left">Features</button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-primary-600 transition-colors text-left">How It Works</button>
                <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 hover:text-primary-600 transition-colors text-left">Testimonials</button>
                <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-primary-600 transition-colors text-left">FAQ</button>
                {user ? (
                  <Link to="/dashboard" className="text-primary-600 font-medium">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">Login</Link>
                    <Link to="/register" className="bg-primary-600 text-white px-6 py-2 rounded-lg text-center">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 pt-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div
            ref={heroRef}
            className={`text-center transition-all duration-1000 ${
              heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm mb-8 border border-white/20 hover:bg-white/20 transition-all cursor-default">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>AI-Powered Learning Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Study Smarter
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-white">Not Harder</span>
            </h1>

            <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI to generate intelligent flashcards, track your progress, and master any subject faster than ever before.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleGetStarted}
                className="group bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center"
              >
                Start Learning Free
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-300" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-300" />
                Free forever plan
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-300" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={featuresRef}>
          <AnimatedSection className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to excel
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to make your study sessions more productive and enjoyable
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection delay={0}>
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Flashcard Generation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Transform your notes into smart flashcards instantly. Our AI understands context and creates meaningful questions.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Spaced Repetition</h3>
                <p className="text-gray-600 leading-relaxed">
                  Science-backed algorithm that schedules reviews at optimal intervals for maximum long-term retention.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 hover:border-green-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualize your learning journey with detailed statistics, streaks, and performance insights.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed">
                  Generate hundreds of flashcards in seconds. Spend more time learning, less time creating.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:border-pink-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-7 w-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your data is encrypted end-to-end. We prioritize your privacy and never share your materials.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={500}>
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 hover:border-cyan-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-7 w-7 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Study Anywhere</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access your decks on any device. Sync in real-time across web, iOS, and Android apps.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={howItWorksRef}>
          <AnimatedSection className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get started in minutes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your study habits
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Create Account',
                description: 'Sign up for free in seconds. No credit card required to start learning.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                step: '02',
                icon: BookOpen,
                title: 'Upload Materials',
                description: 'Upload your notes, PDFs, or paste text. Our AI will do the heavy lifting.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                step: '03',
                icon: Brain,
                title: 'Start Learning',
                description: 'Review AI-generated flashcards with spaced repetition and track your progress.',
                color: 'from-green-500 to-green-600',
              },
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 150}>
                <div className="relative h-full">
                  <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 h-full flex flex-col">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg`}>
                      {item.step}
                    </div>
                    <div className="mb-4">
                      <item.icon className="h-10 w-10 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed flex-grow">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={testimonialsRef}>
          <AnimatedSection className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by learners worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who have transformed their study habits
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <TestimonialCard {...testimonial} />
              </AnimatedSection>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale transition-all duration-500">
            {['Harvard', 'MIT', 'Stanford', 'Oxford', 'Cambridge'].map((uni, i) => (
              <div key={i} className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                {uni}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">
              FAQ
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our platform
            </p>
          </AnimatedSection>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} delay={index * 50}>
                <FAQItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-primary-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to transform your learning?
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Join 50,000+ students already using AI Study Companion to learn faster and retain more.
            </p>
            <button
              onClick={handleGetStarted}
              className="group bg-white text-primary-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl inline-flex items-center"
            >
              Get Started Free
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-primary-200 mt-6 text-sm">
              Free forever plan available. No credit card needed.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold">AI Study Companion</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering learners worldwide with AI-powered study tools that make learning efficient and enjoyable.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="text-gray-400 hover:text-white transition-colors">Testimonials</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Stay Updated</h3>
              <p className="text-gray-400 mb-4">Get the latest updates and study tips delivered to your inbox.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                />
                <button className="bg-primary-600 px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors">
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 AI Study Companion. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
