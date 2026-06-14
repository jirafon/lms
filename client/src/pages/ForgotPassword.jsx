import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [forgotPassword, { data, error, isLoading, isSuccess }] = useForgotPasswordMutation();

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data.message || t("auth.reset_link_sent"));
      navigate("/login", { replace: true });
    }

    if (error) {
      toast.error(error?.data?.message || t("auth.reset_link_failed"));
    }
  }, [data, error, isSuccess, navigate, t]);

  const submitHandler = async () => {
    await forgotPassword({ email, locale: i18n.language });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Unbiax Academia
          </p>
          <h1 className="mt-2 font-hero text-3xl font-semibold tracking-tight text-foreground">
            {t("auth.recover_password")}
          </h1>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardDescription>{t("auth.recover_password_description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("auth.email_placeholder")}
                className="rounded-lg"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="h-11 w-full rounded-lg" disabled={isLoading} onClick={submitHandler}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.please_wait")}
                </>
              ) : (
                t("auth.send_reset_link")
              )}
            </Button>
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              {t("auth.back_to_login")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
