import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [resetPassword, { data, error, isLoading, isSuccess }] = useResetPasswordMutation();

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data.message || t("auth.password_updated"));
      navigate("/login");
    }

    if (error) {
      toast.error(error?.data?.message || t("auth.reset_password_failed"));
    }
  }, [data, error, isSuccess, navigate, t]);

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitHandler = async () => {
    await resetPassword({ token, ...form, locale: i18n.language });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Unbiax Academia
          </p>
          <h1 className="mt-2 font-hero text-3xl font-semibold tracking-tight text-foreground">
            {t("auth.reset_password")}
          </h1>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardDescription>{t("auth.reset_password_description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.new_password")}</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={changeHandler}
                placeholder={t("auth.password_min_placeholder")}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirm_password")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={changeHandler}
                placeholder={t("auth.confirm_password_placeholder")}
                className="rounded-lg"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="h-11 w-full rounded-lg"
              disabled={isLoading || !token}
              onClick={submitHandler}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.please_wait")}
                </>
              ) : (
                t("auth.update_password")
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

export default ResetPassword;
