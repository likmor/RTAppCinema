import { useEffect, useState } from "react";
import RoomList from "./Components/RoomList";

import Header from "./Components/Header";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import UserNameModal from "./Components/Modals/UserNameModal";
import CreateRoomModal from "./Components/Modals/CreateRoomModal";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import Room from "./Components/Room";
import axios from "axios";
import { SERVER_HUB, SERVER_LOGIN_API, SERVER_STATIC } from "./config";

interface Room {
  roomName: string;
  roomMembers: string[];
}

interface RoomMessages {
  roomName: string;
  messages: MessageProp[];
}

interface MessageProp {
  user: User;
  text: string;
}

interface User {
  name: string;
  image: string;
  owner: boolean;
}

interface RoomUsers {
  roomName: string;
  users: User[];
}
interface PlayerInfo {
  paused: boolean;
  time: number;
  name: string;
}
interface Players {
  roomName: string;
  playerInfo: PlayerInfo;
}

function App() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomExists, setRoomExists] = useState<boolean>(false);
  const [roomMessages, setRoomMessages] = useState<RoomMessages[]>([]);
  const [roomUsers, setRoomUsers] = useState<RoomUsers[]>([]);
  const [players, setPlayers] = useState<Players[]>([]);
  const [title, setTitle] = useState<string>("");

  const {
    isOpen: isUserNameModalOpen,
    onOpen: onUserNameModalOpen,
    onClose: onUserNameModalClose,
  } = useDisclosure();
  const {
    isOpen: isCreateRoomModalOpen,
    onOpen: onCreateRoomModalOpen,
    onClose: onCreateRoomModalClose,
  } = useDisclosure();
  const [hubConnection, setHubConnection] = useState<HubConnection | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem("chakra-ui-color-mode", "dark");
    let name = localStorage.getItem("UserName");
    name ? null : onUserNameModalOpen();
  }, []);

  let path = useLocation().pathname;

  useEffect(() => {
    const startSignalRConnection = async (token: string) => {
      if (
        hubConnection &&
        hubConnection.state === HubConnectionState.Connected
      ) {
        console.log("Already connected to the hub.");
        return;
      }
      const connection = new HubConnectionBuilder()
        .withUrl(SERVER_HUB, {
          accessTokenFactory: () => token ?? "",
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();
      connection.on("ReceiveRoomsList", (message: Room[]) => {
        setRooms(message);
      });

      connection.on("ReceiveError", (message: string) => {
        setRoomExists(true);

        console.log(message);
      });
      connection.on("ReceiveSuccess", () => {
        onCreateRoomModalClose();
      });
      connection.on(
        "ReceiveMessage",
        (roomName: string, user: User, text: string) => {
          addMessageToRoom(roomName, { user, text });
        }
      );
      connection.on("ReceiveFileList", (files: any) => {
        console.log(files);
      });

      connection.on(
        "ReceiveRoomInfo",
        (
          roomName: string,
          users: { name: string; image: string; owner: boolean }[]
        ) => {
          setRoomUsers((prevState) => {
            const roomIndex = prevState.findIndex(
              (room) => room.roomName === roomName
            );
            if (roomIndex > -1) {
              const updatedRooms = [...prevState];
              updatedRooms[roomIndex] = { roomName, users };

              const currentUsers = updatedRooms[roomIndex].users;
              const previousUsers = prevState[roomIndex].users;

              const currentUsersSet = new Set(
                currentUsers.map((user) => user.name)
              );
              const previousUsersSet = new Set(
                previousUsers.map((user) => user.name)
              );

              const newUsers = currentUsers.filter(
                (user) => !previousUsersSet.has(user.name)
              );

              const removedUsers = previousUsers.filter(
                (user) => !currentUsersSet.has(user.name)
              );

              if (newUsers.length > 0) {
                console.log("New users connected:", newUsers);
              }

              if (removedUsers.length > 0) {
                console.log("Users disconnected:", removedUsers);
              }

              return updatedRooms;
            } else {
              return [...prevState, { roomName, users }];
            }
          });
        }
      );
      connection.on(
        "ReceivePlayerInfo",
        (roomName: string, player: PlayerInfo) => {
          setPlayers((prevState) => {
            const roomIndex = prevState.findIndex(
              (room) => room.roomName === roomName
            );

            if (roomIndex > -1) {
              const updatedRooms = [...prevState];
              updatedRooms[roomIndex] = { roomName, playerInfo: player };
              return updatedRooms;
            } else {
              return [...prevState, { roomName, playerInfo: player }];
            }
          });
        }
      );

      try {
        await connection.start();
        console.log("Connected to SignalR Hub");
        setHubConnection(connection);

        await connection.invoke("JoinMainRoom", "user");
        console.log("Joined main room successfully");
      } catch (err) {
        console.error("Error connecting to SignalR Hub:", err);
      }
    };

    const fetchTokenAndConnect = async () => {
      let token = localStorage.getItem("jwt");
      if (!token) {
        const response = await axios.post(SERVER_LOGIN_API);
        token = response.data.token;
        localStorage.setItem("jwt", token ?? "");
      }
      await startSignalRConnection(token ?? "");
    };

    fetchTokenAndConnect();
    return () => {
      if (hubConnection) {
        hubConnection
          .stop()
          .then(() => console.log("Disconnected from SignalR Hub"))
          .catch((err) =>
            console.error("Error disconnecting from SignalR Hub:", err)
          );
      }
    };
  }, [hubConnection]);

  const addMessageToRoom = (roomName: string, newMessage: MessageProp) => {
    setRoomMessages((prevRoomMessages) => {
      const updatedRoomMessages = prevRoomMessages.map((room) => {
        if (room.roomName === roomName) {
          return {
            ...room,
            messages: [...room.messages, newMessage],
          };
        }
        return room;
      });

      const roomExists = prevRoomMessages.some(
        (room) => room.roomName === roomName
      );
      if (!roomExists) {
        return [...prevRoomMessages, { roomName, messages: [newMessage] }];
      }

      return updatedRoomMessages;
    });
  };

  const InvokeMessage = async (message: string, ...arg: string[]) => {
    if (hubConnection?.state === HubConnectionState.Connected) {
      await hubConnection.invoke(message, ...arg);
    } else {
      console.error("Connection is not established.");
    }
  };

  const createRoom = (roomName: string) => {
    hubConnection?.invoke(
      "CreateRoom",
      roomName,
      localStorage.getItem("UserName")
    );
  };
  const goHome = () => {
    setTitle("");
    path === "/home" ? null : navigate("/home");
  };

  const changeTitle = (newTitle: string) => {
    document.title = newTitle;
    setTitle(newTitle);
  };

  return (
    <>
      <Flex direction="column" className="h-screen">
        <UserNameModal
          isOpen={isUserNameModalOpen}
          onClose={onUserNameModalClose}
          invokeMessage={InvokeMessage}
        />
        <CreateRoomModal
          isOpen={isCreateRoomModalOpen}
          onClose={onCreateRoomModalClose}
          createRoom={createRoom}
          roomExists={roomExists}
          setRoomExists={setRoomExists}
        />
        <div className="flex justify-between items-center">
          <Link _hover={{}} className="h-full">
            <Box onClick={() => goHome()}>
              <Header></Header>
            </Box>
          </Link>
          {useLocation().pathname === "/home" ? (
            <Button
              colorScheme="blue"
              className="m-4"
              onClick={onCreateRoomModalOpen}
            >
              Create new room
            </Button>
          ) : null}
          {title != "" && (
            <Box className="m-4">
              <Heading as="h1" size="lg" color="rgb(255,255,255, 0.95)">
                {title}
              </Heading>
            </Box>
          )}

          <Box onClick={onUserNameModalOpen} ml="auto" className="">
            <Link>
              <Heading
                p={5}
                bg="gray.700"
                boxShadow="dark-lg"
                rounded="0px 0px 0px 35px"
                color="rgb(255,255,255, 0.95)"
              >
                {localStorage.getItem("UserName")}
                <Avatar
                  ml="2"
                  shadow="2xl"
                  src={
                    SERVER_STATIC +
                    "/avatars/" +
                    localStorage.getItem("AvatarId")
                  }
                />
              </Heading>
            </Link>
          </Box>
        </div>
        <Flex className="overflow-auto grow">
          <Routes>
            <Route
              path="/home"
              element={<RoomList rooms={rooms} changeTitle={changeTitle} />}
            />
            <Route
              path="/room/:roomName"
              element={
                hubConnection?.state === HubConnectionState.Connected ? (
                  <Room
                    changeTitle={changeTitle}
                    invoke={InvokeMessage}
                    messages={roomMessages}
                    users={roomUsers}
                    players={players}
                  />
                ) : null
              }
            />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </Flex>
      </Flex>
    </>
  );
}

export default App;
