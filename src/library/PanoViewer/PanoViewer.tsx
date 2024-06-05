
import { useEffect, useRef, forwardRef, useImperativeHandle, ReactNode, ForwardedRef } from "react";
import { PanoViewerBasic } from "./src/pano-viewer-basic";

// props type definition
interface Props {
    children?: ReactNode
}

// ref type definition
export type PanoViewerRef = {
    handleBake: () => void;
};


/*
    Main component class wrapping the three.js experience and exposing internal methods to connect to external UI
    through forwardRef/imperative handles
*/
const PanoViewer = forwardRef<PanoViewerRef, Props>((props: Props, ref: ForwardedRef<PanoViewerRef>) => {


    //ref for Canvas container element
    const containerRef = useRef<HTMLCanvasElement>(null);

    //ref for the Three.js main class 
    const threeRef = useRef<PanoViewerBasic | null>(null);

    //------------
    //METHODS (exposed by imperatvie handle)
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

    //------------
    //INITIALIZE THREE.JS CLASS
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
            {/*props children not used here yet*/}
            {props.children}
        </canvas>
    )
})

export default PanoViewer