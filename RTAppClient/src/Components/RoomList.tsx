import {
  Avatar,
  AvatarGroup,
  Button,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RoomInfoModel, UserInfoModel } from "./types/types.ts";
import { SERVER_STATIC } from "../config.ts";
import { BsDoorOpenFill } from "react-icons/bs";
const RoomList: React.FC<{
  rooms: RoomInfoModel[];
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
          item.name === "main" ? null : (
            <RoomCard
              roomName={item.name}
              UserPreviews={item.users}
              key={index}
              admin={item.admin}
            ></RoomCard>
          )
        )}
      </Flex>
    </>
  );
};

const RoomCard: React.FC<{ roomName: string; UserPreviews: UserInfoModel[]; admin: UserInfoModel }> = ({
  roomName,
  UserPreviews,
  admin
}) => {
  const navigate = useNavigate();
  return (
    <Flex
      className="w-52 h-52"
      bg={"rgb(0,0,0,0.2)"}
      border={"1px solid black"}
      boxShadow="lg"
      bgImg={SERVER_STATIC + "/avatars/" + admin.avatarId}
      bgSize="cover"
      bgRepeat="no-repeat"
      borderRadius="50%"
      bgPos="center center"
      flexDir="column"
      justify="flex-end"
      filter={!admin.online ? "grayscale(1)" : "none"}
    >
      <AvatarGroup mb="auto" max={2} alignSelf="end" opacity="0.88">
        {UserPreviews?.map((id, index) => (
          <Avatar filter={!id.online ? "grayscale(1)" : "none"} key={index} src={SERVER_STATIC + "/avatars/" + id.avatarId} />
        ))}
      </AvatarGroup>

      <Heading noOfLines={2} opacity="0.88" bg="gray.700" boxShadow="dark-lg" textAlign="center" color="rgb(255,255,255, 0.95)" borderRadius={6}>
        {roomName}

      </Heading>
      <Button
        className="w-full"
        colorScheme="blue"
        onClick={() => navigate(`../room/${roomName}`)}
        leftIcon={<BsDoorOpenFill size={32}></BsDoorOpenFill>}
      >
        <h1>Connect</h1>

      </Button>

    </Flex>
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
