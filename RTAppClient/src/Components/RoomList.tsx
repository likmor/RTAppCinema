import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Room } from "./types/types.ts";
import { SERVER_STATIC } from "../config.ts";
const RoomList: React.FC<{
  rooms: Room[];
  changeTitle: (title: string) => void;
}> = ({ rooms, changeTitle }) => {
  console.log(rooms);
  useEffect(() => {
    changeTitle("");
  }, []);
  return (
    <>
      <Flex className="gap-10 mx-10 my-5 flex-wrap justify-center">
        {rooms?.map((item, index) =>
          item.roomName === "main" ? null : (
            <RoomCard
              roomName={item.roomName}
              roomUserAvatarIds={item.roomMembers}
              key={index}
            ></RoomCard>
          )
        )}
      </Flex>
    </>
  );
};

const RoomCard: React.FC<{ roomName: string; roomUserAvatarIds: string[] }> = ({
  roomName, roomUserAvatarIds
}) => {
  const navigate = useNavigate();
  return (
    <Card
      className="w-52 h-52"
      bg={"rgb(0,0,0,0.2)"}
      border={"1px solid black"}
      boxShadow="lg"
    >
      <CardHeader>
        <Heading
          className="text-white"
          fontSize={"xl"}
        >
          {roomName}
        </Heading>
        <AvatarGroup mt="4" size="md" max={3}>
          {roomUserAvatarIds?.map((id, index) =>
            <Avatar key={index} src={SERVER_STATIC + "/avatars/" + id} />
          )}
        </AvatarGroup>
      </CardHeader>
      <CardBody className="flex justify-center items-end">
        <Button
          className="w-full"
          colorScheme="blue"
          onClick={() => navigate(`../room/${roomName}`)}
        >
          Connect
        </Button>
      </CardBody>
    </Card>
  );
};

// const Connect = () => {
//   hubConnection.start()
//         .then(() => {
//           console.log("Connected to SignalR Hub");
//           hubConnection.invoke("JoinRoom", "user", "main").catch(err => console.error(err.toString()));
//           // const roomId = "12345";
//           // <Navigate to={`room/${roomId}`}/>

//         })
//         .catch(err => console.log("Error connecting to SignalR Hub:", err));

//     hubConnection.on("ReceiveMessage", (user, message) => {
//         console.log(user, message)
//     });

// }
export default RoomList;
