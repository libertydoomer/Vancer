
import { Sparkles, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
    user: User;
    activePage?: 'services' | 'settings' | 'favorites' | 'home';
    showBackButton?: boolean;
}

export function Header({ user, activePage, showBackButton }: HeaderProps) {
    const userEmail = user.email?.split('@')[0];

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                    {showBackButton && (
                        <Link href="/" className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 transition-colors mr-1 text-slate-500">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    )}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
                        <h1 className="text-lg font-bold text-slate-900">VANCER</h1>
                    </Link>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block text-sm text-slate-500">
                    Hello, <span className="font-medium text-slate-900">{userEmail}</span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <Link
                        href="/services"
                        className={`hidden md:flex items-center gap-1.5 text-sm font-medium transition-colors ${activePage === 'services'
                                ? 'text-blue-600 bg-blue-50 px-3 py-1 rounded-full'
                                : 'text-slate-500 hover:text-blue-600'
                            }`}
                    >
                        <Sparkles className={`w-4 h-4 ${activePage === 'services' ? 'text-blue-600' : ''}`} />
                        Services
                    </Link>

                    <div className="flex items-center gap-1 md:gap-2">
                        <Link href="/services" className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`${activePage === 'services' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600'}`}
                                title="Services"
                            >
                                <Sparkles className="w-5 h-5" />
                            </Button>
                        </Link>

                        <Link href="/settings">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`${activePage === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600'}`}
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                        </Link>

                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500" title="Sign Out">
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </header>
    );
}
