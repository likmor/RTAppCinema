import {
  Avatar,
  AvatarGroup,
  Button,
  Flex,
  Heading,
  Link,
  SlideFade,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RoomInfoModel } from "./types/types.ts";
import { SERVER_STATIC } from "../config.ts";
import { BsDoorOpenFill } from "react-icons/bs";
import { RiCloseLargeFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion components

const RoomList: React.FC<{
  rooms: RoomInfoModel[];
  changeTitle: (title: string) => void;
  leaveLastRoom: () => void;
  invoke: (message: string, ...args: any[]) => void;
}> = ({ rooms, changeTitle, leaveLastRoom, invoke }) => {
  useEffect(() => {
    leaveLastRoom();
    changeTitle("");
  }, []);
  return (
    <>
      <Flex className="gap-10 mx-10 my-5 flex-wrap justify-center">
        {rooms?.map((item) =>
          item.name === "main" ? null : (
            <RoomCard key={item.name} room={item} invoke={invoke}></RoomCard>
          )
        )}
      </Flex>
    </>
  );
};
const MotionFlex = motion(Flex);

const RoomCard: React.FC<{
  room: RoomInfoModel;
  invoke: (message: string, ...args: any[]) => void;
}> = ({ room, invoke }) => {
  const navigate = useNavigate();
  const { isOpen, onToggle } = useDisclosure();

  return (
    <AnimatePresence>
      <SlideFade in={!isOpen} offsetY="20px">
        <MotionFlex
          transition={{ type: "spring", duration: 0.8, bounce: 0.5}}
          layout
          className="w-52 h-52"
          bg={"rgb(0,0,0,0.2)"}
          boxShadow="lg"
          bgImg={SERVER_STATIC + "/avatars/" + room.admin.avatarId}
          bgSize="cover"
          bgRepeat="no-repeat"
          borderRadius="50%"
          bgPos="center center"
          flexDir="column"
          justify="flex-end"
          filter={!room.admin.online ? "grayscale(1)" : "none"}
          pos="relative"
        >
          {room.deletable && (
            <Link
              onClick={() => {
                onToggle();
                setTimeout(() => {
                  invoke("DeleteRoom", room.name);
                }, 150);
              }}
            >
              <RiCloseLargeFill className="w-8 h-8 absolute right-0" />
            </Link>
          )}

          <AvatarGroup mb="auto" max={2} opacity="0.88">
            {room.users?.map((id, index) => (
              <Avatar
                filter={!id.online ? "grayscale(1)" : "none"}
                key={index}
                src={SERVER_STATIC + "/avatars/" + id.avatarId}
              />
            ))}
          </AvatarGroup>

          <Heading
            noOfLines={2}
            opacity="0.88"
            bg="gray.700"
            boxShadow="dark-lg"
            textAlign="center"
            color="rgb(255,255,255, 0.95)"
            borderRadius={6}
          >
            {room.name}
          </Heading>
          <Button
            className="w-full"
            colorScheme="blue"
            onClick={() => navigate(`../room/${room.name}`)}
            leftIcon={<BsDoorOpenFill size={32}></BsDoorOpenFill>}
          >
            <h1>Connect</h1>
          </Button>
        </MotionFlex>
      </SlideFade>
    </AnimatePresence>
  );
};

export default RoomList;
