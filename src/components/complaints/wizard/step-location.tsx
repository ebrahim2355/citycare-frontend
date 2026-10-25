"use client";

import { Crosshair, ExternalLink, MapPinned, X } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { TextField } from "@/components/forms/form-fields";
import type { PickedLocation } from "@/components/map/location-picker";
import { LazyLocationPicker } from "@/components/map/lazy";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { DHAKA_AREAS, findAreaCenter, mapLink } from "@/lib/areas";
import { DHAKA_CENTER, nearestArea, roundCoordinate } from "@/lib/geo";
import type { ComplaintValues } from "@/lib/validations";

export function StepLocation({ form }: { form: UseFormReturn<ComplaintValues> }) {
  const listId = useId();
  const [locating, setLocating] = useState(false);
  const [latitude, longitude, area] = useWatch({ control: form.control, name: ["latitude", "longitude", "area"] });
  const location = latitude !== undefined && longitude !== undefined ? { latitude, longitude } : null;

  const setLocation = useCallback(
    (picked: PickedLocation) => {
      form.setValue("latitude", picked.latitude, { shouldDirty: true });
      form.setValue("longitude", picked.longitude, { shouldDirty: true });

      if (!form.getValues("area")?.trim()) {
        const suggested = nearestArea([picked.latitude, picked.longitude]);

        if (suggested) {
          form.setValue("area", suggested, { shouldDirty: true, shouldValidate: true });
        }
      }
    },
    [form]
  );

  const locate = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser cannot share its location");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: roundCoordinate(position.coords.latitude), longitude: roundCoordinate(position.coords.longitude) });
        setLocating(false);
        toast.success("Pin placed at your location", { description: "Drag it if the spot is a little off." });
      },
      (error) => {
        setLocating(false);
        toast.error("Could not get your location", {
          description: error.code === error.PERMISSION_DENIED ? "Location access was blocked in the browser." : "Please try again or tap the map.",
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
        {DHAKA_AREAS.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Exact spot on the map (optional)</p>
            <p className="text-sm text-muted-foreground">Tap the map to drop a pin and drag it to adjust. It helps the crew find it fast.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={locate} disabled={locating}>
              {locating ? <Spinner /> : <Crosshair data-icon="inline-start" />}
              Use my location
            </Button>
            {location && (
              <Button type="button" variant="ghost" size="sm" onClick={clearLocation}>
                <X data-icon="inline-start" />
                Remove pin
              </Button>
            )}
          </div>
        </div>
        <LazyLocationPicker value={location} fallbackCenter={findAreaCenter(area) ?? DHAKA_CENTER} onChange={setLocation} />
        {location && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <MapPinned className="size-3.5 text-primary" aria-hidden />
            Pin at {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            <a
              href={mapLink(location.latitude, location.longitude)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Open in OpenStreetMap
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </p>
        )}
      </div>
    </FieldGroup>
  );
}
