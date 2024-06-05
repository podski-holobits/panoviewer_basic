import React from 'react'


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
    )
}

export default InfoDialog