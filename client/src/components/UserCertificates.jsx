import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Award, 
  Download, 
  Calendar, 
  BookOpen, 
  Star,
  Trophy
} from 'lucide-react';
import { useGetUserCertificatesQuery, useLazyDownloadCertificateQuery } from '@/features/api/certificateApi';

const UserCertificates = () => {
  const { data: certificatesData, isLoading, error } = useGetUserCertificatesQuery();
  const [downloadCertificate] = useLazyDownloadCertificateQuery();

  const handleDownload = async (courseId) => {
    try {
      await downloadCertificate(courseId).unwrap();
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Error al descargar el certificado');
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error al cargar certificados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const certificates = certificatesData?.certificates || [];

  if (certificates.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes certificados aún
            </h3>
            <p className="text-gray-600">
              Completa cursos para obtener tus certificados de finalización.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Mis Certificados ({certificates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.map((cert, index) => (
              <div key={cert.courseId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <h4 className="font-medium text-lg">{cert.courseTitle}</h4>
                      <Badge variant="secondary">{cert.category}</Badge>
                      {cert.level && (
                        <Badge variant="outline">{cert.level}</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Completado: {new Date(cert.completedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>Puntaje Final: {cert.finalScore}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          Emitido: {new Date(cert.certificateIssuedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleDownload(cert.courseId)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCertificates; 