import { Mail, Phone } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Person } from "@/types";

export function PersonCard({ title, person, note }: { title: string; person: Person | null; note?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {person ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserAvatar name={person.name} size={40} />
              <p className="font-medium">{person.name}</p>
            </div>
            <ul className="space-y-1.5 text-sm">
              {person.phone && (
                <li>
                  <a href={`tel:${person.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Phone className="size-4" aria-hidden />
                    {person.phone}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" aria-hidden />
                <span className="break-all">{person.email}</span>
              </li>
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{note ?? "Nobody yet."}</p>
        )}
      </CardContent>
    </Card>
  );
}
