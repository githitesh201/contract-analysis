import { cn } from "@/lib/utils";
import {
  ArrowRight,
  FileSearch,
  Globe,
  Hourglass,
  PiggyBank,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const features = [
  {
    title: "AI-powered Analysis",
    description:
      "Leverage advanced AI to analyze contracts quickly and accurately.",
    icon: FileSearch,
  },
  {
    title: "Risk Identification",
    description: "Spot potential risks and opportunities in your contracts.",
    icon: ShieldCheck,
  },
  {
    title: "Streamlined Negotiation",
    description: "Accelerate the negotiation process with AI-driven insights.",
    icon: Hourglass,
  },
  {
    title: "Cost Reduction",
    description: "Significantly reduce legal costs through automation.",
    icon: PiggyBank,
  },
  {
    title: "Improved Compliance",
    description: "Ensure your contracts meet all regulatory requirements.",
    icon: Scale,
  },
  {
    title: "Faster Turnaround",
    description: "Complete contract reviews in minutes instead of hours.",
    icon: Zap,
  },
];

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-cyan-50 via-white to-slate-50 py-14 md:py-24 lg:py-28">
      <div className="pointer-events-none absolute -top-20 -left-24 size-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-20 -right-24 size-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="container relative mx-auto flex max-w-6xl flex-col items-center px-4 md:px-6">
        <Link
          href={"/dashboard"}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mb-5 hidden rounded-full border-cyan-200 bg-white/70 px-4 py-2 text-slate-700 md:flex"
          )}
        >
          <span className="mr-3 hidden md:block">
            <Sparkles className="size-3.5 text-cyan-600" />
          </span>
          Trusted by fast-moving legal and ops teams
        </Link>
        <div className="mb-12 w-full text-center">
          <h1 className="mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl xl:text-6xl/none">
            Revolutionize Your Contracts
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-slate-600 sm:text-xl">
            Harness the power of AI to analyze, understand, and optimize your
            contracts in no time.
          </p>
          <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button
                className="inline-flex items-center justify-center bg-slate-900 text-lg text-white hover:bg-slate-800"
                size={"lg"}
              >
                Get Started
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button
                className="inline-flex items-center justify-center border-slate-300 text-lg text-slate-700 hover:bg-slate-100"
                size={"lg"}
                variant={"outline"}
              >
                Learn More
                <Globe className="ml-2 size-5" />
              </Button>
            </Link>
          </div>

          <div className="mb-12 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="h-full border-slate-200/80 bg-white/80 transition-transform duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-cyan-100">
                    <feature.icon className="text-cyan-700" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
