import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header/Navigation */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-700">EstateFlow</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-indigo-700">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-indigo-700">How It Works</Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-indigo-700">Testimonials</Link>
          </nav>
          <div className="flex space-x-4">
            <Link 
              href="/auth/login" 
              className="px-5 py-2 text-gray-600 hover:text-indigo-700 rounded-md"
            >
              Log In
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-5 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          Streamline Your Real Estate Management
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
          EstateFlow provides a centralized platform to manage your properties, owners, brokers, tenants, 
          and rent agreements all in one place.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link 
            href="/auth/signup" 
            className="px-8 py-3 bg-indigo-700 text-white rounded-md hover:bg-indigo-800 text-lg"
          >
            Get Started
          </Link>
          <Link 
            href="#demo" 
            className="px-8 py-3 bg-white text-indigo-700 border border-indigo-700 rounded-md hover:bg-indigo-50 text-lg"
          >
            See Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Property Management</h3>
            <p className="text-gray-600">
              Easily add, update, and track all your properties with detailed information and statuses.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Tenant Management</h3>
            <p className="text-gray-600">
              Keep track of tenant profiles, rent payments, and history in one centralized location.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rent Agreement Tracking</h3>
            <p className="text-gray-600">
              Create and manage rent agreements with automated expiration alerts and renewal tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-indigo-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to streamline your real estate operations?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join EstateFlow today and experience efficient property management.
          </p>
          <Link 
            href="/auth/signup" 
            className="px-8 py-3 bg-white text-indigo-700 rounded-md hover:bg-indigo-50 text-lg inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold text-indigo-700 mb-4">EstateFlow</h3>
              <p className="text-gray-600 max-w-xs">
                Streamlining property management for real estate professionals.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Product</h4>
                <ul className="space-y-2">
                  <li><Link href="#features" className="text-gray-600 hover:text-indigo-700">Features</Link></li>
                  <li><Link href="#pricing" className="text-gray-600 hover:text-indigo-700">Pricing</Link></li>
                  <li><Link href="#demo" className="text-gray-600 hover:text-indigo-700">Demo</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-gray-600 hover:text-indigo-700">About</Link></li>
                  <li><Link href="/contact" className="text-gray-600 hover:text-indigo-700">Contact</Link></li>
                  <li><Link href="/careers" className="text-gray-600 hover:text-indigo-700">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-gray-600 hover:text-indigo-700">Privacy</Link></li>
                  <li><Link href="/terms" className="text-gray-600 hover:text-indigo-700">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} EstateFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
