import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RoomList: React.FC<{
  rooms: string[];
  changeTitle: (title: string) => void;
}> = ({ rooms, changeTitle }) => {
  useEffect(() => {
    changeTitle("");
  }, []);
  return (
    <>
      <Flex className="gap-10 mx-10 my-5 flex-wrap justify-center">
        {rooms?.map((item, index) =>
          item === "main" ? null : (
            <RoomCard roomName={item} key={index}></RoomCard>
          )
        )}
      </Flex>
    </>
  );
};

const RoomCard: React.FC<{ roomName: string }> = ({ roomName }) => {
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
          h="90px"
          maxH="90px"
          overflow="auto"
        >
          {roomName}
        </Heading>
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
