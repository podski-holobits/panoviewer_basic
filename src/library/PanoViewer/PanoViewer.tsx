
import { useEffect, useRef, forwardRef, useImperativeHandle, ReactNode, ForwardedRef } from "react";
import { PanoViewerBasic } from "./src/pano-viewer-basic";

// props type definition
interface Props {
    children?: ReactNode
    equimapUrl: string
    equimapLowResUrl?: string
}

// ref type definition
export type PanoViewerRef = {
    handleBake: () => void;
    handleClear: () => void;
    handleBlurType: (type: string) => void;
    handleBlurShape: (shape: string) => void;
};

/**
 *  Main component class wrapping the three.js experience and exposing internal methods to connect to external UI through forwardRef/imperative handles
 * @param {Object} props - Component props
 * @param {string} props.children - (unused) - pass children to be placed inside the canvas
 * @param {ForwardedRef<PanoViewerRef>} ref - forwar ref for to connect to external UI through imperative handles
 */
const PanoViewer = forwardRef<PanoViewerRef, Props>((props: Props, ref: ForwardedRef<PanoViewerRef>) => {


    //ref for Canvas container element
    const containerRef = useRef<HTMLCanvasElement>(null);

    //ref for the Three.js main class 
    const threeRef = useRef<PanoViewerBasic | null>(null);

    //------------
    //METHODS (exposed by imperatvie handle, could be also handled by props)
    const bake = () => {
        if (threeRef.current) {
            threeRef.current.bake()
        }
        else {
            console.warn("Error: No viewer referenced to run bake function")
        }
    }
    const setBlurType = (type: string) => {
        if (threeRef.current) {
            threeRef.current.setBlurType(type)
        }
        else {
            console.warn("Error: No viewer referenced to run bake function")
        }
    }
    const setBlurShape = (shape: string) => {
        if (threeRef.current) {
            threeRef.current.setBlurShape(shape)
        }
        else {
            console.warn("Error: No viewer referenced to run bake function")
        }
    }
    const clear = () => {
        if (threeRef.current) {
            threeRef.current.clear()
        }
        else {
            console.warn("Error: No viewer referenced to run bake function")
        }
    }




    // Pass the ref to the useImperativeHandle hook
    useImperativeHandle(ref, () => ({
        handleBake: () => {
            bake();
        },
        handleBlurType: (type: string) => {
            setBlurType(type);
        },
        handleBlurShape: (shape: string) => {
            setBlurShape(shape);
        },
        handleClear: () => {
            clear();
        },
    }));

    //INITIALIZE THREE.JS CLASS
    useEffect(() => {

        if (containerRef.current) {
            const threeInstance = new PanoViewerBasic(
                containerRef.current,
                {
                    equimapUrl: props.equimapUrl,
                    equimapLowResUrl: props.equimapLowResUrl
                });
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