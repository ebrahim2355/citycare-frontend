"use client";

import { Crosshair, MapPinned, X } from "lucide-react";
import { useId, useState } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { TextField } from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { DHAKA_AREAS, mapLink } from "@/lib/areas";
import type { ComplaintValues } from "@/lib/validations";

export function StepLocation({ form }: { form: UseFormReturn<ComplaintValues> }) {
  const listId = useId();
  const [locating, setLocating] = useState(false);
  const [latitude, longitude] = useWatch({ control: form.control, name: ["latitude", "longitude"] });

  const locate = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser cannot share its location");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", Number(position.coords.latitude.toFixed(6)), { shouldDirty: true });
        form.setValue("longitude", Number(position.coords.longitude.toFixed(6)), { shouldDirty: true });
        setLocating(false);
        toast.success("Location added");
      },
      (error) => {
        setLocating(false);
        toast.error("Could not get your location", {
          description: error.code === error.PERMISSION_DENIED ? "Location access was blocked in the browser." : "Please try again or skip this.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocation = () => {
    form.setValue("latitude", undefined, { shouldDirty: true });
    form.setValue("longitude", undefined, { shouldDirty: true });
  };

  return (
    <FieldGroup>
      <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
        <TextField control={form.control} name="area" label="Area" placeholder="Dhanmondi" list={listId} autoComplete="off" />
        <TextField
          control={form.control}
          name="address"
          label="Address or landmark"
          placeholder="Road 8, near the school gate"
          autoComplete="street-address"
        />
      </div>
      <datalist id={listId}>
        {DHAKA_AREAS.map((area) => (
          <option key={area} value={area} />
        ))}
      </datalist>
      <div className="rounded-xl border bg-muted/30 p-4">
        {latitude !== undefined && longitude !== undefined ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm">
              <MapPinned className="size-4 text-primary" aria-hidden />
              Exact location added ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={mapLink(latitude, longitude)} target="_blank" rel="noreferrer">
                  View on map
                </a>
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearLocation}>
                <X data-icon="inline-start" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Add the exact spot (optional)</p>
              <p className="text-sm text-muted-foreground">Stand at the problem and share your location. It helps the team find it faster.</p>
            </div>
            <Button type="button" variant="outline" onClick={locate} disabled={locating}>
              {locating ? <Spinner /> : <Crosshair data-icon="inline-start" />}
              Use my location
            </Button>
          </div>
        )}
      </div>
    </FieldGroup>
  );
}
