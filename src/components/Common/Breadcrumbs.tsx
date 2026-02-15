import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface BreadcrumbsProps {
    className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className }) => {
    const location = useLocation();
    const pathname = location.pathname;

    // Determine root based on path
    let rootLabel = 'Home';
    let rootPath = '/';

    if (pathname.startsWith('/provider')) {
        rootLabel = 'Provider';
        rootPath = '/provider';
    } else if (pathname.startsWith('/doctor')) {
        rootLabel = 'Doctor';
        rootPath = '/doctor';
    } else if (pathname.startsWith('/dashboard')) {
        rootLabel = 'Home';
        rootPath = '/dashboard';
    }

    // Split path
    // Remove root path from calculation to avoid duplication
    const workPath = pathname === rootPath ? '' : pathname.substring(rootPath.length === 1 ? 0 : rootPath.length);
    const segments = workPath.split('/').filter(Boolean);

    if (segments.length === 0 && pathname === '/') return null; // Don't show on pure root if needed, or show just Home

    const items = [{ label: rootLabel, path: rootPath }];
    let currentPath = rootPath === '/' ? '' : rootPath;

    segments.forEach((seg) => {
        currentPath += `/${seg}`;
        items.push({
            label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
            path: currentPath,
        });
    });

    return (
        <nav className={clsx("flex items-center text-sm text-slate-500 mb-4", className)} aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={item.path} className="flex items-center">
                            {index > 0 && <ChevronRight size={14} className="mx-1 text-slate-400" />}
                            {isLast ? (
                                <span className="font-semibold text-slate-900" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="hover:text-teal-600 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
            <style>{`
        .mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
        .mb-4 { margin-bottom: 1rem; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .text-sm { font-size: 0.875rem; }
        .text-slate-500 { color: #64748b; }
        .text-slate-400 { color: #94a3b8; }
        .text-slate-900 { color: #0f172a; }
        .font-semibold { font-weight: 600; }
        .hover\\:text-teal-600:hover { color: #0d9488; }
        .transition-colors { transition: color 0.15s; }
      `}</style>
        </nav>
    );
};
