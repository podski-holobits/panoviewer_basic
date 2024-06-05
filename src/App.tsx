import { useRef, useState } from "react";

import PanoViewer, { PanoViewerRef } from './library/PanoViewer/PanoViewer'
import { VscDebugConsole } from "react-icons/vsc";
import { AiOutlineInfo } from "react-icons/ai";
import { MdOutlineBakeryDining } from "react-icons/md";
import { FaRegCircle } from "react-icons/fa";
import { FaRegSquare } from "react-icons/fa";
import { MdCleaningServices } from "react-icons/md";

import InfoDialog from "./library/InfoDialog";



/**
 * Main app for the experience
 * TODO: have avbar component defined in separate classes 
 */
function App() {
  const [isBlurShapeChecked, setIsBlurShapeChecked] = useState<boolean>(true);
  const [isBlurTypeChecked, setIsBlurTypeChecked] = useState<boolean>(false);

  //ref to the "forwardly- referenced" PanoViewer Component, giving access to exposed methods
  const viewerRef = useRef<PanoViewerRef>(null);

  const handleBlurShapeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsBlurShapeChecked(event.target.checked);
    var shape = event.target.checked ? "circle" : "rect"
    viewerRef.current ? viewerRef.current.handleBlurShape(shape) : console.warn("no viewer available")
  };


  const handleBlurType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsBlurTypeChecked(event.target.checked);
    var shape = event.target.checked ? "solid" : "blurred"
    viewerRef.current ? viewerRef.current.handleBlurType(shape) : console.warn("no viewer available")
  };
  //handle bake 
  const handleBakeClick = () => {
    viewerRef.current ? viewerRef.current.handleBake() : console.warn("no viewer available")
  }

  const handleClearClick = () => {
    viewerRef.current ? viewerRef.current.handleClear() : console.warn("no viewer available")
  }

  return (
    <div className=' min-h-screen min-w-screen overflow-hidden ' >

      {/* NAVBAR */}
      <header className="fixed  bottom-0 z-50 p-3 w-screen">
        <div className="navbar  bg-base-100 rounded-lg ">

          <div className="navbar-start">
            <span className=" text-md font-bold mx-5">PanoViewer</span>
          </div>

          <div className="navbar-center">
            {/* INFO PANEL */}
            <button className="btn  text-xl mx-1" onClick={() => {
              const modal = document.getElementById('info') as HTMLDialogElement;
              if (modal) modal.showModal();
            }} >
              <AiOutlineInfo />
            </button>

            <input type="checkbox" className="toggle toggle-lg ml-5" checked={isBlurShapeChecked} onChange={handleBlurShapeChange} />

            <span className=" text-md ml-1 mr-1 font-medium "> blur shape:</span>
            {isBlurShapeChecked ? <FaRegCircle className="mr-5" /> : <FaRegSquare className="mr-5" />}

            <input type="checkbox" className="toggle toggle-lg" checked={isBlurTypeChecked} onChange={handleBlurType} />

            <span className=" text-md  ml-1 font-medium mr-1">blur type:</span>
            {isBlurTypeChecked ? "solid" : "glass"}


            {/* BAKE BUTTON*/}
            <button className="btn  text-xl mx-5" onClick={handleBakeClick} disabled={!isBlurTypeChecked}>
              <MdOutlineBakeryDining />BAKE MAP
            </button>


            {/* CLEAR BUTTON*/}
            <button className="btn  text-xl mx-5" onClick={handleClearClick} >
              <MdCleaningServices />
            </button>

          </div>

          <div className="navbar-end">
            {/* GO TO DEBUG PANEL SITE */}
            {/* TODO CHANGE INTO TOGGLE THROUGH PROPS OF THE PanoView */}
            <a className="btn  btn-primary text-xl mx-1" href="/?#debug">
              <VscDebugConsole />
            </a>
          </div>

        </div>
      </header >

      <PanoViewer ref={viewerRef}
        equimapUrl="/R0010121.JPG.jpg"
        equimapLowResUrl='/R0010121_LOW.JPG' />

      {/* INFO PANEL FOR MANUAL AND INFORMATION */}
      <InfoDialog id="info" />
      {/* END INFO PANEL -----------------------*/}


    </div >
  )
}

export default App
