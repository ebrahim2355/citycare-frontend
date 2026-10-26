"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type FieldPath, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { PhotoPicker, UploadProgress } from "@/components/complaints/photo-picker";
import { StepCategory } from "@/components/complaints/wizard/step-category";
import { StepDetails } from "@/components/complaints/wizard/step-details";
import { StepLocation } from "@/components/complaints/wizard/step-location";
import { StepReview } from "@/components/complaints/wizard/step-review";
import { STEP_LABELS, WizardProgress } from "@/components/complaints/wizard/wizard-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useImageUpload } from "@/hooks/use-image-upload";
import { api } from "@/lib/api/client";
import { getErrorText } from "@/lib/api/errors";
import { MAX_IMAGES } from "@/lib/complaint-meta";
import { applyServerErrors } from "@/lib/forms";
import { formatMoney } from "@/lib/format";
import { catalogQueries, queryKeys } from "@/lib/query/options";
import { complaintSchema, type ComplaintValues } from "@/lib/validations";
import { EMPTY_DRAFT, useComplaintDraft, WIZARD_STEPS, type WizardStep } from "@/stores/complaint-draft-store";
import type { CheckoutResult, ComplaintDetail } from "@/types";

const STEP_FIELDS: Record<WizardStep, FieldPath<ComplaintValues>[]> = {
  category: ["categoryId"],
  details: ["title", "description", "priority"],
  location: ["area", "address", "latitude", "longitude", "isPublic"],
  photos: [],
  review: [],
};

const STEP_TEXT: Record<WizardStep, { title: string; description: string }> = {
  category: { title: "What do you want to report?", description: "Pick the type. It decides which department gets it and how fast." },
  details: { title: "Tell us about it", description: "A clear title and a short description help the team prepare." },
  location: { title: "Where is it?", description: "The area and a nearby landmark are enough. Exact location is optional." },
  photos: { title: "Add photos", description: `Photos show the team what to expect. Up to ${MAX_IMAGES}, all optional.` },
  review: { title: "Check and send", description: "Make sure everything is right. You get a tracking code right after." },
};

const ALL_FIELDS = Object.values(STEP_FIELDS).flat();

export function ComplaintWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const { step, kind, values: savedValues, photos, setStep, setKind, saveValues, setPhotos, reset } = useComplaintDraft();
  const categories = useQuery(catalogQueries.categories());
  const { upload, progress, uploading } = useImageUpload();

  const form = useForm<ComplaintValues>({
    resolver: zodResolver(complaintSchema),
    mode: "onTouched",
    defaultValues: savedValues,
  });

  useEffect(() => {
    Promise.resolve(useComplaintDraft.persist.rehydrate()).then(() => {
      form.reset({ ...EMPTY_DRAFT, ...useComplaintDraft.getState().values });
      setReady(true);
    });
  }, [form]);

  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values }) => saveValues(values),
      }),
    [form, saveValues]
  );

  const stepIndex = WIZARD_STEPS.indexOf(step);
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const category = categories.data?.find((item) => item.id === categoryId);
  const isService = category?.type === "SERVICE";

  const goTo = (next: WizardStep) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = async () => {
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });

    if (valid) {
      goTo(WIZARD_STEPS[stepIndex + 1] ?? "review");
    }
  };

  const submit = useMutation({
    mutationFn: async (values: ComplaintValues) => {
      const created = (await api.post<ComplaintDetail>("/complaints", values)).data;
      const photoResult = photos.length ? await upload(created.id, photos) : null;
      let checkoutUrl: string | null = null;
      let paymentError: unknown = null;

      if (created.status === "PENDING_PAYMENT") {
        try {
          checkoutUrl = (await api.post<CheckoutResult>("/payments/initiate", { complaintId: created.id, clientUrl: window.location.origin }))
            .data.checkoutUrl;
        } catch (error) {
          paymentError = error;
        }
      }

      return { created, photoResult, checkoutUrl, paymentError };
    },
    onSuccess: async ({ created, photoResult, checkoutUrl, paymentError }) => {
      reset();
      form.reset(useComplaintDraft.getState().values);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.complaints }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
      ]);

      if (photoResult?.failed) {
        toast.warning(`${photoResult.failed} photo(s) could not be uploaded`, {
          description: "You can add them again from the report page.",
        });
      }

      if (checkoutUrl) {
        toast.info("Taking you to Stripe to pay the fee");
        window.location.assign(checkoutUrl);
        return;
      }

      if (paymentError) {
        toast.error("Your request was saved, but the payment could not start", { description: getErrorText(paymentError).description });
      } else {
        toast.success("Report sent", { description: `Your tracking code is ${created.trackingCode}` });
      }

      router.push(`/dashboard/complaints/${created.id}`);
    },
    onError: (error) => {
      if (applyServerErrors(error, form.setError, ALL_FIELDS)) {
        const firstStep = WIZARD_STEPS.find((item) => STEP_FIELDS[item].some((field) => form.getFieldState(field).invalid));

        if (firstStep) {
          goTo(firstStep);
        }
      }

      const { title, description } = getErrorText(error);

      toast.error(title, { description });
    },
  });

  if (!ready) {
    return <Skeleton className="h-[520px] rounded-xl" />;
  }

  const busy = submit.isPending || uploading || submit.isSuccess;

  return (
    <div className="space-y-6">
      <WizardProgress current={step} onSelect={(target) => WIZARD_STEPS.indexOf(target) <= stepIndex && goTo(target)} />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();

          if (step === "review") {
            form.handleSubmit((values) => submit.mutate(values))();
          } else {
            next();
          }
        }}
      >
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-primary">
              Step {stepIndex + 1} · {STEP_LABELS[step]}
            </p>
            <CardTitle className="text-xl">{STEP_TEXT[step].title}</CardTitle>
            <CardDescription>{STEP_TEXT[step].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === "category" && <StepCategory form={form} kind={kind} onKindChange={setKind} />}
            {step === "details" && <StepDetails form={form} />}
            {step === "location" && <StepLocation form={form} isService={isService} />}
            {step === "photos" && (
              <PhotoPicker files={photos} onChange={setPhotos} max={MAX_IMAGES} disabled={busy} progress={progress} />
            )}
            {step === "review" && (
              <div className="space-y-4">
                <StepReview values={form.getValues()} category={category} photos={photos} onEdit={goTo} />
                {progress !== null && <UploadProgress progress={progress} />}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col-reverse gap-3 border-t sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={stepIndex === 0 || busy}
              onClick={() => goTo(WIZARD_STEPS[stepIndex - 1] ?? "category")}
              className="w-full sm:w-auto"
            >
              <ArrowLeft data-icon="inline-start" />
              Back
            </Button>
            {step === "review" ? (
              <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
                {busy ? <Spinner /> : <Send data-icon="inline-start" />}
                {isService && category ? `Send and pay ${formatMoney(category.fee)}` : "Send report"}
              </Button>
            ) : (
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                {step === "photos" && photos.length === 0 ? "Skip photos" : "Continue"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
