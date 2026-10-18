import { ArrowRight, Clock, MessageCircleQuestion, PhoneCall, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicHero } from "@/components/layout/public-hero";
import { ContactForm } from "@/components/public/contact-form";
import { Card } from "@/components/ui/card";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Send a message to the CityCare team about a report, a payment, your account or an idea.",
  path: "/contact",
});

const notes = [
  {
    icon: PhoneCall,
    title: "Emergencies",
    text: "For fire, an accident or a crime call 999. CityCare is for problems that can wait a few hours.",
    tone: "bg-destructive/10 text-destructive",
  },
  {
    icon: Clock,
    title: "When we reply",
    text: "Messages are read by the city admins and answered by email, usually within one working day.",
    tone: "bg-accent text-accent-foreground",
  },
  {
    icon: Search,
    title: "Already reported?",
    text: "Use your tracking code to see the latest status before you write.",
    link: { href: "/track", label: "Track a report" },
    tone: "bg-info/12 text-info",
  },
  {
    icon: MessageCircleQuestion,
    title: "Common questions",
    text: "Payments, refunds, photos and reopening are explained in the FAQ.",
    link: { href: "/faq", label: "Read the FAQ" },
    tone: "bg-brass/15 text-brass-strong",
  },
];

export default function ContactPage() {
  return (
    <>
      <PublicHero
        page="Contact"
        title="Talk to the city team"
        description="Questions, problems with a report or ideas for the platform. Every message is read by a person."
        className="pb-16 sm:pb-24 lg:pb-28"
      />
      <div className="container-page relative z-10 -mt-12 grid gap-8 pb-16 sm:-mt-16 sm:pb-20 lg:grid-cols-[1fr_360px]">
        <Card className="animate-fade-up p-6 shadow-raised sm:p-8">
          <div className="mb-6 space-y-1 border-b pb-5">
            <h2 className="font-display text-2xl font-semibold">Send a message</h2>
            <p className="text-sm text-muted-foreground">Tell us what it is about and we reply to your email.</p>
          </div>
          <ContactForm />
        </Card>
        <div className="stagger space-y-4 lg:pt-16">
          {notes.map((note) => (
            <Card key={note.title} className="flex-row gap-4 p-5">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${note.tone}`}>
                <note.icon className="size-5" aria-hidden />
              </span>
              <div className="space-y-1">
                <h2 className="font-semibold">{note.title}</h2>
                <p className="text-sm text-muted-foreground">{note.text}</p>
                {note.link && (
                  <Link href={note.link.href} className="group inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {note.link.label}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
