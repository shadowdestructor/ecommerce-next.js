import { MainLayout } from '@/components/layout/main-layout';
import { FavoritesList } from '@/components/favorites/favorites-list';

export default function FavoritesPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Favorites</h1>
          <p className="text-gray-600">
            Keep track of products you love and want to buy later
          </p>
        </div>

        <FavoritesList />
      </div>
    </MainLayout>
  );
}