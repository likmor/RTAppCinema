import { Button, Flex, Heading, Input } from "@chakra-ui/react";
import ChatMessage from "./ChatMessage";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BsChatDotsFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import UserCard from "./UserCard";
import { User, Message } from "./types/types";



interface Props {
  invoke: (message: string, ...args: string[]) => void;
  messages: Message[];
  chatName: string;
  users: User[];
}


const Chat: React.FC<Props> = ({ invoke, messages, chatName, users }) => {
  const [message, setMessage] = useState<string>("");
  const lastMessageRef = useRef<HTMLSpanElement | null>(null);
  const [activeChat, setActiveChat] = useState<boolean>(true);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSendMessage = (e: FormEvent) => {
    e.preventDefault();
    invoke(
      "SendMessage",
      localStorage.getItem("UserName") ?? "",
      chatName,
      message
    );
    setMessage("");
  };

  const chooseMode = (mode: string) => {
    setActiveChat(mode === "chat");
  };

  return (
    <Flex
      direction="column"
      className="bg-slate-800 shadow-lg rounded-3xl overflow-hidden grow w-[25%]"
    >
      <Flex>
        <Heading className="p-4 text-ellipsis whitespace-nowrap">
          Room: {chatName}
        </Heading>
      </Flex>
      <Flex direction="row" className="pt-0 justify-center gap-4 ">
        <button
          className={`p-1 w-1/3 rounded-xl ${
            activeChat
              ? "bg-gradient-to-b from-[rgb(255,255,0,0)] to-[rgb(255,255,255,0.2)]"
              : ""
          }`}
          onClick={() => chooseMode("chat")}
        >
          <BsChatDotsFill className="h-[32px] w-[32px]  my-0 mx-auto" />
        </button>
        <button
          className={`p-1 w-1/3 rounded-xl ${
            !activeChat
              ? "bg-gradient-to-b from-[rgb(255,255,0,0)] to-[rgb(255,255,255,0.2)]"
              : ""
          }`}
          onClick={() => chooseMode("userList")}
        >
          <FaUser className="h-[32px] w-[32px] my-0 mx-auto" />
        </button>
      </Flex>
      {activeChat ? (
        <Flex direction="column" className="p-4 overflow-hidden grow">
          <Flex
            direction="column"
            className="bg-slate-700 shadow-2xl rounded-xl p-4 overflow-hidden grow"
          >
            <Flex direction="column" className="overflow-auto">
              {messages?.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              <span ref={lastMessageRef} />
            </Flex>
            <form onSubmit={onSendMessage} className="mt-auto">
              <Flex direction="row" gap={4} pt="4">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type something..."
                  className="bg-slate-700 rounded-none"
                />
                <Button type="submit" colorScheme="blue">
                  Submit
                </Button>
              </Flex>
            </form>
          </Flex>
        </Flex>
      ) : (
        <Flex direction="column" className="p-4">
          {users.map((user, index) => (
            <Flex direction="column" key={index} className="mb-4">
              <UserCard user={user} />
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default Chat;
