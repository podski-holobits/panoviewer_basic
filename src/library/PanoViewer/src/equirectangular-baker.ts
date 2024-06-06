
import * as THREE from 'three'
import Debug from './debug';
import Renderer from './renderer';

const vertexShader = `

    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix ;

    varying vec2 vUv;

    void main()  {

        vUv = vec2( 1.0 - uv.x, uv.y );
        gl_Position = projectionMatrix * modelViewMatrix  * vec4( position, 1.0 );

    }
`;


//fragment shader for cubemap - equimap conversion + sRGB conversion for export
const fragmentShader = `

precision mediump float;

uniform samplerCube map;

varying vec2 vUv;

#define M_PI 3.14159265358979

float linearToSRGB(float linear) {
    if (linear <= 0.0031308) {
        return linear * 12.92;
    } else {
        return 1.055 * pow(linear, 1.0 / 2.4) - 0.055;
    }
}

void main()  {

	vec2 uv = vUv;

	float lat =  M_PI * uv.y;
	float lon =  2.0 * M_PI * uv.x - M_PI / 2.0;

	vec3 dir = vec3( 
        -sin(lon) * sin(lat),
		cos(lat),
		-cos(lon)*sin(lat)
	);
	normalize(dir);
    vec4 color = textureCube( map, dir );
	gl_FragColor = vec4(
        linearToSRGB(color.r),
        linearToSRGB(color.g),
        linearToSRGB(color.b),
        1
    );;

}
`;
/**
 * EquirectangularBaker bakes the environmental map with faces covered into new env map
 * TODO fix/manage  color correction on the saved texture
 * TODO fix/manage dealing with blurred objects
 */
export default class EquirectangularBaker {

    private scene: THREE.Scene
    private renderer: Renderer

    private material: THREE.RawShaderMaterial
    private width: number = 4096
    private height: number = 2048

    private bakeScene: THREE.Scene
    private bakeQuadCanvas: THREE.Mesh
    private bakeCamera: THREE.OrthographicCamera
    private bakeTarget: THREE.WebGLRenderTarget
    private bakeCanvas: HTMLCanvasElement
    private bakeRenderContext: CanvasRenderingContext2D | null

    public cubemapCamera: THREE.CubeCamera //TODO public for DEBUG

    private cubemapTarget: THREE.WebGLCubeRenderTarget

    constructor(scene: THREE.Scene, renderer: Renderer, debug?: Debug) {
        this.scene = scene
        this.bakeScene = new THREE.Scene
        this.renderer = renderer

        //-----
        //Set up render to equirectangular map camera capture
        this.material = new THREE.RawShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                map: { value: null }
            },
            side: THREE.DoubleSide,
            transparent: true
        });
        this.bakeTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType
        });
        this.bakeQuadCanvas = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            this.material
        );
        this.bakeScene.add(this.bakeQuadCanvas)
        this.bakeCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1000, 1000);
        this.bakeCanvas = document.createElement('canvas');
        this.bakeRenderContext = this.bakeCanvas.getContext('2d');
        //this.bakeScene.add(this.bakeCamera)

        //-----
        //Set up cubemap camera capture
        var cubeMapSize = Math.min(this.renderer.instance.getContext().MAX_CUBE_MAP_TEXTURE_SIZE, this.height);
        this.cubemapTarget = new THREE.WebGLCubeRenderTarget(cubeMapSize, {
            format: THREE.RGBAFormat,
            magFilter: THREE.LinearFilter,
            minFilter: THREE.LinearFilter,
            generateMipmaps: true
        });
        this.cubemapCamera = new THREE.CubeCamera(.1, 1000, this.cubemapTarget);
        this.resize(this.width, this.height)

    }

    bake = () => {


        //get a cubemap of current environment 
        //this.scene.add(this.cubemapCamera);
        this.cubemapCamera.update(this.renderer.instance, this.scene);
        //this.renderer.instance.render(this.scene, this.renderer.camera);


        var pixels = new Uint8Array(4 * this.width * this.height);
        this.renderer.instance.readRenderTargetPixels(this.cubemapTarget, 0, 0, this.height, this.height, pixels, 0);

        this.material.uniforms.map.value = this.cubemapTarget.texture;


        // //debug code commented 
        // var material = new THREE.MeshStandardMaterial({
        //     envMap: this.cubemapTarget.texture,
        //     roughness: 0.05,
        //     metalness: 1
        // });
        // var geometry = new THREE.SphereGeometry(2, 32, 32)

        // var mesh = new THREE.Mesh(geometry, material)
        // mesh.position.set(-5, -0, -5)
        // this.scene.add(mesh)


        // var material2 = new THREE.MeshBasicMaterial({
        //     map: this.cubemapTarget.texture
        // });
        // var geometry2 = new THREE.PlaneGeometry(4, 2)

        // var mesh2 = new THREE.Mesh(geometry2, material2)
        // mesh2.position.set(0, 0, -5)
        // this.scene.add(mesh2)
        //this.scene.remove(this.cubemapCamera);


        // prepare a bake scene with rect and camera to record transformed map into render target
        var originalTarget = this.renderer.instance.getRenderTarget()
        this.renderer.instance.setRenderTarget(this.bakeTarget)

        this.renderer.instance.render(this.bakeScene, this.bakeCamera);


        //this could be improved by async 
        this.renderer.instance.readRenderTargetPixels(this.bakeTarget, 0, 0, this.width, this.height, pixels);
        //console.log(this.width, this.height)
        var imageData = new ImageData(new Uint8ClampedArray(pixels), this.width, this.height);

        this.renderer.instance.setRenderTarget(originalTarget)

        //---
        //prepare download data and link
        if (this.bakeRenderContext) {
            this.bakeRenderContext.putImageData(imageData, 0, 0);
            this.bakeCanvas.toBlob((blob: Blob | null) => {
                if (blob === null) {
                    console.error("Failed to create blob from canvas.");
                    return;
                }

                var url = URL.createObjectURL(blob);
                var filename = 'panoview_' + Date.now() + '.png';
                var virtualink = document.createElement('a');
                virtualink.href = url;
                virtualink.setAttribute("download", filename);
                virtualink.style.display = "none";
                virtualink.className = "download-js-link";
                virtualink.innerHTML = "x";
                document.body.appendChild(virtualink);
                setTimeout(function () {
                    virtualink.click();
                    document.body.removeChild(virtualink);
                }, 1);
            });
        }

    }

    resize = (width: number, height: number) => {

        this.width = width;
        this.height = height;

        this.bakeQuadCanvas.scale.set(this.width, this.height, 1);

        this.bakeCamera.top = this.height / 2;
        this.bakeCamera.bottom = - this.height / 2;
        this.bakeCamera.left = - this.width / 2;
        this.bakeCamera.right = this.width / 2;
        this.bakeCamera.updateProjectionMatrix();

        this.bakeCanvas.width = this.width
        this.bakeCanvas.height = this.height

        this.cubemapCamera.position.set(0, 0, 0);
        this.cubemapTarget.width = this.height
        this.cubemapTarget.height = this.height


    }


}

