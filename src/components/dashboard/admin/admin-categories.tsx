"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FilterX, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { NumberField, SelectField, TextareaField, TextField } from "@/components/forms/form-fields";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { api } from "@/lib/api/client";
import { categoryFilterSchema, countActiveFilters } from "@/lib/filters";
import { formatMoney, formatSla } from "@/lib/format";
import { applyServerErrors } from "@/lib/forms";
import { catalogQueries, queryKeys } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import { categorySchema, type CategoryValues } from "@/lib/validations";
import type { Category } from "@/types";

function CategoryDialog({ category, open, onOpenChange }: { category: Category | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const departments = useQuery({ ...catalogQueries.departments(), enabled: open });
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    values: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      type: category?.type ?? "COMPLAINT",
      fee: category ? Number(category.fee) : 0,
      slaHours: category?.slaHours ?? 72,
      departmentId: category?.department.id ?? "",
    },
  });
  const type = useWatch({ control: form.control, name: "type" });

  const save = useApiMutation({
    mutationFn: async ({ description, ...values }: CategoryValues) => {
      const body = { ...values, ...(description ? { description } : {}) };

      return category
        ? (await api.patch<Category>(`/categories/${category.id}`, body)).data
        : (await api.post<Category>("/categories", body)).data;
    },
    successMessage: (saved) => (category ? `${saved.name} updated` : `${saved.name} created`),
    invalidate: [["categories"], queryKeys.departments],
    silentError: true,
    onSuccess: () => onOpenChange(false),
    onError: (error) => {
      if (!applyServerErrors(error, form.setError, ["name", "description", "type", "fee", "slaHours", "departmentId"])) {
        form.setError("root", { message: error.message });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? `Edit ${category.name}` : "New category"}</DialogTitle>
          <DialogDescription>Complaints are free. Paid services charge the fee through Stripe before work starts.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit((values) => save.mutate(values))} className="space-y-6">
          <FieldGroup>
            <TextField control={form.control} name="name" label="Name" placeholder="For example: Broken bench" />
            <TextareaField control={form.control} name="description" label="Short description" rows={2} maxLength={500} />
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                control={form.control}
                name="type"
                label="Type"
                options={[
                  { value: "COMPLAINT", label: "Complaint (free)" },
                  { value: "SERVICE", label: "Paid service" },
                ]}
              />
              <SelectField
                control={form.control}
                name="departmentId"
                label="Department"
                placeholder="Choose"
                options={(departments.data ?? []).map((department) => ({ value: department.id, label: department.name }))}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                control={form.control}
                name="fee"
                label="Fee in USD"
                min={0}
                step="0.01"
                disabled={type === "COMPLAINT"}
                description={type === "COMPLAINT" ? "Complaints are always free" : undefined}
              />
              <NumberField control={form.control} name="slaHours" label="Target time (hours)" min={1} max={720} step={1} />
            </div>
          </FieldGroup>
          {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Spinner />}
              {category ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ActiveSwitch({ category, listKey }: { category: Category; listKey: readonly unknown[] }) {
  const queryClient = useQueryClient();
  const toggle = useApiMutation<Category, boolean, { previous: Category[] | undefined }>({
    mutationFn: async (isActive) => (await api.patch<Category>(`/categories/${category.id}`, { isActive })).data,
    onMutate: async (isActive) => {
      await queryClient.cancelQueries({ queryKey: listKey });

      const previous = queryClient.getQueryData<Category[]>(listKey);

      queryClient.setQueryData<Category[]>(listKey, (items) => items?.map((item) => (item.id === category.id ? { ...item, isActive } : item)));

      return { previous };
    },
    onError: (_error, _value, context) => queryClient.setQueryData(listKey, context?.previous),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments });
    },
    successMessage: (saved) => (saved.isActive ? `${saved.name} is open for new reports` : `${saved.name} is hidden from new reports`),
  });

  return (
    <Switch
      checked={category.isActive}
      onCheckedChange={(checked) => toggle.mutate(checked)}
      aria-label={`${category.isActive ? "Hide" : "Show"} ${category.name} for new reports`}
    />
  );
}

function DeleteCategory({ category }: { category: Category }) {
  const remove = useApiMutation({
    mutationFn: () => api.delete(`/categories/${category.id}`),
    successMessage: `${category.name} removed`,
    invalidate: [["categories"], queryKeys.departments],
  });

  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${category.name}`} className="text-muted-foreground hover:text-destructive">
          <Trash2 />
        </Button>
      }
      title={`Remove ${category.name}?`}
      description="A category with open reports cannot be removed. You can hide it with the switch instead."
      confirmLabel="Remove category"
      destructive
      pending={remove.isPending}
      onConfirm={() => remove.mutate()}
    />
  );
}

export function AdminCategories() {
  const { filters, setFilters, clearFilters } = useUrlFilters(categoryFilterSchema);
  const query = catalogQueries.categories({ ...filters, includeInactive: true });
  const categories = useQuery(query);
  const departments = useQuery(catalogQueries.departments());
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(filters);

  const openDialog = (category: Category | null) => {
    setEditing(category);
    setOpen(true);
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Category",
      className: "min-w-56",
      cell: (category) => (
        <div className={cn(!category.isActive && "opacity-60")}>
          <p className="font-medium">{category.name}</p>
          {category.description && <p className="line-clamp-1 text-xs text-muted-foreground">{category.description}</p>}
        </div>
      ),
    },
    { key: "department", header: "Department", cell: (category) => category.department.name },
    {
      key: "type",
      header: "Type",
      cell: (category) => (
        <span
          className={cn(
            "inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium",
            category.type === "SERVICE" ? "border-brass/40 bg-brass/10 text-brass-strong" : "border-primary/20 bg-accent text-accent-foreground"
          )}
        >
          {category.type === "SERVICE" ? "Paid service" : "Complaint"}
        </span>
      ),
    },
    { key: "fee", header: "Fee", cell: (category) => (category.type === "SERVICE" ? formatMoney(category.fee) : "Free") },
    { key: "sla", header: "Target", cell: (category) => formatSla(category.slaHours) },
    { key: "active", header: "Open", cell: (category) => <ActiveSwitch category={category} listKey={query.queryKey} /> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-24",
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${category.name}`} onClick={() => openDialog(category)}>
            <Pencil />
          </Button>
          <DeleteCategory category={category} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories and fees"
        description="What citizens can report, which team gets it, the target time and the fee for paid services."
        actions={
          <Button size="lg" onClick={() => openDialog(null)}>
            <Plus data-icon="inline-start" />
            New category
          </Button>
        }
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={filters.searchTerm}
          onSearch={(searchTerm) => setFilters({ searchTerm })}
          placeholder="Search categories"
          label="Search categories"
          className="lg:w-72"
        />
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <FilterSelect
            value={filters.type}
            onChange={(type) => setFilters({ type })}
            placeholder="All types"
            label="Filter by type"
            options={[
              { value: "COMPLAINT", label: "Complaints" },
              { value: "SERVICE", label: "Paid services" },
            ]}
          />
          <FilterSelect
            value={filters.departmentId}
            onChange={(departmentId) => setFilters({ departmentId })}
            placeholder="All departments"
            label="Filter by department"
            options={(departments.data ?? []).map((department) => ({ value: department.id, label: department.name }))}
          />
        </div>
        {active > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="lg:ml-auto">
            <FilterX data-icon="inline-start" />
            Clear ({active})
          </Button>
        )}
      </div>
      {categories.error && !categories.data ? (
        <ErrorState error={categories.error} onRetry={() => categories.refetch()} retrying={categories.isFetching} />
      ) : (
        <DataTable
          columns={columns}
          rows={categories.data}
          getRowKey={(category) => category.id}
          loading={categories.isPending}
          fetching={categories.isPlaceholderData}
          caption="Categories"
          renderMobile={(category) => (
            <div className="space-y-3 rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className={cn("min-w-0", !category.isActive && "opacity-60")}>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.department.name}</p>
                </div>
                <ActiveSwitch category={category} listKey={query.queryKey} />
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {category.type === "SERVICE" ? formatMoney(category.fee) : "Free"} · {formatSla(category.slaHours)}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={`Edit ${category.name}`} onClick={() => openDialog(category)}>
                    <Pencil />
                  </Button>
                  <DeleteCategory category={category} />
                </div>
              </div>
            </div>
          )}
          empty={<EmptyState icon={Tags} title="No categories match" description="Change the filters or create a new category." />}
        />
      )}
      <CategoryDialog category={editing} open={open} onOpenChange={setOpen} />
    </div>
  );
}
