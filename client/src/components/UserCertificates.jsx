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
  ExternalLink,
  Share2
} from 'lucide-react';
import { useGetUserCertificatesQuery, useLazyDownloadCertificateQuery } from '@/features/api/certificateApi';
import { useTranslation } from 'react-i18next';

const UserCertificates = () => {
  const { data: certificatesData, isLoading, error } = useGetUserCertificatesQuery();
  const [downloadCertificate] = useLazyDownloadCertificateQuery();
  const { t } = useTranslation();

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
      <div className="text-center py-12">
        <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('certificates.no_certificates')}</h3>
        <p className="text-gray-500 mb-4">{t('certificates.complete_courses_to_earn')}</p>
        <Button variant="outline">
          <BookOpen className="h-4 w-4 mr-2" />
          {t('certificates.browse_courses')}
        </Button>
      </div>
    );
  }

  const handleShare = (certificate) => {
    // Implement certificate sharing logic
    console.log('Sharing certificate:', certificate.id);
  };

  const handleVerify = (certificate) => {
    // Open verification URL in new tab
    window.open(certificate.verificationUrl, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            {t('certificates.my_certificates')}
          </h2>
          <p className="text-gray-600 mt-1">{t('certificates.achievements_description')}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {certificates.length} {t('certificates.certificate', { count: certificates.length })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">{certificate.courseTitle}</CardTitle>
                </div>
                <Badge 
                  variant={certificate.type === 'completion' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {certificate.type === 'completion' ? t('certificates.completion') : t('certificates.achievement')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Certificate Image/Preview */}
              <div className="aspect-[3/2] bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-dashed border-yellow-200 flex items-center justify-center">
                <div className="text-center">
                  <Award className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t('certificates.certificate_preview')}</p>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{t('certificates.issued_on')}: {formatDate(certificate.issuedDate)}</span>
                </div>
                
                {certificate.score && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4" />
                    <span>{t('certificates.score')}: {certificate.score}%</span>
                  </div>
                )}

                {certificate.instructor && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{t('certificates.instructor')}: {certificate.instructor}</span>
                  </div>
                )}
              </div>

              {/* Certificate ID */}
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <span className="font-medium">{t('certificates.certificate_id')}:</span> {certificate.id}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDownload(certificate.courseId)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('certificates.download')}
                </Button>
                
                {certificate.verificationUrl && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleVerify(certificate)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleShare(certificate)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Certificate Stats */}
      <Card>
        <CardHeader>
          <CardTitle>{t('certificates.achievement_summary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{certificates.length}</div>
              <div className="text-sm text-blue-700">{t('certificates.total_certificates')}</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {certificates.filter(c => c.type === 'completion').length}
              </div>
              <div className="text-sm text-green-700">{t('certificates.completion_certificates')}</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {certificates.filter(c => c.type === 'achievement').length}
              </div>
              <div className="text-sm text-purple-700">{t('certificates.achievement_certificates')}</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(certificates.reduce((acc, c) => acc + (c.score || 0), 0) / certificates.length)}%
              </div>
              <div className="text-sm text-orange-700">{t('certificates.average_score')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCertificates; 