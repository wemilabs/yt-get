type VideoInfoProps = {
  thumbnail: string;
  title: string;
  videoId: string;
};

export function VideoInfo({ thumbnail, title, videoId }: VideoInfoProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      {/** biome-ignore lint/performance/noImgElement: false */}
      <img
        src={thumbnail}
        alt={title}
        className="w-32 h-20 object-cover rounded"
      />
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">ID: {videoId}</p>
      </div>
    </div>
  );
}
