import { LifeBuoy, Mail, Phone, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicHero } from "@/components/layout/public-hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MAX_IMAGE_MB, MAX_IMAGES, MAX_IMAGES_PER_UPLOAD, MAX_REOPENS, REOPEN_WINDOW_DAYS } from "@/lib/complaint-meta";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description: "How reporting, tracking, payments, refunds, photos and reopening work on CityCare.",
  path: "/faq",
});

const groups = [
  {
    id: "reporting",
    title: "Reporting",
    items: [
      {
        question: "What can I report on CityCare?",
        answer:
          "Problems on public property such as potholes, broken footpaths, water leaks, blocked drains, missed garbage pickups, illegal dumping, dark street lights and fallen trees. You can also request paid home services like bulk waste pickup or septic tank cleaning.",
      },
      {
        question: "Do I need an account?",
        answer:
          "You need a free account to send a report, so the city can update you and you can rate the work. Tracking a report with its code works without signing in.",
      },
      {
        question: "How many photos can I add?",
        answer: `Up to ${MAX_IMAGES} photos per report, ${MAX_IMAGES_PER_UPLOAD} at a time. JPG, PNG and WEBP files up to ${MAX_IMAGE_MB} MB each are accepted. Field staff add their own photos when the job is done.`,
      },
      {
        question: "Can I change or cancel a report?",
        answer:
          "Yes, while it is waiting for payment or waiting to be assigned. Once a staff member has it, ask through the contact page instead.",
      },
    ],
  },
  {
    id: "after-sending",
    title: "After you send it",
    items: [
      {
        question: "What happens after I submit?",
        answer:
          "You get a tracking code like CC-261017-AB12CD at once. The report goes to the department in charge, an admin assigns a staff member with free capacity and you can see every status change in the timeline.",
      },
      {
        question: "How long does it take?",
        answer:
          "Every type of report has a target time, for example one day for a water leak and three days for a pothole. The deadline is shown on your report, and reports that pass it are flagged as overdue for the city team.",
      },
      {
        question: "The problem came back. What can I do?",
        answer: `Reopen the report within ${REOPEN_WINDOW_DAYS} days after it is marked resolved. A report can be reopened ${MAX_REOPENS} times. After that, please send a new one.`,
      },
      {
        question: "Who can see my report?",
        answer:
          "You, the staff member working on it and the city admins. The public tracking page and the open numbers only show the title, area, type and status, never your name, email or phone.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments and refunds",
    items: [
      {
        question: "Which services cost money?",
        answer:
          "Complaints about public property are always free. Home services have a fixed fee that is shown on the services page and again before you pay.",
      },
      {
        question: "How do I pay?",
        answer:
          "Payments go through Stripe Checkout, so your card details never reach CityCare. This demo runs in Stripe test mode: use the card 4242 4242 4242 4242 with any future date and any CVC.",
      },
      {
        question: "What if my paid request is rejected or cancelled?",
        answer:
          "The fee is refunded to your card automatically. You can see the refund on the payments page of your dashboard.",
      },
    ],
  },
  {
    id: "account",
    title: "Your account",
    items: [
      {
        question: "Can I sign in with Google?",
        answer: "Yes. Use the Continue with Google button on the sign in page. A new account is created the first time.",
      },
      {
        question: "I forgot my password.",
        answer:
          "Use Forgot password on the sign in page. We send a link that works for 30 minutes and only once. Changing the password signs you out on your other devices.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PublicHero
        page="Help"
        title="Frequently asked questions"
        description="Short answers about reporting, tracking, payments and your account."
      />
      <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_300px] lg:gap-14">
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.id} id={group.id} className="reveal scroll-mt-24 space-y-4" aria-labelledby={`faq-${group.id}`}>
              <h2 id={`faq-${group.id}`} className="font-display text-2xl font-semibold">
                {group.title}
              </h2>
              <Accordion type="single" collapsible className="rounded-xl border bg-card px-5 shadow-card">
                {group.items.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger className="py-4 text-left text-base">{item.question}</AccordionTrigger>
                    <AccordionContent className="leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Topics" className="hidden rounded-xl border bg-card p-4 shadow-card lg:block">
            <p className="px-2 pb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">On this page</p>
            <ul className="space-y-0.5">
              {groups.map((group) => (
                <li key={group.id}>
                  <a href={`#${group.id}`} className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted">
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Card className="gap-4 p-6">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <LifeBuoy className="size-5" aria-hidden />
            </span>
            <div className="space-y-1">
              <h2 className="font-semibold">Still need help?</h2>
              <p className="text-sm text-muted-foreground">Send the city team a message. You get a reply by email.</p>
            </div>
            <Button asChild>
              <Link href="/contact">
                <Mail data-icon="inline-start" />
                Contact us
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/track">
                <Search data-icon="inline-start" />
                Track a report
              </Link>
            </Button>
            <a href="tel:999" className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm">
              <Phone className="size-4 text-destructive" aria-hidden />
              Emergency? Call <span className="font-semibold">999</span>
            </a>
          </Card>
        </aside>
      </div>
    </>
  );
}
