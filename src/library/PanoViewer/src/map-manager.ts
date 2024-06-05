import * as THREE from 'three'



/**
 *  Naive approach for low res texture preloader
 */
export default class MapManager {

    public currentMap: THREE.Texture;
    public currentMapLowRes: THREE.Texture | undefined;
    public mapMaterial: THREE.MeshBasicMaterial
    private renderer: THREE.WebGLRenderer //used for debugging

    //placeholder for getting more maps and building more sophisticated Equimap manager
    public mapArray: THREE.Texture[] = []


    constructor(renderer: THREE.WebGLRenderer, material: THREE.MeshBasicMaterial, defaultUrl: string, defaultLowResUrl: string | undefined) {

        this.mapMaterial = material
        this.renderer = renderer

        //if  low res provided -> load the full map async
        if (defaultLowResUrl) {
            this.currentMap = new THREE.TextureLoader().load(defaultLowResUrl)
            this.preloadCurrent(defaultUrl)
        }

        //if no low res provided -> load the full map
        else
            this.currentMap = new THREE.TextureLoader().load(defaultUrl)

        //fix the sRGB and add to material
        //TODO consider refactoring to add the material from outside (needs callback)
        this.currentMap.colorSpace = THREE.SRGBColorSpace
        this.mapMaterial.map = this.currentMap
    }

    preloadCurrent = async (mapUrl: string) => {

        this.currentMap = await new THREE.TextureLoader().loadAsync(mapUrl)
        this.currentMap.colorSpace = THREE.SRGBColorSpace

        //following could also be done externally with a callback however in the case of equirectangular map viewer it is very likely there will  be
        //only one map viewed at a time and we can assume that it will have signle material
        this.mapMaterial.map = this.currentMap
        this.mapMaterial.needsUpdate = true

    }

    dispose() {
        this.currentMap?.dispose()
        this.currentMapLowRes?.dispose()
    }
}

