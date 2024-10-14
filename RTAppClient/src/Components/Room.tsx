import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Chat from "./Chat";
import VideoPlayer from "./VideoPlayer";
import { Flex } from "@chakra-ui/react";
import FileViewer from "./FileBrowser";
import { SERVER_URL } from "../config";
import { Players, RoomMessages, RoomUsers } from "./types/types";

const videoJsOptions = {
  //  playbackRates: [0.5, 1, 1.25, 1.5, 2],
  
  controls: true,
  responsive: true,
  fill: true,
  sources: [
    {
      src: "//vjs.zencdn.net/v/oceans.mp4",
      type: "video/mp4",
    },
  ],
};

interface Props {
  changeTitle: (newTitle: string) => void;
  invoke: (message: string, ...args: any[]) => void;
  messages: RoomMessages[];
  users: RoomUsers[];
  players: Players[];
}

const Room: React.FC<Props> = ({
  changeTitle,
  invoke,
  messages,
  users,
  players,
}) => {
  const { roomName } = useParams<{ roomName: string }>();
  const playerRef = React.useRef<any>(null);
  const playerDivRef = React.useRef(null);

  useEffect(() => {
    if (roomName) {
      const userName = localStorage.getItem("UserName") ?? "";
      invoke("JoinRoom", userName, roomName);
    }
  }, []);

  useEffect(() => {
    if (players != undefined && playerRef.current != null) {
      let newInfo: any = players.find(
        (room) => room.roomName == roomName
      )?.playerInfo;
      newInfo?.isPaused ? playerRef.current.pause() : playerRef.current.play();
      let dif = Math.abs(playerRef.current.currentTime() - newInfo.currentTime);
      console.log((dif * 1000).toFixed(1) + " ms dif");
      dif > 1 ? playerRef.current.currentTime(newInfo.currentTime) : null;
      playerRef.current.currentSource().src != newInfo.name
        ? playerRef.current.src({
            type: "video/mp4",
            src: newInfo.name,
          })
        : null;
      changeTitle(newInfo.name.split("/").pop() ?? "");
    }
  }, [players]);

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;

    player.on("play", () => {
      sendPlayerInfo(player);
    });

    player.on("pause", () => {
      sendPlayerInfo(player);
    });
  };

  const sendPlayerInfo = async (player: any) => {
    await invoke(
      "SendPlayerInfo",
      roomName ?? "",
      player.paused(),
      player.currentTime(),
      player.currentSource().src
    );
  };
  const changeSource = async (path: string) => {
    playerRef.current.src({
      type: "video/mp4",
      src: SERVER_URL + path,
    });
    await invoke("SendPlayerInfo", roomName ?? "", true, 0, SERVER_URL + path);
    changeTitle(path.split("/").pop() ?? "");
  };
  const sendInfo = async (paused: boolean, time: number, src: string) => {
    await invoke("SendPlayerInfo", roomName ?? "", paused, time, src);
  };

  return (
    <>
      <Flex direction="column" className="w-[75%] h-full ">
        <div className="h-[65%]" ref={playerDivRef}>
          <VideoPlayer
            options={videoJsOptions}
            onReady={handlePlayerReady}
            sendPlayerInfo={sendInfo}
          />
        </div>
        <div className="grow">
          <FileViewer changeSource={changeSource} />
        </div>
      </Flex>
      <Chat
        invoke={invoke}
        chatName={roomName ?? ""}
        messages={
          messages.find((room) => room.roomName === roomName)?.messages ?? []
        }
        users={users.find((room) => room.roomName === roomName)?.users ?? []}
      />
    </>
  );
};

export default Room;
