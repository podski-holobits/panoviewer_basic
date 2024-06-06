import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Debug from './debug';




/**
 *  Navigation class - manages the camera and viewport - related navigation
 *  orbit controls could be redefined for better zoom - very naive implementation now
 */
export default class Navigation {
    public controls: OrbitControls
    public navcam: THREE.PerspectiveCamera

    private readonly scene: THREE.Scene;
    private canvas: HTMLElement
    private debug: Debug | undefined


    constructor(canvas: HTMLElement, scene: THREE.Scene, debug?: Debug) {
        this.scene = scene
        this.canvas = canvas
        this.debug = debug

        this.navcam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.controls = new OrbitControls(this.navcam, this.canvas)

        this.init()
    }

    init = () => {
        this.navcam.position.set(0, 0, 0.01)
        this.scene.add(this.navcam)

        this.controls.enableDamping = true
        this.controls.enableZoom = false
        this.controls.enablePan = false
        this.controls.rotateSpeed = -0.4
        this.controls.dampingFactor = 0.05

        window.addEventListener('wheel', this.zoom)
        window.addEventListener('mousedown', this.handleMouseDown)
        window.addEventListener('mouseup', this.handleMouseUp)

    }


    //Turn off orbitcontrols zoom and zoom via FOV
    zoom = (event: WheelEvent) => {
        const zoomChange = Math.min(Math.max(this.navcam.fov + event.deltaY * 0.04, 5), 145)
        this.navcam.fov = zoomChange
        this.navcam.updateProjectionMatrix();
    }

    handleMouseDown = (event: MouseEvent) => {
        if (event.button == 0) { // wheel click or right mouse
            this.canvas.classList.add("grabbed")
        }
        else {
            this.canvas.classList.add("painting")
            //in theory this should be handled by BlurspotManager
        }

    }
    handleMouseUp = (event: MouseEvent) => {
        if (event.button == 0) { // wheel click or right mouse
            this.canvas.classList.remove("grabbed")
        }
        else {
            this.canvas.classList.remove("painting")
            //in theory this should be handled by BlurspotManager
        }
    }

    resize = (width: number, height: number) => {
        this.navcam.aspect = width / height
        this.navcam?.updateProjectionMatrix()
    }

    update = () => {
        this.controls?.update()
    }

    dispose = () => {
        this.controls?.dispose()
        window.removeEventListener('wheel', this.zoom);

    }
}

