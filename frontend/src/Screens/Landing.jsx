import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiUser, FiShield, FiTarget } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-6 text-white`}>
      <Icon className="text-2xl" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer">
          <RxDashboard className="text-3xl text-blue-600" />
          <span className="text-2xl font-bold tracking-tight text-gray-800">EduSphere</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <Link 
            to="/register" 
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
          >
            Apply Now
          </Link>
          <Link 
            to="/login?type=student" 
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold tracking-wide uppercase">
            Transforming Education
          </div>
          <h1 className="text-6xl lg:text-7xl font-extrabold leading-tight text-gray-900">
            Smart Management for <span className="text-blue-600 italic">Modern</span> Institutions.
          </h1>
          <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
            EduSphere streamlines academic operations, empowers faculty, and enhances the student experience through a unified, real-time ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              to="/login?type=admin" 
              className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all group shadow-xl"
            >
              Admin Portal
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login?type=student" 
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-blue-600 transition-all shadow-sm"
            >
              Student Portal
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-4 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
            >
              Apply Now
            </Link>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-10 animate-pulse"></div>
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop" 
            alt="University Campus" 
            className="relative rounded-3xl shadow-2xl border border-gray-100 object-cover aspect-video"
          />
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">Comprehensive Institutional ERP</h2>
            <p className="text-lg text-gray-600">Tailored modules for every stakeholder in the academic ecosystem.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={FiShield}
              title="Centralized Admin"
              description="Full control over faculty, students, branches, and timetables. Manage everything from one hub."
              color="bg-purple-600"
            />
            <FeatureCard 
              icon={FiBookOpen}
              title="Empowered Faculty"
              description="Effortless material uploads, dynamic timetable management, and student performance tracking."
              color="bg-blue-600"
            />
            <FeatureCard 
              icon={FiUser}
              title="Student Success"
              description="Personalized dashboards, instant access to resources, and real-time academic announcements."
              color="bg-emerald-600"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">About EduSphere</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                <strong className="text-gray-900 font-bold">EduSphere</strong> is a modern and efficient College Management System developed to simplify and digitize academic and administrative processes within an institution. It is designed to provide a seamless experience for students, teachers, and administrators through a centralized platform.
              </p>
              <p>
                This project is built with the aim of reducing manual work, improving communication, and enhancing productivity in college operations. EduSphere offers features like role-based access, secure authentication, and dynamic dashboards that make managing academic activities easier and more organized.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-3xl border border-blue-100/50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
               <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
               <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="p-4 bg-white/80 backdrop-blur text-blue-600 rounded-2xl shadow-sm">
                     <FiTarget className="text-3xl" />
                   </div>
                   <h3 className="text-3xl font-bold text-gray-900">Our Vision</h3>
                 </div>
                 <p className="text-gray-700 text-xl leading-relaxed font-medium italic">
                   "To create a smart, scalable, and user-friendly platform that transforms traditional college management into a fully digital and efficient system."
                 </p>
               </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-[2.5rem] p-10 md:p-16 border border-gray-100">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <span>👨‍💻</span> Developed By
              </h3>
              <p className="text-gray-600 text-lg">
                All team members are 4th-year Computer Science students, who collaborated to design and develop this project by combining their technical knowledge and innovative thinking.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 text-center">
              {['Pradeep Yadav', 'Amit Tiwari', 'Shyam Jee', 'Sachin Singh'].map((name, index) => (
                <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-blue-100 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">{name}</h4>
                  <p className="text-sm text-blue-600 font-semibold mt-2 bg-blue-50 py-1.5 px-3 rounded-full inline-block">CS Student</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Wrapper */}
      <section className="py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-1">10k+</div>
            <div className="text-gray-500 font-medium">Students Enrolled</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-1">500+</div>
            <div className="text-gray-500 font-medium">Expert Faculty</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-1">50+</div>
            <div className="text-gray-500 font-medium">Courses Offered</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-1">24/7</div>
            <div className="text-gray-500 font-medium">Real-time Support</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <RxDashboard className="text-2xl text-blue-600" />
            <span className="text-xl font-bold text-gray-800">EduSphere</span>
          </div>
          <p className="text-gray-500 text-sm italic">Designed for the future of education.</p>
          <div className="text-gray-400 text-xs">© 2026 EduSphere Institutional ERP. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
