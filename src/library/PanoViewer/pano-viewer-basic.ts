import * as THREE from 'three'
import Renderer from './renderer';
import Navigation from './navigation';
import Debug from './debug';

export interface PanoViewerOptions {
    debugMode?: boolean;
}


export class PanoViewerBasic {

    readonly scene: THREE.Scene;
    readonly canvas: HTMLElement;

    private renderer: Renderer
    private navigation: Navigation
    private clock: THREE.Clock = new THREE.Clock()

    private animReqId: number = -1
    debug: Debug

    constructor(parentNode: HTMLElement, options?: PanoViewerOptions) {
        this.canvas = parentNode
        this.scene = new THREE.Scene()
        this.debug = new Debug()

        this.navigation = new Navigation(this.canvas, this.scene, this.debug)
        this.renderer = new Renderer(this.canvas, this.scene, this.navigation, this.debug)

        //------------------
        //Naive panorama render (no zoom, no nav yet)

        var geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(- 1, 1, 1);

        var material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('/R0010121.JPG.jpg')
        });

        const mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
        this.tick()
    }

    update = () => {
        //update renderer
        this.renderer.update()

        //update navigation and camera
        this.navigation.update()
    }

    tick = () => {
        //not used yet
        //const elapsedTime = this.clock.getElapsedTime()

        // Update experience
        this.update()

        // Call tick again on the next frame; remember Id for react-relevant disposing
        this.animReqId = window.requestAnimationFrame(this.tick)
    }


    destroy = () => {
        this.dispose()
    }

    dispose = () => {
        // Template scene dispose code
        this.scene.traverse((child) => {
            // Look for all THREE meshes
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()

                // Look for all THREE materials
                for (const key in child.material) {
                    const value = child.material[key]

                    // Test if there is a dispose function (BrunoSimon idea)
                    if (value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })

        //Dispose main classes
        this.navigation.dispose()
        this.renderer.dispose()
        this.debug.dispose()

        //Dispose of animation frame (no react vite reloading issues)
        window.cancelAnimationFrame(this.animReqId)

    }
}