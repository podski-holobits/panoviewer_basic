import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Debug from './debug';


//Navigation class - manages the camera and viewport - related navigation
//TODO orbit controls need to be redefined for better zoom - very naive implementation now
export default class Navigation {
    controls: OrbitControls | undefined
    private scene: THREE.Scene
    private canvas: HTMLElement
    private debug: Debug | undefined

    navcam: THREE.PerspectiveCamera

    constructor(canvas: HTMLElement, scene: THREE.Scene, debug?: Debug) {
        this.scene = scene
        this.canvas = canvas
        this.debug = debug

        this.navcam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

        this.init()
    }

    init = () => {
        this.navcam.position.set(0, 0, 0.1)
        this.scene.add(this.navcam)

        this.controls = new OrbitControls(this.navcam, this.canvas)
        this.controls.enableDamping = true
        this.controls.enableZoom = false
        this.controls.enablePan = false
        this.controls.rotateSpeed = -0.4
        this.controls.dampingFactor = 0.05

        window.addEventListener('wheel', this.zoom)

    }



    zoom = (event: WheelEvent) => {
        const zoomChange = Math.min(Math.max(this.navcam.fov + event.deltaY * 0.04, 5), 145)
        this.navcam.fov = zoomChange
        this.navcam.updateProjectionMatrix();
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

