import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Mail, UserRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getUserRole } from "@/utils/userRole";
import Breadcrumbs from "@/components/Breadcrumbs";
import UserCertificates from "@/components/UserCertificates";
import { ROUTES } from "@/utils/routes";

const Profile = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateUserIsLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("profilePhoto", profilePhoto);
    await updateUser(formData);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(updateUserData?.message || t("profile.updated_success"));
    }
    if (isError) {
      toast.error(error?.data?.message || t("profile.updated_error"));
    }
  }, [error, updateUserData, isSuccess, isError, refetch, t]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-8 h-40 w-full rounded-xl" />
      </div>
    );
  }

  const user = data?.user;
  const userRole = getUserRole(user);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: t("navigation.my_space"), to: ROUTES.app },
          { label: t("navigation.profile") },
        ]}
      />

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          {t("navigation.my_account")}
        </p>
        <h1 className="mt-2 font-hero text-3xl font-semibold tracking-tight text-foreground">
          {t("navigation.profile")}
        </h1>
      </div>

      <Card className="mb-10 border-border shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
          <Avatar className="h-24 w-24 border-2 border-border md:h-28 md:w-28">
            <AvatarImage
              src={user?.photoUrl || "https://github.com/shadcn.png"}
              alt={user?.name || "User"}
            />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{user.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {userRole?.toUpperCase() || "STUDENT"}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("auth.email")}</p>
                  <p className="text-sm font-medium text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <UserRound className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("profile.name_label")}</p>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                </div>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-lg">
                  {t("profile.edit_profile")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("profile.edit_profile")}</DialogTitle>
                  <DialogDescription>{t("profile.edit_description")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="space-y-2">
                    <Label>{t("profile.name_label")}</Label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("profile.name_label")}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.photo_label")}</Label>
                    <Input
                      onChange={onChangeHandler}
                      type="file"
                      accept="image/*"
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    disabled={updateUserIsLoading}
                    className="rounded-lg"
                    onClick={updateUserHandler}
                  >
                    {updateUserIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.please_wait")}
                      </>
                    ) : (
                      t("common.save")
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <UserCertificates />
    </div>
  );
};

export default Profile;
