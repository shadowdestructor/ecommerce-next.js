import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Erişim Reddedildi</CardTitle>
          <CardDescription>
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz. 
            Lütfen yönetici ile iletişime geçin.
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfaya Dön
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Farklı Hesapla Giriş Yap
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}