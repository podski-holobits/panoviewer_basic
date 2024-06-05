import * as THREE from 'three'
import Navigation from './navigation';
import Debug from './debug';

//TODO clear blurspots
//TODO dispose of existing blurspots

export class BlurspotManager {

    private readonly scene: THREE.Scene;

    private navigation: Navigation
    private debug: Debug | undefined



    private blurspot_geometry: THREE.CircleGeometry
    private blurspot_geometry_rect: THREE.PlaneGeometry
    private blurspot_material: THREE.MeshPhysicalMaterial
    private blurspot_material_test: THREE.MeshBasicMaterial
    private current_blurspot: THREE.Mesh | undefined | null = null
    private blurspot_drag: boolean = false
    private blurspot_pointer: THREE.Vector2 = new THREE.Vector2(0, 0)
    private blurspot_position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)


    private collider_sphere: THREE.Mesh
    private blurspot_list: THREE.Mesh[] = []

    public options = {
        blurStrength: 0.5,
        transmission: 1.0,
        drawSpeed: 0.1,
        shape: "circle"
    }

    constructor(scene: THREE.Scene, navigation: Navigation, collider_sphere: THREE.Mesh, debug?: Debug) {
        this.scene = scene;
        this.navigation = navigation
        this.collider_sphere = collider_sphere
        this.debug = debug




        this.blurspot_geometry = new THREE.CircleGeometry(10, 64);
        this.blurspot_geometry_rect = new THREE.PlaneGeometry(10, 10)
        this.blurspot_material = new THREE.MeshPhysicalMaterial({
            transmission: this.options.transmission,
            roughness: this.options.blurStrength,
        })
        this.blurspot_material_test = new THREE.MeshBasicMaterial()

        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("mousemove", this.drag);

        //DEBUG
        const debugFolder = this.debug?.ui?.addFolder('Manual Blur');
        debugFolder?.add(this.options, 'blurStrength').min(0.0).max(1.0).step(0.01).onChange((value: number) => {
            this.blurspot_material.roughness = value
        })
        debugFolder?.add(this.options, 'transmission').min(0.0).max(1.0).step(0.01).onChange((value: number) => {
            this.blurspot_material.transmission = value
        })
        debugFolder?.add(this.options, 'drawSpeed').min(0.050).max(0.15).step(0.001)
        debugFolder?.add(this.options, 'shape', { cirlce: "circle", square: "rect" })
        debugFolder?.add(this, 'clear')
    }

    setBlurType = (type: string) => {
        if (type == "solid")
            this.blurspot_material.transmission = 0.0
        else
            this.blurspot_material.transmission = 1.0
    }
    setBlurShape = (type: string) => {
        if (type == "circle")
            this.options.shape = "circle"
        else
            this.options.shape = "rect"
    }


    onMouseDown = (event: MouseEvent) => {

        this.blurspot_pointer = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1
        )


        if (event.button == 1 || event.button == 2) { // wheel click or right mouse
            this.blurspot_drag = true
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(this.blurspot_pointer, this.navigation.navcam);

            if (this.collider_sphere) {
                const intersects = raycaster.intersectObject(this.collider_sphere, false)
                if (intersects.length > 0) {
                    this.blurspot_position = intersects[0].point
                    this.blurspot_position.multiplyScalar(0.8)

                    if (this.options.shape == "rect")
                        this.current_blurspot = new THREE.Mesh(this.blurspot_geometry_rect, this.blurspot_material);
                    else
                        this.current_blurspot = new THREE.Mesh(this.blurspot_geometry, this.blurspot_material);

                    this.current_blurspot.position.set(this.blurspot_position.x, this.blurspot_position.y, this.blurspot_position.z)
                    this.current_blurspot.lookAt(new THREE.Vector3(0.0, 0.0, 0.0))
                    this.current_blurspot.scale.set(0.1, 0.1, 0.1)
                    this.blurspot_list.push(this.current_blurspot)
                    this.scene.add(this.current_blurspot)
                }
            }


        }
    }

    onMouseUp = (event: MouseEvent) => {
        this.current_blurspot = null
        this.blurspot_drag = false
        this.blurspot_pointer = new THREE.Vector2(0, 0)
        this.blurspot_position = new THREE.Vector3(0, 0, 0)
    }

    drag = (event: MouseEvent) => {

        if (this.blurspot_drag) {

            if (this.current_blurspot != null) {

                const pointer = new THREE.Vector2(
                    (event.clientX / window.innerWidth) * 2 - 1,
                    - (event.clientY / window.innerHeight) * 2 + 1
                )
                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(pointer, this.navigation.navcam);

                if (this.collider_sphere) {
                    const intersects = raycaster.intersectObject(this.collider_sphere, false)
                    if (intersects.length > 0) {
                        const distance = this.options.drawSpeed * Math.max(0.1, this.blurspot_position.distanceTo(intersects[0].point.multiplyScalar(0.8)))
                        this.current_blurspot.scale.set(distance, distance, distance)
                    }
                }

            }
            else {
                this.blurspot_drag = false
            }
        }
    }


    clear = () => {
        while (this.blurspot_list.length > 0) {
            const blurspot = this.blurspot_list.pop();
            if (blurspot !== undefined) {
                this.scene.remove(blurspot);
            }
        }
    }

    dispose = () => {

        window.removeEventListener("mousedown", this.onMouseDown);

        window.removeEventListener("mouseup", this.onMouseUp);

        window.removeEventListener("mousemove", this.drag);
    }
}

