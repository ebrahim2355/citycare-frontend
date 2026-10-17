"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PasswordStrength } from "@/components/auth/password-strength";
import { PasswordField, TextField } from "@/components/forms/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useSession, useSetSession } from "@/hooks/use-session";
import { api, authApi } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { applyServerErrors } from "@/lib/forms";
import { ROLE_LABEL } from "@/lib/roles";
import { changePasswordSchema, type ChangePasswordValues, profileSchema, type ProfileValues } from "@/lib/validations";
import type { User } from "@/types";

const DETAILS_HINT = {
  CITIZEN: "Staff use your phone number only when they need to reach you about a report.",
  STAFF: "Admins use these details to reach you about your jobs.",
  ADMIN: "Other admins see these details in the user list.",
} as const;

function ProfileForm({ user }: { user: User }) {
  const setSession = useSetSession();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    values: { name: user.name, phone: user.phone ?? "", address: user.address ?? "", avatarUrl: user.avatarUrl ?? "" },
  });
  const avatarUrl = useWatch({ control: form.control, name: "avatarUrl" });
  const name = useWatch({ control: form.control, name: "name" });

  const save = useApiMutation({
    mutationFn: async ({ name, phone, address, avatarUrl }: ProfileValues) =>
      (
        await api.patch<User>("/users/me", {
          name,
          ...(phone ? { phone } : {}),
          ...(address ? { address } : {}),
          ...(avatarUrl ? { avatarUrl } : {}),
        })
      ).data,
    successMessage: "Profile saved",
    silentError: true,
    onSuccess: (updated) => setSession(updated),
    onError: (error) => {
      if (!applyServerErrors(error, form.setError, ["name", "phone", "address", "avatarUrl"])) {
        form.setError("root", { message: error.message });
      }
    },
  });

  return (
    <Card>
      <form noValidate onSubmit={form.handleSubmit((values) => save.mutate(values))}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4.5 text-primary" aria-hidden />
            Personal details
          </CardTitle>
          <CardDescription>{DETAILS_HINT[user.role]}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center gap-4">
            <UserAvatar name={name || user.name} src={profileSchema.shape.avatarUrl.safeParse(avatarUrl).success ? avatarUrl : null} size={64} />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{user.email}</p>
              <p>
                {ROLE_LABEL[user.role]}
                {user.department ? ` · ${user.department.name}` : ""} · joined {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField control={form.control} name="name" label="Full name" autoComplete="name" />
              <TextField control={form.control} name="phone" label="Phone" type="tel" autoComplete="tel" placeholder="+8801712345678" />
            </div>
            <TextField control={form.control} name="address" label="Address" autoComplete="street-address" placeholder="House, road and area" />
            <TextField
              control={form.control}
              name="avatarUrl"
              label="Profile photo link"
              type="url"
              placeholder="https://"
              description="A link to a square photo. Google accounts use the Google photo."
            />
          </FieldGroup>
          {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
        </CardContent>
        <CardFooter className="mt-6 justify-end border-t">
          <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>
            {save.isPending ? <Spinner /> : <Save data-icon="inline-start" />}
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordForm({ user }: { user: User }) {
  const hasPassword = user.provider === "LOCAL";
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const newPassword = useWatch({ control: form.control, name: "newPassword" });

  const change = useApiMutation({
    mutationFn: (values: ChangePasswordValues) =>
      authApi.post("change-password", { currentPassword: values.currentPassword || undefined, newPassword: values.newPassword }),
    successMessage: "Password changed. Your other devices were signed out.",
    silentError: true,
    onSuccess: () => form.reset(),
    onError: (error) => {
      if (!applyServerErrors(error, form.setError, ["currentPassword", "newPassword"])) {
        form.setError("root", { message: error.message });
      }
    },
  });

  return (
    <Card>
      <form noValidate onSubmit={form.handleSubmit((values) => change.mutate(values))}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4.5 text-primary" aria-hidden />
            {hasPassword ? "Change password" : "Set a password"}
          </CardTitle>
          <CardDescription>
            {hasPassword
              ? "Use at least 8 characters with a letter and a number."
              : "You sign in with Google. Set a password to also sign in with your email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FieldGroup>
            {hasPassword && <PasswordField control={form.control} name="currentPassword" label="Current password" />}
            <div className="space-y-2">
              <PasswordField control={form.control} name="newPassword" label="New password" autoComplete="new-password" />
              <PasswordStrength value={newPassword} />
            </div>
            <PasswordField control={form.control} name="confirmPassword" label="Confirm new password" autoComplete="new-password" />
          </FieldGroup>
          {form.formState.errors.root && <p className="mt-4 text-sm text-destructive">{form.formState.errors.root.message}</p>}
        </CardContent>
        <CardFooter className="mt-6 justify-end border-t">
          <Button type="submit" disabled={change.isPending}>
            {change.isPending ? <Spinner /> : <ShieldCheck data-icon="inline-start" />}
            Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function ProfileSettings({ title, description, extra }: { title: string; description: string; extra?: ReactNode }) {
  const { user } = useSession();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {extra}
          <ProfileForm user={user} />
        </div>
        <div className="space-y-6">
          <PasswordForm user={user} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-4.5 text-primary" aria-hidden />
                Sign in details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                Email: <span className="font-medium">{user.email}</span>
              </p>
              <p>
                Signs in with: <span className="font-medium">{user.provider === "GOOGLE" ? "Google" : "Email and password"}</span>
              </p>
              <p className="pt-2 text-muted-foreground">The email cannot be changed here. Contact the city team if it is wrong.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
