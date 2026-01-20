'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { TableConfig } from '@/lib/tables';

interface SidebarProps {
    tables: TableConfig[];
    role: string;
    username: string;
    logoutAction: () => Promise<void>;
    variant?: 'default' | 'admin';
}

export default function Sidebar({ tables, role, username, logoutAction, variant = 'default' }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    // Helper to determine if link is active
    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${variant === 'admin' ? styles.admin : ''}`}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    {variant === 'admin' ? 'Configurator' : 'NewsInsight AI'}
                    <span className={styles.badge}>{role}</span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className={styles.toggleBtn}
                    aria-label="Toggle sidebar"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            <nav className={styles.nav}>
                <ul>
                    {variant === 'admin' ? (
                        <li>
                            <Link
                                href="/dashboard"
                                className={`${styles.navLink}`}
                                title={isCollapsed ? "Back to Dashboard" : ""}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5"></path>
                                    <path d="M12 19l-7-7 7-7"></path>
                                </svg>
                                <span className={styles.linkText}>Back to Dashboard</span>
                            </Link>
                        </li>
                    ) : (
                        <li>
                            <Link
                                href="/dashboard"
                                className={`${styles.navLink} ${pathname === '/dashboard' ? styles.active : ''}`}
                                title={isCollapsed ? "Overview" : ""}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                                <span className={styles.linkText}>Overview</span>
                            </Link>
                        </li>
                    )}
                    {tables.map((table) => {
                        const href = `/dashboard/tables/${table.name}`;
                        return (
                            <li key={table.name}>
                                <Link
                                    href={href}
                                    className={`${styles.navLink} ${isActive(href) ? styles.active : ''}`}
                                    title={isCollapsed ? table.label : ""}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"></path>
                                    </svg>
                                    <span className={styles.linkText}>{table.label}</span>
                                </Link>
                            </li>
                        );
                    })}

                    {role === 'ADMIN' && (
                        <li className={styles.adminSection}>
                            <div className={styles.sectionTitle}>ADMIN</div>
                            <Link
                                href="/admin/permissions"
                                className={`${styles.navLink} ${isActive('/admin/permissions') ? styles.active : ''}`}
                                title={isCollapsed ? "Permissions" : ""}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <span className={styles.linkText}>Permissions</span>
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>

            <div className={styles.userProfile}>
                <form action={logoutAction}>
                    <button type="submit" className={styles.logoutBtn} title={isCollapsed ? "Logout" : ""}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span className={styles.linkText}>Logout</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}
