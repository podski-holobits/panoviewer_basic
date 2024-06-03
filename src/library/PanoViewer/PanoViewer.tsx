
import { useEffect, useRef, ReactNode } from "react";
import { PanoViewerBasic } from "./pano-viewer-basic";

interface Props {
    children?: ReactNode
}
const PanoViewer = ({ children }: Props) => {

    const containerRef = useRef<HTMLCanvasElement>(null);
    const threeRef = useRef<PanoViewerBasic | null>(null);


    useEffect(() => {

        if (containerRef.current) {
            console.log(containerRef.current)
            const threeInstance = new PanoViewerBasic(containerRef.current);
            console.log(threeInstance.scene)
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