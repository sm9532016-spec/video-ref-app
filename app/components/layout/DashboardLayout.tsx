import Sidebar from './Sidebar';
import Header from './Header';
import { SearchProvider } from '@/app/context/SearchContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SearchProvider>
            <div className="min-h-screen bg-dark-bg">
                <Sidebar />
                <Header />
                <main className="ml-64 pt-16 min-h-screen">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </SearchProvider>
    );
}
