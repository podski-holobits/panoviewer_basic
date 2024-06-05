import React from 'react'
import { PiMouseRightClick } from "react-icons/pi";
import { PiMouseLeftClick } from "react-icons/pi";
import { PiMouseSimple } from "react-icons/pi";

interface Props {
    id: string
}

/**
 * InfoDialog contains main information about application and tips for usage
 * @param {string} id - id of the dialog element (naive toggling through html id search)
 */
const InfoDialog = ({ id }: Props) => {
    return (
        <dialog id={id} className="modal">
            <div className="modal-box">
                <article className="prose lg:prose-sm">
                    <h1 >Panoview Basic Viewer</h1>

                    <h3>A simple equirectangular panorama viewer:</h3>
                    <ul>
                        <li>navigate by holding left mouse button <PiMouseLeftClick className="inline" /></li>
                        <li>zoom with mouse wheel <PiMouseSimple className="inline" /></li>
                        <li>draw "blur shapes" by holding and dragging right mouse button <PiMouseRightClick className="inline" /></li>
                        <li>play with UI toolbar at the bottom</li>
                    </ul>


                    <h3>Known Issues:</h3>
                    <ul>
                        <li>panorama map baker supports only baking solid "blur shapes"</li>
                    </ul>

                    <h3 >About</h3>
                    <p >Made by Piotr Podziemski for Lumoview 2024</p>

                </article>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn">CLOSE</button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}

export default InfoDialog