import React, { useState } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  Zap,
  BarChart3,
  Layers,
  Users,
  ChevronRight,
  Star
} from 'lucide-react';

export const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Banner */}
      <div className="bg-indigo-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          New
        </span>
        <span>Antigravity 2.0 Engine is now officially live.</span>
        <a href="#features" className="underline font-bold hover:text-indigo-100 flex items-center">
          Learn more <ArrowRight className="w-3 h-3 ml-1" />
        </a>
      </div>

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Nexus<span className="text-indigo-600">AI</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
              <a href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</a>
              <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Customers</a>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
              Sign In
            </button>
            <button className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5">
              Start Free Trial
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Customers</a>
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button className="w-full py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl">
                Sign In
              </button>
              <button className="w-full py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow">
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-indigo-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Intelligent Workflow Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Build, deploy, and scale{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              AI workflows
            </span>{' '}
            at enterprise speed
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The unified system architecture for connecting modern web applications with frontier AI agents,
            transactional databases, and real-time payment processing.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5">
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold rounded-2xl shadow-sm transition-colors">
              Book a Live Demo
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 pt-8 border-t border-slate-100 max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
              Trusted by engineering teams worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400 font-bold text-sm">
              <span className="hover:text-slate-700 transition-colors">ACME CORP</span>
              <span className="hover:text-slate-700 transition-colors">GLOBALSCALE</span>
              <span className="hover:text-slate-700 transition-colors">NEXUSTECH</span>
              <span className="hover:text-slate-700 transition-colors">HYPERDRIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for absolute performance and reliability
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Everything required to orchestrate AI models, handle payments, and maintain transactional safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sub-50ms Response</h3>
              <p className="text-xs leading-relaxed text-slate-500">
                Optimized ASGI pipeline with async task offloading delivers ultra-fast request execution under peak load.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Strict Role-Based RBAC</h3>
              <p className="text-xs leading-relaxed text-slate-500">
                Guaranteed tenant data isolation and cryptographic JWT validation across administrative and customer boundaries.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Deterministic AI Grounding</h3>
              <p className="text-xs leading-relaxed text-slate-500">
                LangChain agent tools query transactional databases directly to eliminate hallucinations in price and stock lookup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Simple Pricing
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Scale transparently as your business grows
            </p>

            <div className="mt-6 inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  billingCycle === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  billingCycle === 'annual' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'
                }`}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Starter */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Developer</h3>
                <p className="text-xs text-slate-500 mt-1">For side-projects and evaluation.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    {billingCycle === 'annual' ? '$19' : '$24'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 10,000 requests/mo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 AI Support Agent</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Community support</li>
                </ul>
              </div>
              <button className="mt-8 w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col justify-between relative transform lg:-translate-y-2">
              <span className="absolute -top-3 right-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                Most Popular
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Scale & Team</h3>
                <p className="text-xs text-slate-400 mt-1">For high-traffic e-commerce stores.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === 'annual' ? '$79' : '$99'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited API requests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> LangChain & LangGraph agents</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Stripe Webhook automation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated 99.99% uptime SLA</li>
                </ul>
              </div>
              <button className="mt-8 w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all">
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enterprise</h3>
                <p className="text-xs text-slate-500 mt-1">Custom VPC and dedicated instances.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">Custom</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Custom AWS deployment</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-region failover</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24/7 Phone & Slack support</li>
                </ul>
              </div>
              <button className="mt-8 w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Contact Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">NexusAI</span>
            <span>• Responsive Frontend Implementation</span>
          </div>
          <p>© 2026 NexusAI Technologies. Built with React + TypeScript + Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};
