"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ComplaintValues } from "@/lib/validations";
import type { CategoryType } from "@/types";

export const WIZARD_STEPS = ["category", "details", "location", "photos", "review"] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export const EMPTY_DRAFT: ComplaintValues = {
  categoryId: "",
  title: "",
  description: "",
  priority: "MEDIUM",
  area: "",
  address: "",
  isPublic: true,
};

interface DraftState {
  step: WizardStep;
  kind: CategoryType;
  values: ComplaintValues;
  photos: File[];
  setStep: (step: WizardStep) => void;
  setKind: (kind: CategoryType) => void;
  saveValues: (values: Partial<ComplaintValues>) => void;
  setPhotos: (photos: File[]) => void;
  reset: () => void;
}

export const useComplaintDraft = create<DraftState>()(
  persist(
    (set) => ({
      step: "category",
      kind: "COMPLAINT",
      values: EMPTY_DRAFT,
      photos: [],
      setStep: (step) => set({ step }),
      setKind: (kind) => set({ kind }),
      saveValues: (values) => set((state) => ({ values: { ...state.values, ...values } })),
      setPhotos: (photos) => set({ photos }),
      reset: () => set({ step: "category", kind: "COMPLAINT", values: EMPTY_DRAFT, photos: [] }),
    }),
    {
      name: "citycare-report-draft",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ step: state.step, kind: state.kind, values: state.values }),
      skipHydration: true,
    }
  )
);
