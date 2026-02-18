import Sidebar from './Sidebar';
import Header from './Header';
import { SearchProvider } from '@/app/context/SearchContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SearchProvider>
            <div className="min-h-screen bg-dark-bg overflow-x-hidden">
                <Sidebar />
                <Header />
                <main className="xl:ml-64 pt-16 min-h-screen pb-20 xl:pb-0">
                    <div className="p-4 xl:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </SearchProvider>
    );
}
