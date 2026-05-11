import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
      if (data.resetUrl) {
        toast.info(`${t("auth.dev_reset_link")}: ${data.resetUrl}`);
      }
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
    <div className="flex items-center w-full justify-center mt-20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.recover_password")}</CardTitle>
          <CardDescription>
            {t("auth.recover_password_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("auth.email_placeholder")}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" disabled={isLoading} onClick={submitHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.please_wait")}
              </>
            ) : (
              t("auth.send_reset_link")
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

export default ForgotPassword;