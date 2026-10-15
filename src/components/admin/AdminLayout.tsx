import React, { useState } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderTree, 
  BookmarkCheck, 
  HelpCircle, 
  FileCheck2, 
  History, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  ChevronRight, 
  User, 
  GraduationCap,
  Layers,
  FileSpreadsheet,
  Plus
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

export function AdminLayout({ children, title, breadcrumbs = [], actions }: AdminLayoutProps) {
  const { pathname, navigate } = useRouter();
  const { profile, session, signOut, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Check role authorization
  const role = profile?.role;
  const isAuthorized = role === 'platform_admin' || role === 'content_admin' || role === 'admin';

  // Navigation Items
  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Examinations', href: '/admin/examinations', icon: GraduationCap },
    { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    { label: 'Chapters', href: '/admin/chapters', icon: FolderTree },
    { label: 'Test Categories', href: '/admin/categories', icon: Layers },
    { 
      label: 'Question Bank', 
      href: '/admin/questions', 
      icon: HelpCircle,
      subItems: [
        { label: 'All Questions', href: '/admin/questions' },
        { label: 'New Question', href: '/admin/questions/new', icon: Plus },
        { label: 'Bulk Import', href: '/admin/questions/import', icon: FileSpreadsheet }
      ]
    },
    { 
      label: 'Tests & Mocks', 
      href: '/admin/tests', 
      icon: FileCheck2,
      subItems: [
        { label: 'All Tests', href: '/admin/tests' },
        { label: 'Create Test', href: '/admin/tests/new', icon: Plus }
      ]
    },
    { label: 'Import History', href: '/admin/import-history', icon: History }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#0D9488] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  // Deny access if not an administrator
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Administrator Access Required</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            This administrative area is restricted to PrimePrep Platform and Content Administrators. 
            {profile ? (
              <span> You are currently authenticated as a <strong className="text-[#0F172A]">student ({profile.full_name})</strong>.</span>
            ) : (
              <span> You must sign in with an authorized administrator account to continue.</span>
            )}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full py-2.5 px-4 bg-[#0D9488] hover:bg-teal-700 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              Return to Student Portal
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              Sign In with Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row text-[#0F172A]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#FFFFFF] border-r border-[#E2E8F0] shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E2E8F0]">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              P
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#0F172A]">PrimePrep</span>
              <span className="block text-[10px] font-semibold tracking-wider uppercase text-teal-600">Admin Console</span>
            </div>
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Session Role</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
              role === 'platform_admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-teal-100 text-teal-800'
            }`}>
              {role === 'platform_admin' ? 'Platform Admin' : 'Content Admin'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <div key={item.href} className="space-y-0.5">
                <button
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-teal-50 text-[#0D9488]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#0D9488]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.subItems && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      {isCurrent ? '•' : ''}
                    </span>
                  )}
                </button>

                {/* Subitems */}
                {item.subItems && isCurrent && (
                  <div className="pl-9 pr-2 py-1 space-y-1 border-l-2 border-teal-200 ml-4 my-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <button
                          key={sub.href}
                          onClick={() => navigate(sub.href)}
                          className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            isSubActive
                              ? 'text-teal-700 bg-teal-50/60 font-semibold'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <span>{sub.label}</span>
                          {sub.icon && <sub.icon className="w-3 h-3 text-slate-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E2E8F0] space-y-1">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span>Student Dashboard</span>
          </button>
          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col transform transition-transform duration-200 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <span className="font-bold text-sm text-[#0F172A]">PrimePrep Admin</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isCurrent ? 'bg-teal-50 text-[#0D9488]' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#E2E8F0] space-y-1">
          <button
            onClick={() => {
              navigate('/student/dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Dashboard</span>
          </button>
          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
              <button 
                onClick={() => navigate('/admin')}
                className="hover:text-teal-600 font-medium transition-colors cursor-pointer"
              >
                Admin
              </button>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                  {crumb.href ? (
                    <button
                      onClick={() => navigate(crumb.href!)}
                      className="hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-slate-800 font-medium">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Header Actions & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
                  {profile?.full_name?.charAt(0) || 'A'}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-[#0F172A] truncate max-w-[130px]">
                    {profile?.full_name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">{role?.replace('_', ' ')}</div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-lg py-2 z-50 text-xs text-slate-700">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{profile?.full_name}</p>
                      <p className="text-slate-500 text-[11px] truncate">{session?.user?.email || 'admin@primeprep.edu'}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-100 text-teal-800">
                        {role === 'platform_admin' ? 'Platform Administrator' : 'Content Administrator'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/student/dashboard');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>Switch to Student Portal</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut();
                        navigate('/login');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Header Title Area */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">{title}</h1>
            </div>
            {actions && <div className="sm:hidden flex items-center gap-2">{actions}</div>}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
