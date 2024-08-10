import {
  Button,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
          <ModalBody pb={6}>
            <FormLabel>Nickname</FormLabel>
            <Input
              ref={initialRef}
              placeholder="Max lox"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button type="submit" colorScheme="blue" mr={3}>
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UserNameModal;
