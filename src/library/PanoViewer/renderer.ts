import * as THREE from 'three'
import Navigation from './navigation';
import Debug from './debug';



//Renderer class - manages rendering of the experience and post-processing effects (if any)
export default class Renderer {

    renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene
    private navigation: Navigation
    private debug: Debug | undefined
    private pixelRatio: number
    private readonly canvas: HTMLElement;

    private width: number
    private height: number


    constructor(canvas: HTMLElement, scene: THREE.Scene, navigation: Navigation, debug?: Debug) {
        this.canvas = canvas
        this.scene = scene
        this.navigation = navigation
        this.debug = debug

        this.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);
        this.width = window.innerWidth
        this.height = window.innerHeight
        // Rendere initialization
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        })

        // Resize event
        window.addEventListener('resize', this.resize)
        this.resize()
        this.init()
    }

    init = () => {
        this.renderer.toneMapping = THREE.NeutralToneMapping
        this.renderer.toneMappingExposure = 1.0
        this.renderer.shadowMap.enabled = false
        this.renderer.setClearColor("#fff", 1); // transparent
        this.renderer.setPixelRatio(this.pixelRatio);
    }

    resize = () => {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);
        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(this.pixelRatio)
        this.navigation.resize(this.width, this.height)
    }

    update = () => {
        this.renderer.render(this.scene, this.navigation.navcam)
    }

    dispose = () => {
        window.removeEventListener('resize', this.resize);
    }
}