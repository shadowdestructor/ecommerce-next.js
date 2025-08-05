'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function FavoriteButton({ 
  productId, 
  variant = 'ghost',
  size = 'md',
  className = '',
  showText = false
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  
  const isFav = isFavorite(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(productId);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Button
      variant={variant}
      size={showText ? 'sm' : 'icon'}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        !showText && sizeClasses[size],
        'transition-all duration-200',
        isFav && variant === 'ghost' && 'bg-red-50 hover:bg-red-100',
        className
      )}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          'transition-all duration-200',
          isFav ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
        )} 
      />
      {showText && (
        <span className="ml-2">
          {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
        </span>
      )}
    </Button>
  );
}