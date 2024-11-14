import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Chat from "./Chat";
import VideoPlayer from "./VideoPlayer";
import { Flex } from "@chakra-ui/react";
import FileViewer from "./FileBrowser";
import { SERVER_URL } from "../config";
import { PlayerInfo, Players, RoomInfoModel, RoomMessages } from "./types/types";
import Overlay from "./Overlay";

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
  setRoomName: (roomName: string) => void;
  changeTitle: (newTitle: string) => void;
  invoke: (message: string, ...args: any[]) => void;
  messages: RoomMessages[];
  users: RoomInfoModel[];
  players: Players[];
}

const Room: React.FC<Props> = ({
  setRoomName,
  changeTitle,
  invoke,
  messages,
  users,
  players,
}) => {
  const { roomName } = useParams<{ roomName: string }>();
  const playerRef = React.useRef<any>(null);
  const playerDivRef = React.useRef(null);

  const [isOverlayActive, setIsOverlayActive] = useState<boolean>(false);

  useEffect(() => {
    if (roomName) {
      setRoomName(roomName);
      invoke("JoinRoom", roomName);
    }
  }, []);

  useEffect(() => {
    if (players != undefined && playerRef.current != null) {
      let newInfo: PlayerInfo | undefined = players.find(
        (room) => room.roomName == roomName
      )?.playerInfo;
      if (!newInfo) {
        newInfo = {
          paused: true,
          currentTime: 0,
          fileName: ""
        };
      }

      newInfo?.paused ? playerRef.current.pause() : playerRef.current.play();
      let dif = Math.abs(playerRef.current.currentTime() - newInfo?.currentTime);
      console.log((dif * 1000).toFixed(1) + " ms dif");
      dif > 1 ? playerRef.current.currentTime(newInfo.currentTime) : null;
      playerRef.current.currentSource().src != newInfo.fileName
        ? playerRef.current.src({
          type: "video/mp4",
          src: newInfo.fileName,
        })
        : null;
      changeTitle(newInfo.fileName.split("/").pop() ?? "");
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
      {isOverlayActive && <Overlay path="test.gif" setIsActive={setIsOverlayActive}/>}
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
        users={users.find((room) => room.name === roomName)?.users ?? []}
        admin={users.find((room) => room.name === roomName)?.admin}
      />
    </>
  );
};

export default Room;
