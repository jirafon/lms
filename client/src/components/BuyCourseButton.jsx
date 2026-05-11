import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const BuyCourseButton = ({ courseId }) => {
  const { t } = useTranslation();
  const [createCheckoutSession, {data, isLoading, isSuccess, isError, error }] =
    useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async () => {
    await createCheckoutSession(courseId);
  };

  useEffect(()=>{
    if(isSuccess){
       if(data?.url){
        window.location.href = data.url;
       }else{
        toast.error(t("payment.invalid_checkout_response"))
       }
    } 
    if(isError){
      toast.error(error?.data?.message || t("payment.checkout_creation_failed"))
    }
  },[data, isSuccess, isError, error, t])

  return (
    <Button
      disabled={isLoading}
      onClick={purchaseCourseHandler}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("common.loading")}
        </>
      ) : (
        t("payment.purchase_course")
      )}
    </Button>
  );
};

export default BuyCourseButton;
