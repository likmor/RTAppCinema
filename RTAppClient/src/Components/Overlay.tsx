import { Box } from "@chakra-ui/react";
import { SERVER_STATIC } from "../config";
import { useEffect, useState } from "react";
import { OverlayInfo } from "./types/types";

interface Props {
    info: OverlayInfo;
    setInfo: (info: OverlayInfo) => void;
}

const Overlay: React.FC<Props> = ({ info, setInfo }) => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setInfo({ ...info, active: false });
        }, 3000);

        return () => clearTimeout(timeout);
    }, [info]);

    return (
        <>
            <Box
                className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 pointer-events-none transition-opacity
                         ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                zIndex={1000}
            >
                <Box
                    as="img"
                    onLoad={() => setIsLoaded(true)}
                    src={`${SERVER_STATIC}/overlay/${info.path}`}
                    className="w-full h-full"
                />
            </Box>
        </>
    );
};

export default Overlay;
