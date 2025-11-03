export type VideoFormat = {
  quality: string;
  format: string;
  url: string;
  filesize?: string;
};

export type AnalysisResult = {
  videoId: string;
  title: string;
  thumbnail: string;
  duration?: number;
  uploader?: string;
  formats: {
    video: VideoFormat[];
    audio: VideoFormat[];
  };
};
