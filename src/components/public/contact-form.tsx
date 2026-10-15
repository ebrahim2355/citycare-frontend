"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SelectField, TextareaField, TextField } from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useSession } from "@/hooks/use-session";
import { api } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";
import { CONTACT_TOPICS, contactSchema, type ContactValues } from "@/lib/validations";

const fields = ["name", "email", "topic", "subject", "message"] as const;

export function ContactForm() {
  const { user } = useSession();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", topic: "GENERAL", subject: "", message: "" },
    values: user ? { name: user.name, email: user.email, topic: "GENERAL", subject: "", message: "" } : undefined,
    resetOptions: { keepDirtyValues: true },
  });

  const send = useApiMutation({
    mutationFn: (values: ContactValues) => api.post("/contact", values),
    silentError: true,
    onSuccess: (_, values) => {
      setSentTo(values.email);
      form.reset({ ...form.getValues(), subject: "", message: "" });
    },
    onError: (error) => {
      if (!applyServerErrors(error, form.setError, fields)) {
        form.setError("root", { message: error.message });
      }
    },
  });

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 rounded-xl border bg-emerald-500/5 px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600">
          <CircleCheck className="size-7" aria-hidden />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Your message is with the city team</h2>
          <p className="text-sm text-muted-foreground">We sent a confirmation to {sentTo}. The reply comes to the same address.</p>
        </div>
        <Button variant="outline" onClick={() => setSentTo(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((values) => send.mutate(values))} noValidate className="space-y-6">
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField control={form.control} name="name" label="Your name" autoComplete="name" />
          <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
        </div>
        <SelectField
          control={form.control}
          name="topic"
          label="Topic"
          options={CONTACT_TOPICS.map((topic) => ({ value: topic.value, label: topic.label }))}
        />
        <TextField control={form.control} name="subject" label="Subject" placeholder="What is it about?" />
        <TextareaField
          control={form.control}
          name="message"
          label="Message"
          rows={6}
          maxLength={2000}
          placeholder="Tell us what happened. Add your tracking code if it is about a report."
        />
      </FieldGroup>
      {form.formState.errors.root && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <Button type="submit" size="lg" disabled={send.isPending} className="w-full sm:w-auto">
        {send.isPending ? <Spinner /> : <Send data-icon="inline-start" />}
        Send message
      </Button>
    </form>
  );
}
