import { Avatar, Flex } from "@chakra-ui/react";
import { FaKey } from "react-icons/fa";
import { SERVER_STATIC } from "../config";
import { User } from "./types/types";

interface Props {
  user: User;
}

const UserCard: React.FC<Props> = ({ user }) => {
  return (
    <Flex
      direction="row"
      p={2}
      className="w-full h-[85%] justify-center"
      overflow="hidden"
      align="center"
    >
      {/* <img
        className="w-[32px] h-[32px] rounded-full"
        src={SERVER_STATIC + '/avatars/' + user.image}
        alt={`${user.name}'s avatar`}
      /> */}
      <Avatar
        filter={!user.online ? "grayscale(1)" : "none"}
        shadow="2xl"
        size="md"
        src={SERVER_STATIC + '/avatars/' + user.image}
      />
      <span className="text-lg font-bold pl-2">{user.name}</span>
      {user.owner && <FaKey className="w-[32px] h-[32px]" />}
    </Flex>
  );
};
export default UserCard;
