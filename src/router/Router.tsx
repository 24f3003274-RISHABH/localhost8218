import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface RouterContextType {
  pathname: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | null>(null);

function normalizePath(path: string): string {
  if (!path) return '/';
  const clean = path.split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return normalizePath(window.location.pathname);
    }
    return '/';
  });

  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalizePath(window.location.pathname));
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const url = new URL(to, window.location.origin);
    const targetPath = normalizePath(url.pathname);

    if (options?.replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }

    setPathname(targetPath);
    setSearchParams(new URLSearchParams(url.search));
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate, searchParams }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextType {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  className?: string;
  activeClassName?: string;
  children: ReactNode;
  replace?: boolean;
}

export function Link({
  to,
  className = '',
  activeClassName = '',
  children,
  replace = false,
  onClick,
  ...rest
}: LinkProps) {
  const { pathname, navigate } = useRouter();
  const normalizedTarget = normalizePath(to.split('?')[0].split('#')[0]);
  const isActive = pathname === normalizedTarget;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    // Don't intercept if modifier keys are pressed (e.g. Cmd+click / Ctrl+click to open new tab)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    navigate(to, { replace });
  };

  const combinedClassName = `${className} ${isActive ? activeClassName : ''}`.trim();

  return (
    <a
      href={to}
      onClick={handleClick}
      className={combinedClassName}
      aria-current={isActive ? 'page' : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}
