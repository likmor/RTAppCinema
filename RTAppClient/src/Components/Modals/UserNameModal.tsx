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
}

const UserNameModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get(SERVER_AVATARS_API);
      const data = await response.data;
      console.log(data);
    }
    fetch();
  },[])

  const initialRef = React.useRef(null);
  const [username, setUsername] = useState<string>("");
  const [selectedAvatarId, changeAvatarId] = useState<string>("");
  const [avatarIds, setAvatarIds] = useState<string>([]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("UserName", username.trim());
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
              ref={initialRef}
              placeholder="Max lox"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <FormLabel pt="2">Icon</FormLabel>
            <SelectUserIcon
              selectedAvatarId={selectedAvatarId}
              changeAvatarId={changeAvatarId}
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
  changeAvatarId: (id: string) => void;
  avatarIds: string[];
}
const SelectUserIcon: React.FC<SelectUserIconProps> = ({ selectedAvatarId, changeAvatarId, avatarIds }) => {
  return (
    <Wrap justify="center">
      {avatarIds.map((id) =>
        <WrapItem key={id}>
          <Avatar
            outline={selectedAvatarId === id ? "5px solid blue" : undefined}
            shadow="2xl"
            size="xl"
            src={SERVER_STATIC + '/' + id + ".png"}
            onClick={() => changeAvatarId(id)}
          />
        </WrapItem>
      )}

    </Wrap>
  )
}

export default UserNameModal;
