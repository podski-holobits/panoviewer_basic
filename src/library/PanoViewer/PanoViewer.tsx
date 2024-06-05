
import { useEffect, useRef, forwardRef, useImperativeHandle, ReactNode, ForwardedRef } from "react";
import { PanoViewerBasic } from "./src/pano-viewer-basic";

interface Props {
    children?: ReactNode
}

// Define the ref type
export type PanoViewerRef = {
    handleBake: () => void;
};

const PanoViewer = forwardRef<PanoViewerRef, Props>((props: Props, ref: ForwardedRef<PanoViewerRef>) => {

    const containerRef = useRef<HTMLCanvasElement>(null);
    const threeRef = useRef<PanoViewerBasic | null>(null);

    const bake = () => {
        if (threeRef.current) {
            threeRef.current.bake()
        }
        else {
            console.warn("Error: No viewer referenced to run bake function")
        }
    }


    // Pass the ref to the useImperativeHandle hook
    useImperativeHandle(ref, () => ({
        handleBake: () => {
            bake();
        }
    }));

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
            className="w-full h-full relative overflow-hidden cursor-grab"
        >
            {props.children}
        </canvas>
    )
})

export default PanoViewer