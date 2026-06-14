import { Award, BookOpen, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  useGetUserCertificatesQuery,
  useLazyDownloadCertificateQuery,
} from "@/features/api/certificateApi";
import { ROUTES } from "@/utils/routes";
import { Skeleton } from "./ui/skeleton";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const UserCertificates = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetUserCertificatesQuery();
  const [downloadCertificate, { isFetching: isDownloading }] =
    useLazyDownloadCertificateQuery();

  const certificates = data?.certificates || [];

  const handleDownload = async (courseId) => {
    try {
      await downloadCertificate(courseId).unwrap();
      toast.success(t("certificate.certificate_issued"));
    } catch {
      toast.error(t("certificate.error_downloading_certificate"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">{t("certificate.load_error")}</p>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
        <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
        <h3 className="text-lg font-semibold text-foreground">
          {t("certificate.no_certificates_yet")}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("certificate.complete_courses_for_certificates")}
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-lg">
          <Link to={ROUTES.catalog}>
            <BookOpen className="mr-2 h-4 w-4" />
            {t("student.explore_catalog_cta")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Award className="h-5 w-5 text-primary" />
            {t("certificate.my_certificates")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("certificate.achievements_description")}
          </p>
        </div>
        <Badge variant="secondary">{certificates.length}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {certificates.map((certificate) => (
          <Card key={String(certificate.courseId)} className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base leading-snug">
                {certificate.courseTitle}
              </CardTitle>
              {certificate.category && (
                <p className="text-xs text-muted-foreground">{certificate.category}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>
                  {t("certificate.completion_date")}:{" "}
                  {formatDate(certificate.certificateIssuedAt || certificate.completedAt)}
                </span>
                {certificate.finalScore != null && (
                  <span>
                    {t("certificate.score")}: {certificate.finalScore}%
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                disabled={isDownloading}
                onClick={() => handleDownload(certificate.courseId)}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("certificate.download_certificate")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserCertificates;
