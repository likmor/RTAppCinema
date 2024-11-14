import { Box } from "@chakra-ui/react";
import { SERVER_STATIC } from "../config";
import { useEffect, useState } from "react";

interface Props {
    path: string;
    setIsActive: (isActive: boolean) => void;
}

const Overlay: React.FC<Props> = ({ path, setIsActive }) => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsActive(true);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [setIsActive]);

    return (
        <>
            {isLoaded && (
                <Box
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90"
                    pointerEvents="none"
                    zIndex={1000}
                >
                    <Box
                        as="img"
                        onLoad={() => setIsLoaded(true)}
                        src={`${SERVER_STATIC}/overlay/${path}`}
                        className="w-full h-full"
                        alt="Overlay Image"
                    />
                </Box>
            )}
        </>
    );
};

export default Overlay;
