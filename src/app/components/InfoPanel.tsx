import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Info } from "lucide-react";

export function InfoPanel() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span>About Metadata</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Image Metadata (EXIF)</h3>
            <p className="text-sm text-muted-foreground">
              EXIF (Exchangeable image file format) data is a standard for storing interchange information in digital photography image files. It includes camera settings, lens info, location, and more.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Audio Metadata (ID3)</h3>
            <p className="text-sm text-muted-foreground">
              ID3 is a metadata container most often used with the MP3 audio file format. It allows information such as the title, artist, album, track number, and other data to be stored in the file itself.
            </p>
          </div>
      </CardContent>
    </Card>
  );
}