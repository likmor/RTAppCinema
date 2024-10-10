import { Avatar } from "@chakra-ui/react";
import { Message } from "./types/types.ts";
import { SERVER_STATIC } from "../config.ts";

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div>
      <Avatar
        shadow="2xl"
        size="xs"
        src={SERVER_STATIC + "/avatars/" + message.user.image}
        ignoreFallback={true}
      />
      <span className="text-sm text-slate-300">{message.user.name}</span>
      <div className="bg-slate-600 rounded-lg shadow-lg p-2">
        {message.text}
      </div>
    </div>
  );
};
export default ChatMessage;
