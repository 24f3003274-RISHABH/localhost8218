import React from 'react';
import { GraduationCap, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { Link } from '../../router/Router';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-white mb-4"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" aria-hidden="true" />
              </span>
              <span>PrimePrep</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
              PrimePrep is a dedicated computer-based testing preparation platform for postgraduate university entrance examinations. Aligned precisely with National Testing Agency (NTA) syllabi and examination formats.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                <span>support@primeprep.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                <span>Academic Helpdesk: Mon–Sat, 9:00 AM – 6:00 PM IST</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/exams" className="text-slate-400 hover:text-white transition-colors">
                  Exams Catalogue
                </Link>
              </li>
              <li>
                <Link to="/exams/cuet-pg" className="text-slate-400 hover:text-white transition-colors">
                  CUET PG Overview
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
                  Test Series Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About PrimePrep
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* CUET PG Disciplines */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">
              CUET PG Disciplines
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/exams?category=Computer+Science" className="text-slate-400 hover:text-white transition-colors">
                  Computer Science (SCQP09)
                </Link>
              </li>
              <li>
                <Link to="/exams?category=Commerce" className="text-slate-400 hover:text-white transition-colors">
                  General Paper (COQP11)
                </Link>
              </li>
              <li>
                <Link to="/exams?category=Commerce" className="text-slate-400 hover:text-white transition-colors">
                  Economics (COQP12)
                </Link>
              </li>
              <li>
                <Link to="/exams?category=Science" className="text-slate-400 hover:text-white transition-colors">
                  Life Sciences (SCQP08)
                </Link>
              </li>
              <li>
                <Link to="/exams?category=Science" className="text-slate-400 hover:text-white transition-colors">
                  Mathematics & Physics
                </Link>
              </li>
              <li>
                <Link to="/exams?category=Humanities" className="text-slate-400 hover:text-white transition-colors">
                  Political Science & Psychology
                </Link>
              </li>
            </ul>
          </div>

          {/* Candidate Access & Policies */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">
              Candidate Portal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  Candidate Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/exams/cuet-pg" className="text-slate-400 hover:text-white transition-colors">
                  Marking Scheme Guide
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
                  Refund & Access Terms
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Technical Helpdesk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PrimePrep. All rights reserved. CUET PG is a trademark of NTA.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              <span>NTA CBT Pattern Conforming Mock Engine</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
