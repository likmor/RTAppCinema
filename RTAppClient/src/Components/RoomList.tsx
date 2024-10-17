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
import { Room, UserPreview } from "./types/types.ts";
import { SERVER_STATIC } from "../config.ts";
import { CgLayoutGrid } from "react-icons/cg";
const RoomList: React.FC<{
  rooms: Room[];
  changeTitle: (title: string) => void;
  leaveLastRoom: () => void;
}> = ({ rooms, changeTitle, leaveLastRoom }) => {
  useEffect(() => {
    leaveLastRoom();
    changeTitle("");
  }, []);
  return (
    <>
      <Flex className="gap-10 mx-10 my-5 flex-wrap justify-center">
        {rooms?.map((item, index) =>
          item.roomName === "main" ? null : (
            <RoomCard
              roomName={item.roomName}
              UserPreviews={item.users}
              key={index}
            ></RoomCard>
          )
        )}
      </Flex>
    </>
  );
};

const RoomCard: React.FC<{ roomName: string; UserPreviews: UserPreview[] }> = ({
  roomName,
  UserPreviews,
}) => {
  console.log(UserPreviews)
  const navigate = useNavigate();
  return (
    <Card
      className="w-52 h-52"
      bg={"rgb(0,0,0,0.2)"}
      border={"1px solid black"}
      boxShadow="lg"
    >
      <CardHeader>
        <Heading className="text-white" fontSize={"xl"}>
          {roomName}
        </Heading>
        <AvatarGroup mt="4" size="md" max={3}>
          {UserPreviews?.map((id, index) => (
            <Avatar filter={!id.online ? "grayscale(1)" : "none"} key={index} src={SERVER_STATIC + "/avatars/" + id.avatar} />
          ))}
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
