
import { useEffect, useRef, ReactNode } from "react";
import { PanoViewerBasic } from "./src/pano-viewer-basic";

interface Props {
    children?: ReactNode
}
const PanoViewer = ({ children }: Props) => {

    const containerRef = useRef<HTMLCanvasElement>(null);
    const threeRef = useRef<PanoViewerBasic | null>(null);


    useEffect(() => {

        //TODO need to refactor that
        if (containerRef.current) {
            const threeInstance = new PanoViewerBasic(containerRef.current);
            threeRef.current = threeInstance;
            return () => threeInstance.dispose();
        }
    }, [])

    return (
        <canvas
            ref={containerRef}
            onContextMenu={(event) => event.preventDefault()}
            style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}
        >
            {children}
        </canvas>
    )
}

export default PanoViewer