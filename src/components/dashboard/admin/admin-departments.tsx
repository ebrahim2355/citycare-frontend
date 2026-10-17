"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextareaField, TextField } from "@/components/forms/form-fields";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { applyServerErrors } from "@/lib/forms";
import { catalogQueries, queryKeys } from "@/lib/query/options";
import { departmentSchema, type DepartmentValues } from "@/lib/validations";
import type { Department } from "@/types";

function DepartmentDialog({ department, open, onOpenChange }: { department: Department | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const form = useForm<DepartmentValues>({
    resolver: zodResolver(departmentSchema),
    values: { name: department?.name ?? "", description: department?.description ?? "", contactEmail: department?.contactEmail ?? "" },
  });

  const save = useApiMutation({
    mutationFn: async ({ name, description, contactEmail }: DepartmentValues) => {
      const body = { name, ...(description ? { description } : {}), ...(contactEmail ? { contactEmail } : {}) };

      return department
        ? (await api.patch<Department>(`/departments/${department.id}`, body)).data
        : (await api.post<Department>("/departments", body)).data;
    },
    successMessage: (saved) => (department ? `${saved.name} updated` : `${saved.name} created`),
    invalidate: [queryKeys.departments, ["categories"], queryKeys.stats],
    silentError: true,
    onSuccess: () => onOpenChange(false),
    onError: (error) => {
      if (!applyServerErrors(error, form.setError, ["name", "description", "contactEmail"])) {
        form.setError("root", { message: error.message });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{department ? `Edit ${department.name}` : "New department"}</DialogTitle>
          <DialogDescription>Departments own report categories and staff members.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit((values) => save.mutate(values))} className="space-y-6">
          <FieldGroup>
            <TextField control={form.control} name="name" label="Name" placeholder="For example: Drainage" />
            <TextareaField control={form.control} name="description" label="What it handles" rows={3} maxLength={500} />
            <TextField control={form.control} name="contactEmail" label="Team email (optional)" type="email" />
          </FieldGroup>
          {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Spinner />}
              {department ? "Save changes" : "Create department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDepartment({ department }: { department: Department }) {
  const remove = useApiMutation({
    mutationFn: () => api.delete(`/departments/${department.id}`),
    successMessage: `${department.name} removed`,
    invalidate: [queryKeys.departments, ["categories"], queryKeys.stats],
  });

  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${department.name}`} className="text-muted-foreground hover:text-destructive">
          <Trash2 />
        </Button>
      }
      title={`Remove ${department.name}?`}
      description="Only a department without categories, staff and open reports can be removed."
      confirmLabel="Remove department"
      destructive
      pending={remove.isPending}
      onConfirm={() => remove.mutate()}
    />
  );
}

export function AdminDepartments() {
  const departments = useQuery(catalogQueries.departments());
  const [editing, setEditing] = useState<Department | null>(null);
  const [open, setOpen] = useState(false);

  const openDialog = (department: Department | null) => {
    setEditing(department);
    setOpen(true);
  };

  const columns: Column<Department>[] = [
    {
      key: "name",
      header: "Department",
      className: "min-w-56",
      cell: (department) => (
        <div>
          <p className="font-medium">{department.name}</p>
          {department.description && <p className="line-clamp-1 text-xs text-muted-foreground">{department.description}</p>}
        </div>
      ),
    },
    {
      key: "categories",
      header: "Active categories",
      cell: (department) => (
        <Link href={`/admin/categories?departmentId=${department.id}`} className="font-medium text-primary hover:underline">
          {department._count?.categories ?? 0}
        </Link>
      ),
    },
    { key: "email", header: "Team email", cell: (department) => department.contactEmail ?? <span className="text-muted-foreground">—</span> },
    { key: "created", header: "Created", cell: (department) => <span className="text-sm text-muted-foreground">{formatDate(department.createdAt)}</span> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-24",
      cell: (department) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${department.name}`} onClick={() => openDialog(department)}>
            <Pencil />
          </Button>
          <DeleteDepartment department={department} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="The teams that receive reports. Changes show on the public services page within seconds."
        actions={
          <Button size="lg" onClick={() => openDialog(null)}>
            <Plus data-icon="inline-start" />
            New department
          </Button>
        }
      />
      {departments.error && !departments.data ? (
        <ErrorState error={departments.error} onRetry={() => departments.refetch()} retrying={departments.isFetching} />
      ) : (
        <DataTable
          columns={columns}
          rows={departments.data}
          getRowKey={(department) => department.id}
          loading={departments.isPending}
          caption="Departments"
          renderMobile={(department) => (
            <div className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4">
              <div className="min-w-0 space-y-1">
                <p className="font-medium">{department.name}</p>
                {department.description && <p className="text-sm text-muted-foreground">{department.description}</p>}
                <Link href={`/admin/categories?departmentId=${department.id}`} className="text-xs font-medium text-primary hover:underline">
                  {department._count?.categories ?? 0} active categories
                </Link>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${department.name}`} onClick={() => openDialog(department)}>
                  <Pencil />
                </Button>
                <DeleteDepartment department={department} />
              </div>
            </div>
          )}
          empty={<EmptyState icon={Building2} title="No departments yet" description="Create the first department to start taking reports." />}
        />
      )}
      <DepartmentDialog department={editing} open={open} onOpenChange={setOpen} />
    </div>
  );
}
