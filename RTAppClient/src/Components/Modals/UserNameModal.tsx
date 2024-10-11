import {
  Avatar,
  Button,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { SERVER_AVATARS_API, SERVER_STATIC } from "../../config";
import axios from "axios";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  invokeMessage: (message: string, ...arg: string[]) => void;
}

const UserNameModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  invokeMessage,
}) => {
  const initialRef = React.useRef(null);
  const [username, setUsername] = useState<string>("");
  const [selectedAvatarId, setAvatarId] = useState<string>("");
  const [avatarIds, setAvatarIds] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get(SERVER_AVATARS_API);
      const data = await response.data;
      setAvatarIds(data);
    };
    fetch();
    setUsername(localStorage.getItem("UserName") ?? "")
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      invokeMessage("UpdateProfile", username, selectedAvatarId);
      localStorage.setItem("UserName", username.trim());
      localStorage.setItem("AvatarId", selectedAvatarId)
      onClose();
    } else {
    }
  };

  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>Enter your nickname</ModalHeader>
        <form onSubmit={(e) => handleSubmit(e)}>
          <ModalBody pb={4}>
            <FormLabel>Nickname</FormLabel>
            <Input
              isRequired
              ref={initialRef}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <FormLabel pt="2">Icon</FormLabel>
            <SelectUserIcon
              selectedAvatarId={selectedAvatarId}
              setAvatarId={setAvatarId}
              avatarIds={avatarIds}
            />
          </ModalBody>
          <ModalFooter>
            <Button type="submit" colorScheme="blue" className="mr-3">
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

interface SelectUserIconProps {
  selectedAvatarId: string;
  setAvatarId: (id: string) => void;
  avatarIds: string[];
}
const SelectUserIcon: React.FC<SelectUserIconProps> = ({
  selectedAvatarId,
  setAvatarId,
  avatarIds,
}) => {
  return (
    <Wrap justify="center">
      {avatarIds.map((id) => (
        <WrapItem key={id}>
          <Avatar
            p={selectedAvatarId === id ? "0" : "4"}
            transition="padding .3s ease-in-out"
            shadow="2xl"
            size="2xl"
            src={SERVER_STATIC + "/avatars/" + id}
            onClick={() => setAvatarId(id)}
          />
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default UserNameModal;
