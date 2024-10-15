import { Avatar, Box, Button, ChakraComponent, Flex, ToastId, useToast } from "@chakra-ui/react";
import UserCard from "../UserCard";
import { User } from "../types/types";
import { SERVER_STATIC } from "../../config";
import { useRef } from "react";

export const UserConnectedToast = () => {
    const toast = useToast();
    const toastIdRef = useRef<ToastId>()

    function closeAll() {
      if (toastIdRef.current) {
        toast.closeAll();
      }
    }
    const addToast = (user: User) => {
        toastIdRef.current = toast({
            position: "top-right",
            isClosable: true,
            duration: 6500,
            containerStyle: {
                minWidth: '250px'
            },
            render: () =>
                <Flex onClick={closeAll} color='white' bg='gray.700' borderRadius="md" p="2" shadow="2xl" alignItems="center" direction="column">
                    <span className="text-lg font-bold">User connected:</span>
                    <Flex alignItems="center">
                        <Avatar
                            shadow="2xl"
                            size="md"
                            src={SERVER_STATIC + '/avatars/' + user.image}
                        />
                        <span className="text-lg font-bold pl-2">{user.name}</span>

                    </Flex >
                </Flex>


        })
    }

    return { addToast };
}