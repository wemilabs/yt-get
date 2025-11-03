"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResult } from "@/types/video";
import { VideoInfo } from "./video-info";
import { FormatList } from "./format-list";

type VideoResultProps = {
  result: AnalysisResult;
  videoUrl: string;
};

export function VideoResult({ result, videoUrl }: VideoResultProps) {
  return (
    <div className="space-y-4">
      <VideoInfo
        thumbnail={result.thumbnail}
        title={result.title}
        videoId={result.videoId}
      />

      <Tabs defaultValue="video" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="video" className="flex-1">Video</TabsTrigger>
          <TabsTrigger value="audio" className="flex-1">Audio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="video" className="space-y-2">
          <FormatList
            formats={result.formats.video}
            type="video"
            videoUrl={videoUrl}
          />
        </TabsContent>
        
        <TabsContent value="audio" className="space-y-2">
          <FormatList
            formats={result.formats.audio}
            type="audio"
            videoUrl={videoUrl}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
