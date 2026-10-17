"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PasswordField, SelectField, TextField } from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";
import { catalogQueries, queryKeys } from "@/lib/query/options";
import { ROLE_LABEL } from "@/lib/roles";
import { changeRoleSchema, type ChangeRoleValues, createUserSchema, type CreateUserValues } from "@/lib/validations";
import type { User } from "@/types";

function useDepartmentOptions(enabled: boolean) {
  const departments = useQuery({ ...catalogQueries.departments(), enabled });

  return (departments.data ?? []).map((department) => ({ value: department.id, label: department.name }));
}

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const departments = useDepartmentOptions(open);
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", role: "STAFF", departmentId: "", phone: "" },
  });
  const role = useWatch({ control: form.control, name: "role" });

  const create = useApiMutation({
    mutationFn: async ({ departmentId, phone, ...values }: CreateUserValues) =>
      (
        await api.post<User>("/admin/users", {
          ...values,
          ...(values.role === "STAFF" && departmentId ? { departmentId } : {}),
          ...(phone ? { phone } : {}),
        })
      ).data,
    successMessage: (user) => `${ROLE_LABEL[user.role]} account created for ${user.name}`,
    invalidate: [queryKeys.users, queryKeys.stats],
    silentError: true,
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      if (!applyServerErrors(error, form.setError, ["name", "email", "password", "role", "departmentId", "phone"])) {
        form.setError("root", { message: error.message });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <UserPlus data-icon="inline-start" />
          Add staff or admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a staff member or admin</DialogTitle>
          <DialogDescription>Citizens create their own accounts. Share the first password with the new person.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit((values) => create.mutate(values))} className="space-y-6">
          <FieldGroup>
            <TextField control={form.control} name="name" label="Full name" />
            <TextField control={form.control} name="email" label="Email" type="email" />
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                control={form.control}
                name="role"
                label="Role"
                options={[
                  { value: "STAFF", label: "Field staff" },
                  { value: "ADMIN", label: "City admin" },
                ]}
              />
              {role === "STAFF" && (
                <SelectField control={form.control} name="departmentId" label="Department" placeholder="Choose" options={departments} />
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <PasswordField control={form.control} name="password" label="First password" autoComplete="new-password" />
              <TextField control={form.control} name="phone" label="Phone (optional)" type="tel" />
            </div>
          </FieldGroup>
          {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Spinner />}
              Create account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChangeRoleDialog({ user, open, onOpenChange }: { user: User; open: boolean; onOpenChange: (open: boolean) => void }) {
  const departments = useDepartmentOptions(open);
  const form = useForm<ChangeRoleValues>({
    resolver: zodResolver(changeRoleSchema),
    values: { role: user.role, departmentId: user.departmentId ?? "" },
  });
  const role = useWatch({ control: form.control, name: "role" });

  const change = useApiMutation({
    mutationFn: async ({ role: nextRole, departmentId }: ChangeRoleValues) =>
      (await api.patch<User>(`/admin/users/${user.id}/role`, { role: nextRole, ...(nextRole === "STAFF" ? { departmentId } : {}) })).data,
    successMessage: (updated) => `${updated.name} is now ${ROLE_LABEL[updated.role].toLowerCase()}`,
    invalidate: [queryKeys.users, queryKeys.stats],
    onSuccess: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change role of {user.name}</DialogTitle>
          <DialogDescription>A staff member with active jobs must hand them over before the role or department changes.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit((values) => change.mutate(values))} className="space-y-6">
          <FieldGroup>
            <SelectField
              control={form.control}
              name="role"
              label="Role"
              options={[
                { value: "CITIZEN", label: "Citizen" },
                { value: "STAFF", label: "Field staff" },
                { value: "ADMIN", label: "City admin" },
              ]}
            />
            {role === "STAFF" && <SelectField control={form.control} name="departmentId" label="Department" options={departments} />}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={change.isPending || !form.formState.isDirty}>
              {change.isPending && <Spinner />}
              Save role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
