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
import React, { useState } from "react";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserNameModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const initialRef = React.useRef(null);
  const [username, setUsername] = useState<string>("");

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
            <SelectUserIcon />
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

const SelectUserIcon = () => {
  const [selectedIndex, selectIndex] = useState<number>(1);
  const map = [
    {
      Id: 1,
      src: "/image.png"
    },

    {
      Id: 2,
      src: "/image.png"
    },
    {
      Id: 3,
      src: "/image.png"
    },
    {
      Id: 4,
      src: "/image.png"
    },
    {
      Id: 5,
      src: "/image.png"
    }
  ]
  return (
    <Wrap justify="center">
      {map.map((icon) =>
        <WrapItem>
          {selectedIndex == icon.Id ?
            <Avatar outline="5px solid blue" shadow="2xl" size="xl" src={icon.src} onClick={() => selectIndex(icon.Id)}></Avatar> :
            <Avatar shadow="2xl" size="xl" src={icon.src} onClick={() => selectIndex(icon.Id)}></Avatar>
          }
        </WrapItem>
      )}

    </Wrap>
  )
}

export default UserNameModal;
