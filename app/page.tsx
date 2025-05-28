import Component from '@/free-canvas';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Component />
        </main>
      </div>
    </ProtectedRoute>
  );
}
