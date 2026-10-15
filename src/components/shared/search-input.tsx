"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string | undefined;
  onSearch: (value: string | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function SearchInput({ value, onSearch, placeholder = "Search", label = "Search", className }: SearchInputProps) {
  const [text, setText] = useState(value ?? "");
  const [syncedValue, setSyncedValue] = useState(value);
  const debounced = useDebounce(text, 400);

  if (value !== syncedValue) {
    setSyncedValue(value);

    if ((value ?? "") !== text.trim()) {
      setText(value ?? "");
    }
  }

  const latest = useRef({ value, onSearch });

  useEffect(() => {
    latest.current = { value, onSearch };
  });

  useEffect(() => {
    const trimmed = debounced.trim();

    if (trimmed !== (latest.current.value ?? "")) {
      latest.current.onSearch(trimmed || undefined);
    }
  }, [debounced]);

  return (
    <InputGroup className={cn("bg-card", className)}>
      <InputGroupAddon>
        <Search aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      {text && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setText("")}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
