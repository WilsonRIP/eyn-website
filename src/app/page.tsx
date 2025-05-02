import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="absolute top-6 right-6"></div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            EYN = Everything You Need
          </CardTitle>
          <CardDescription className="text-center pt-2">
            Your one-stop destination.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Explore the features and tools available.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button>Learn More</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
