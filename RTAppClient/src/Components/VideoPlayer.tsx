import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
//@ts-ignore
import SubtitlesOctopus from "../subtitles-octopus.js";
import axios from "axios";
import { SERVER_FONTS_API, SERVER_STATIC } from "../config.js";
import { fileExists } from "../Services/Utility.js";



export const VideoPlayer = (props: any) => {
  const videoRef = React.useRef<any>(null);
  const playerRef = React.useRef<any>(null);
  const { options, onReady } = props;
  const subtitlesRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once

    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");

        onReady && onReady(player);
      }));

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  // Observe changes in the video source
  React.useEffect(() => {
    const player = playerRef.current;

    if (player) {
      const videoElement = player.el().querySelector("video");

      const observer = new MutationObserver(async () => {
        if (subtitlesRef.current) {
          subtitlesRef.current.dispose();
        }
        if (
          await fileExists(
            videoElement.src
              .replace(".mkv", ".ass")
              .replace(".mp4", ".ass")
              .replace(".webm", ".ass")
          )
        ) {
          const res = await axios.get(SERVER_FONTS_API);
          const fonts = await res.data;
          subtitlesRef.current = new SubtitlesOctopus({
            video: videoElement,
            subUrl: videoElement.src.replace(".mkv", ".ass").replace(".mp4", ".ass").replace(".webm", ".ass"),
            fonts: fonts.map((font: string) => "/media/fonts/" + font),
            workerUrl: SERVER_STATIC + "subtitles-octopus-worker.js",
            legacyWorkerUrl:
              SERVER_STATIC + "subtitles-octopus-worker-legacy.js",
            debug: true,
          });
        }
      });

      observer.observe(videoElement, {
        attributes: true,
        attributeFilter: ["src"],
      });

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div data-vjs-player className="h-full">
      <div ref={videoRef} className="h-full" />
    </div>
  );
};

export default VideoPlayer;
