import * as THREE from 'three'
import Renderer from './renderer';
import Navigation from './navigation';
import Debug from './debug';
import { BlurspotManager } from './blurspot-manager';
import EquirectangularBaker from './equirectangular-baker';
import MapManager from './map-manager';

export interface PanoViewerOptions {
    equimapUrl: string
    equimapLowResUrl?: string

    rotationX?: number,
    rotationY?: number,
    rotationZ?: number,
}

/**
 *  Main class holding three.js experience
 */
export class PanoViewerBasic {

    public debug: Debug

    readonly scene: THREE.Scene;
    readonly canvas: HTMLElement;

    private renderer: Renderer
    private navigation: Navigation
    private mapLoader: MapManager

    private mapMaterial: THREE.MeshBasicMaterial
    private blurspots: BlurspotManager | undefined
    private baker: EquirectangularBaker | undefined
    private animReqId: number = -1


    private mesh: THREE.Mesh | undefined

    //this can come from props in future
    private options = {
        //manual map orientation correction params- this could be read in with metadata after manual horizon connection or any automatic adjustment step
        rotationX: -0.065,
        rotationY: 0.1,
        rotationZ: -0.005,
    }

    constructor(parentNode: HTMLElement, options: PanoViewerOptions) {
        this.canvas = parentNode
        this.scene = new THREE.Scene()
        this.debug = new Debug()

        this.navigation = new Navigation(this.canvas, this.scene, this.debug)
        this.renderer = new Renderer(this.canvas, this.scene, this.navigation, this.debug)

        this.mapMaterial = new THREE.MeshBasicMaterial();
        this.mapLoader = new MapManager(this.renderer.instance, this.mapMaterial, options.equimapUrl, options.equimapLowResUrl)

        //------------------
        //Naive panorama render (no zoom, no nav yet)
        this.setupPanorama(this.scene, this.debug, this.options)
        this.tick()
    }



    //INITIALIZATION AND DEBUG
    setupPanorama = (scene: THREE.Scene, debug: Debug, options: any) => {

        //panorama
        var geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(- 1, 1, 1);

        this.mesh = new THREE.Mesh(geometry, this.mapMaterial);
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

        //Add blurspot manager
        this.blurspots = new BlurspotManager(this.scene, this.navigation, this.mesh, this.debug)

        //Add map baker
        this.baker = new EquirectangularBaker(this.scene, this.renderer, this.debug)

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

        const debugFolder2 = debug.ui?.addFolder('Bake');
        debugFolder2?.add(this, 'bake')
    }


    //METHODS exposed outside
    setBlurType = (type: string) => {
        this.blurspots?.setBlurType(type)
    }

    setBlurShape = (shape: string) => {
        this.blurspots?.setBlurShape(shape)
    }
    bake = () => {
        this.baker?.bake()
    }
    clear = () => {

        this.blurspots?.clear()
    }



    update = () => {
        //update renderer
        this.renderer.update()
        //this.baker?.cubemapCamera.update(this.renderer.instance, this.scene) // DEBUG line
        //update navigation and camera
        this.navigation.update()

    }

    tick = () => {
        //not used yet
        //const elapsedTime = this.clock.getElapsedTime()

        // Update experience
        this.debug.stats?.begin();
        this.update()
        this.debug.stats?.end();

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