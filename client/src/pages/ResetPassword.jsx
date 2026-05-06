import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex items-center w-full justify-center mt-20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.reset_password")}</CardTitle>
          <CardDescription>
            {t("auth.reset_password_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="password">{t("auth.new_password")}</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={changeHandler}
              placeholder={t("auth.password_min_placeholder")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">{t("auth.confirm_password")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={changeHandler}
              placeholder={t("auth.confirm_password_placeholder")}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" disabled={isLoading || !token} onClick={submitHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.please_wait")}
              </>
            ) : (
              t("auth.update_password")
            )}
          </Button>
          <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline">
            {t("auth.back_to_login")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;