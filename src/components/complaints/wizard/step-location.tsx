"use client";

import { useQuery } from "@tanstack/react-query";
import { Crosshair, ExternalLink, Globe2, MapPinned, Users, X } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { Controller, type UseFormReturn, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SupportButton } from "@/components/community/support-button";
import { TextField } from "@/components/forms/form-fields";
import type { PickedLocation } from "@/components/map/location-picker";
import { LazyLocationPicker } from "@/components/map/lazy";
import { RelativeTime } from "@/components/shared/relative-time";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { DHAKA_AREAS, findAreaCenter, mapLink } from "@/lib/areas";
import { STATUS_META } from "@/lib/complaint-meta";
import { DHAKA_CENTER, formatDistance, nearestArea, roundCoordinate } from "@/lib/geo";
import { communityQueries } from "@/lib/query/options";
import type { ComplaintValues } from "@/lib/validations";

function NearbyReports({ latitude, longitude, categoryId }: { latitude: number; longitude: number; categoryId: string }) {
  const { data } = useQuery({ ...communityQueries.nearby({ latitude, longitude, categoryId }), enabled: Boolean(categoryId) });
  const others = data?.filter((report) => !report.isMine) ?? [];

  if (!others.length) {
    return null;
  }

  return (
    <div role="status" className="animate-fade-in rounded-xl border border-amber-300/70 bg-amber-50/70 p-4 dark:border-amber-400/25 dark:bg-amber-400/8">
      <p className="flex items-center gap-2 font-medium">
        <Users className="size-4 text-amber-700 dark:text-amber-300" aria-hidden />
        {others.length === 1 ? "Someone already reported this nearby" : `${others.length} similar reports are already open nearby`}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        If it is the same problem, add your voice instead of sending a new report. The crew sees how many people it affects.
      </p>
      <ul className="mt-3 space-y-2">
        {others.map((report) => (
          <li key={report.id} className="flex flex-col gap-3 rounded-lg border bg-background/90 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium">{report.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistance(report.distanceMeters)} away · {STATUS_META[report.status].label} · <RelativeTime value={report.createdAt} />
              </p>
            </div>
            <SupportButton
              complaintId={report.id}
              supportCount={report.supportCount}
              supported={report.supportedByMe}
              redirect="/dashboard/complaints/new"
              className="shrink-0"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StepLocation({ form, isService }: { form: UseFormReturn<ComplaintValues>; isService: boolean }) {
  const listId = useId();
  const publicId = useId();
  const [locating, setLocating] = useState(false);
  const [latitude, longitude, area, categoryId] = useWatch({ control: form.control, name: ["latitude", "longitude", "area", "categoryId"] });
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
        {location && !isService && <NearbyReports latitude={location.latitude} longitude={location.longitude} categoryId={categoryId} />}
      </div>
      {!isService && (
        <Controller
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
              <Globe2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="flex-1 space-y-0.5">
                <label htmlFor={publicId} className="block cursor-pointer text-sm font-medium">
                  Show it on the public city map
                </label>
                <p id={`${publicId}-hint`} className="text-sm text-muted-foreground">
                  Neighbours can see the problem and support it. Only the title, the type, the area and a rounded location are shown, never your
                  name or contact details.
                </p>
              </div>
              <Switch
                id={publicId}
                aria-describedby={`${publicId}-hint`}
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-1"
              />
            </div>
          )}
        />
      )}
    </FieldGroup>
  );
}
