import { useRef } from "react";

import PanoViewer, { PanoViewerRef } from './library/PanoViewer/PanoViewer'
import { VscDebugConsole } from "react-icons/vsc";
import { AiOutlineInfo } from "react-icons/ai";
import { MdOutlineBakeryDining } from "react-icons/md";

function App() {

  const viewerRef = useRef<PanoViewerRef>(null);

  const handleBakeClick = () => {
    viewerRef.current ? viewerRef.current.handleBake() : console.warn("no viewer available")
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
            {/* BAKE BUTTON*/}
            <button className="btn  text-xl mx-1" onClick={handleBakeClick}>
              <MdOutlineBakeryDining />BAKE MAP
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

      <PanoViewer ref={viewerRef} />


      {/* INFO PANEL FOR MANUAL AND INFORMATION */}
      <dialog id="info" className="modal">
        <div className="modal-box prose">
          <h2 className="prose-h2">Panoview Basic - info</h2>

          <h3 className="prose-h3">Instruction</h3>
          <p className="prose-p">Placeholder for instructions</p>

          <h3 className="prose-h3">About</h3>
          <p className="prose-p">Made by Piotr Podziemski for Lumoview 2024</p>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">CLOSE</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* END INFO PANEL -----------------------*/}


    </div >
  )
}

export default App
