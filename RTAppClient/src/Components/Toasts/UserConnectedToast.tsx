import { Avatar, Flex, ToastId, useToast } from "@chakra-ui/react";
import { UserInfoModel } from "../types/types";
import { SERVER_STATIC } from "../../config";
import { useEffect, useRef } from "react";

export const UserConnectedToast = () => {
    const toast = useToast();
    const toastIdRef = useRef<ToastId>()

    const sound = new Audio();
    useEffect(() => {
        sound.src = SERVER_STATIC + "/connected.mp3"
    },[])

    function closeAll() {
        if (toastIdRef.current) {
            toast.closeAll();
        }
    }
    const addToastConnected = (user: UserInfoModel) => {
        sound.play();
        toastIdRef.current = toast({
            position: "top-right",
            isClosable: true,
            duration: 6500,
            containerStyle: {
                minWidth: '300px',
            },
            render: () =>
                <Flex cursor="pointer" onClick={closeAll} color='white' bg='gray.700' borderRadius="md" p="2" shadow="2xl" alignItems="center" direction="column">
                    <span className="text-lg font-bold">User joined:</span>
                    <Flex alignItems="center">
                        <Avatar
                            shadow="2xl"
                            size="md"
                            src={SERVER_STATIC + '/avatars/' + user.avatarId}
                        />
                        <span className="text-lg font-bold pl-2">{user.name}</span>

                    </Flex >
                </Flex>


        })
    }

    return { addToastConnected };
}