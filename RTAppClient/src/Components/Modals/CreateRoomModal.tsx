import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  FormLabel,
  Input,
  ModalFooter,
  Button,
  FormErrorMessage,
  FormControl,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  createRoom: (roomName: string) => void;
  roomExists: boolean;
  setRoomExists: (arg: boolean) => void;
}

const CreateRoomModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  createRoom,
  roomExists,
  setRoomExists,
}) => {
  const initialRef = React.useRef(null);
  const [roomName, setRoomName] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  useEffect(() => {
    roomExists ? setError(true) : setError(false);
  }, [roomExists]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomName.trim()) {
      createRoom(roomName.trim());
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
        <ModalHeader>Create new room</ModalHeader>
        <form onSubmit={(e) => handleSubmit(e)}>
          <ModalBody pb={6}>
            <FormControl isInvalid={error}>
              <FormLabel>Room name</FormLabel>
              <Input
                maxLength={50}
                ref={initialRef}
                placeholder="Max lox"
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value);
                  setRoomExists(false);
                }}
              />
              <FormErrorMessage>Room already exists!</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" colorScheme="blue" mr={3}>
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
export default CreateRoomModal;
