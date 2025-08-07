import React from "react";
import Link from "next/link";
import {
  BadgeDollarSign,
  Cpu,
  Download,
  FileDown,
  FileType,
  LayoutGrid,
  MousePointerClick,
  Palette,
  QrCode,
  Shield,
  Upload,
  UserCheck,
  Code,
  Hash,
  FileText,
  Link as LinkIcon,
  Key,
  Calculator,
  FileCode,
  FileSpreadsheet,
  MessageSquare,
  Timer,
  Calendar,
  Table,
  DollarSign,
  Bug,
  Webhook,
  Globe,
  FileText as FileTextIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Separator } from "@/src/app/components/ui/separator";
import { features, benefits, howItWorks } from "@/src/app/data/features";
import { WEBSITE_NAME } from "@/src/app/lib/types";

// Helper function to render the right icon
const IconComponent = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const iconProps = { className: className || "h-6 w-6" };

  switch (name) {
    case "Download":
      return <Download {...iconProps} />;
    case "FileType":
      return <FileType {...iconProps} />;
    case "FileDown":
      return <FileDown {...iconProps} />;
    case "QrCode":
      return <QrCode {...iconProps} />;
    case "Palette":
      return <Palette {...iconProps} />;
    case "LayoutGrid":
      return <LayoutGrid {...iconProps} />;
    case "BadgeDollarSign":
      return <BadgeDollarSign {...iconProps} />;
    case "Shield":
      return <Shield {...iconProps} />;
    case "UserCheck":
      return <UserCheck {...iconProps} />;
    case "MousePointerClick":
      return <MousePointerClick {...iconProps} />;
    case "Upload":
      return <Upload {...iconProps} />;
    case "Cpu":
      return <Cpu {...iconProps} />;
    case "Code":
      return <Code {...iconProps} />;
    case "Hash":
      return <Hash {...iconProps} />;
    case "FileText":
      return <FileText {...iconProps} />;
    case "Link":
      return <LinkIcon {...iconProps} />;
    case "Key":
      return <Key {...iconProps} />;
    case "Calculator":
      return <Calculator {...iconProps} />;
    case "FileCode":
      return <FileCode {...iconProps} />;
    case "FileSpreadsheet":
      return <FileSpreadsheet {...iconProps} />;
    case "MessageSquare":
      return <MessageSquare {...iconProps} />;
    case "Timer":
      return <Timer {...iconProps} />;
    case "Calendar":
      return <Calendar {...iconProps} />;
    case "Table":
      return <Table {...iconProps} />;
    case "DollarSign":
      return <DollarSign {...iconProps} />;
    case "Bug":
      return <Bug {...iconProps} />;
    case "Webhook":
      return <Webhook {...iconProps} />;
    case "Globe":
      return <Globe {...iconProps} />;
    default:
      return <Download {...iconProps} />;
  }
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 animate-fade-in">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl animate-slide-in-left text-white">
              <span>{WEBSITE_NAME}</span>{" "}
              <span className="text-blue-200">Everything You Need</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-blue-100 md:text-xl animate-slide-in-right">
              A collection of free, powerful online tools to help you with your
              daily tasks. Download, convert, compress, generate - all in one
              place.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 animate-scale-in">
              <Link href="/download">
                <Button size="lg" className="rounded-full btn-enhanced hover-lift bg-white text-blue-700 hover:bg-blue-50 border-white">
                  Start Downloading
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="rounded-full btn-enhanced hover-lift text-white border-white hover:bg-white hover:text-blue-700">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-muted/50 animate-fade-in">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Powerful Tools at Your Fingertips
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need, all in one place, completely free
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.id}
                className="card-enhanced overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <IconComponent
                      name={feature.icon}
                      className="h-5 w-5 text-primary"
                    />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center">
                        <div className="mr-2 h-1 w-1 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={feature.url} className="w-full">
                    <Button className="w-full btn-enhanced hover-lift" variant="outline">
                      Try It Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 animate-fade-in">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Why Choose EYN?
            </h2>
            <p className="mt-4 text-muted-foreground">
              We've designed our tools with simplicity and effectiveness in mind
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <IconComponent
                    name={benefit.icon}
                    className="h-6 w-6 text-primary"
                  />
                </div>
                <h3 className="mb-2 text-xl font-medium">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-muted/50 animate-fade-in">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Get your tasks done in just a few simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="relative flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-lg font-bold">{step.step}</span>
                </div>
                <h3 className="mb-2 text-xl font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {step.step < howItWorks.length && (
                  <div className="hidden lg:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5">
                    <div className="h-full w-full bg-border"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Check out our tools and simplify your online tasks today
          </p>
          <div className="mt-8">
            <Link href="/download">
              <Button size="lg" className="rounded-full">
                Start Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
