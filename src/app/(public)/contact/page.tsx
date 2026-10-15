import { Clock, MessageCircleQuestion, PhoneCall, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/public/contact-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a message to the CityCare team about a report, a payment, your account or an idea.",
  alternates: { canonical: "/contact" },
};

const notes = [
  {
    icon: PhoneCall,
    title: "Emergencies",
    text: "For fire, an accident or a crime call 999. CityCare is for problems that can wait a few hours.",
  },
  {
    icon: Clock,
    title: "When we reply",
    text: "Messages are read by the city admins and answered by email, usually within one working day.",
  },
  {
    icon: Search,
    title: "Already reported?",
    text: "Use your tracking code to see the latest status before you write.",
    link: { href: "/track", label: "Track a report" },
  },
  {
    icon: MessageCircleQuestion,
    title: "Common questions",
    text: "Payments, refunds, photos and reopening are explained in the FAQ.",
    link: { href: "/faq", label: "Read the FAQ" },
  },
];

export default function ContactPage() {
  return (
    <div className="container-page space-y-10 py-12 sm:py-16">
      <PageHeader
        eyebrow="Contact"
        title="Talk to the city team"
        description="Questions, problems with a report or ideas for the platform. Every message is read by a person."
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 sm:p-8">
          <ContactForm />
        </Card>
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.title} className="flex-row gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <note.icon className="size-5" aria-hidden />
              </span>
              <div className="space-y-1">
                <h2 className="font-semibold">{note.title}</h2>
                <p className="text-sm text-muted-foreground">{note.text}</p>
                {note.link && (
                  <Link href={note.link.href} className="text-sm font-medium text-primary hover:underline">
                    {note.link.label}
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
