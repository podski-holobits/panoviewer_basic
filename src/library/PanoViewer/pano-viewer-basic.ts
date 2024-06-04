import * as THREE from 'three'
import Renderer from './renderer';
import Navigation from './navigation';
import Debug from './debug';
import { BlurspotManager } from './blurspot-manager';

export interface PanoViewerOptions {
    debugMode?: boolean;
    rotationX: number,
    rotationY: number,
    rotationZ: number,
}


export class PanoViewerBasic {

    readonly scene: THREE.Scene;
    readonly canvas: HTMLElement;

    private renderer: Renderer
    private navigation: Navigation
    private clock: THREE.Clock = new THREE.Clock()

    private blurspots: BlurspotManager | undefined
    private animReqId: number = -1


    private mesh: THREE.Mesh | undefined
    debug: Debug

    //this can be read in with metadata after manual horizon connection
    options = {
        rotationX: -0.065,
        rotationY: 0.1,
        rotationZ: -0.005,
    }

    constructor(parentNode: HTMLElement, options?: PanoViewerOptions) {
        this.canvas = parentNode
        this.scene = new THREE.Scene()
        this.debug = new Debug()

        this.navigation = new Navigation(this.canvas, this.scene, this.debug)
        this.renderer = new Renderer(this.canvas, this.scene, this.navigation, this.debug)

        //------------------
        //Naive panorama render (no zoom, no nav yet)
        this.setupPanorama(this.scene, this.debug, this.options)
        this.tick()
    }


    setupPanorama = (scene: THREE.Scene, debug: Debug, options: any) => {

        //panorama
        var geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(- 1, 1, 1);

        const texture = new THREE.TextureLoader().load('/R0010121.JPG.jpg')
        texture.colorSpace = THREE.SRGBColorSpace
        var material = new THREE.MeshBasicMaterial({
            map: texture
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.setRotationFromEuler(new THREE.Euler(options.rotationX, options.rotationY, options.rotationZ))

        scene.add(this.mesh);


        //bottom primitive
        var plane_geometry = new THREE.CircleGeometry(50, 64);
        var plane_material = new THREE.MeshBasicMaterial();
        plane_material.opacity = .5
        plane_material.transparent = true
        var plane = new THREE.Mesh(plane_geometry, plane_material);
        plane.position.set(0, -75, 0)
        plane.rotateX(-Math.PI / 2)
        scene.add(plane);

        //DEBUG 
        const debugFolder = debug.ui?.addFolder('Panorama correction');
        debugFolder?.add(options, 'rotationX').min(-0.3).max(0.3).onChange((value: number) => {
            this.mesh?.setRotationFromEuler(new THREE.Euler(value, this.mesh.rotation.y, this.mesh.rotation.z))
        })
        debugFolder?.add(options, 'rotationY').min(-0.3).max(0.3).step(0.01).onChange((value: number) => {
            this.mesh?.setRotationFromEuler(new THREE.Euler(this.mesh.rotation.x, value, this.mesh.rotation.z))
        })
        debugFolder?.add(options, 'rotationZ').min(-0.3).max(0.3).onChange((value: number) => {
            this.mesh?.setRotationFromEuler(new THREE.Euler(this.mesh.rotation.x, this.mesh.rotation.y, value))
        })

        //Add blurspot manager
        this.blurspots = new BlurspotManager(this.scene, this.navigation, this.mesh, this.debug)

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

        this.blurspots?.dispose()
        //Dispose of animation frame (no react vite reloading issues)
        window.cancelAnimationFrame(this.animReqId)

    }
}