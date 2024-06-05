import * as THREE from 'three'
import Navigation from './navigation';
import Debug from './debug';



//Renderer class - manages rendering of the experience and post-processing effects (if any)
export default class Renderer {

    renderer: THREE.WebGLRenderer;
    camera: THREE.Camera;
    private scene: THREE.Scene
    private navigation: Navigation
    private debug: Debug | undefined
    private pixelRatio: number
    private readonly canvas: HTMLElement;

    private width: number
    private height: number
    options = {
        exposure: 1.0,
        toneMapping: THREE.NeutralToneMapping

    }

    constructor(canvas: HTMLElement, scene: THREE.Scene, navigation: Navigation, debug?: Debug) {
        this.canvas = canvas
        this.scene = scene
        this.navigation = navigation
        this.debug = debug
        this.camera = this.navigation.navcam
        // This could be done in separate viewport manager class, but here we don' have any complex framing 
        // of the canvas - only regular fullscreen implementation
        this.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);
        this.width = window.innerWidth
        this.height = window.innerHeight

        // Renderer initialization
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        })

        // Resize event
        window.addEventListener('resize', this.resize)
        this.resize()
        this.init()
        this.initDebug()
    }

    init = () => {
        this.renderer.toneMapping = this.options.toneMapping
        this.renderer.toneMappingExposure = this.options.exposure
        this.renderer.shadowMap.enabled = false
        this.renderer.setClearColor("#fff", 1); // transparent
    }

    initDebug = () => {

        const debugFolder = this.debug?.ui?.addFolder('Image correction');
        debugFolder?.add(this.options, 'exposure').min(0.2).max(3.0).step(0.05).onChange((value: number) => {
            this.renderer.toneMappingExposure = value
        })
        debugFolder?.add(this.options, 'toneMapping',
            {
                "Neutral": THREE.NeutralToneMapping,
                "Reinhard": THREE.ReinhardToneMapping,
                "Cineon": THREE.CineonToneMapping,
                "AgX": THREE.AgXToneMapping,
                "ACES Filmic": THREE.ACESFilmicToneMapping
            }).onChange((value: THREE.ToneMapping) => {
                this.renderer.toneMapping = value
            })
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