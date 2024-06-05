
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

const fragmentShader = `

precision mediump float;

uniform samplerCube map;

varying vec2 vUv;

#define M_PI 3.14159265358979

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
	gl_FragColor = textureCube( map, dir );

}
`;

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

    cubemapCamera: THREE.CubeCamera
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
        var cubeMapSize = Math.min(this.renderer.renderer.getContext().MAX_CUBE_MAP_TEXTURE_SIZE, this.height);
        this.cubemapTarget = new THREE.WebGLCubeRenderTarget(cubeMapSize, {
            format: THREE.RGBAFormat,
            magFilter: THREE.LinearFilter,
            minFilter: THREE.LinearFilter,
            generateMipmaps: false
        });
        this.cubemapCamera = new THREE.CubeCamera(.1, 1000, this.cubemapTarget);
        this.resize(this.width, this.height)

    }

    bake = () => {

        //Update the render target -> this.cubemapTarget
        //this.scene.add(this.cubemapCamera);
        this.cubemapCamera.update(this.renderer.renderer, this.scene);
        //this.renderer.renderer.render(this.scene, this.renderer.camera);
        //console.log(this.cubemapTarget)


        var pixels = new Uint8Array(4 * this.width * this.height);
        this.renderer.renderer.readRenderTargetPixels(this.cubemapTarget, 0, 0, this.height, this.height, pixels, 1);
        console.log(pixels)


        this.material.uniforms.map.value = this.cubemapTarget.texture;


        //debug code
        var material = new THREE.MeshStandardMaterial({
            envMap: this.cubemapTarget.texture,
            roughness: 0.05,
            metalness: 1
        });
        var geometry = new THREE.SphereGeometry(2, 32, 32)

        var mesh = new THREE.Mesh(geometry, material)
        console.log(mesh)
        mesh.position.set(0, 0, -5)
        this.scene.add(mesh)


        // var originalTarget = this.renderer.renderer.getRenderTarget()
        // this.renderer.renderer.setRenderTarget(this.bakeTarget)
        // this.renderer.renderer.render(this.bakeScene, this.bakeCamera);


        // //this could be improved by async 
        // this.renderer.renderer.readRenderTargetPixels(this.bakeTarget, 0, 0, this.width, this.height, pixels);
        // console.log(this.width, this.height)
        // var imageData = new ImageData(new Uint8ClampedArray(pixels), this.width, this.height);

        // this.renderer.renderer.setRenderTarget(originalTarget)

        this.scene.remove(this.cubemapCamera);


        // if (this.bakeRenderContext) {
        //     this.bakeRenderContext.putImageData(imageData, 0, 0);
        //     this.bakeCanvas.toBlob((blob: Blob | null) => {
        //         if (blob === null) {
        //             console.error("Failed to create blob from canvas.");
        //             return;
        //         }

        //         var url = URL.createObjectURL(blob);
        //         var filename = 'panoview_' + Date.now() + '.png';
        //         var virtualink = document.createElement('a');
        //         virtualink.href = url;
        //         virtualink.setAttribute("download", filename);
        //         virtualink.style.display = "none";
        //         virtualink.className = "download-js-link";
        //         virtualink.innerHTML = "x";
        //         document.body.appendChild(virtualink);
        //         setTimeout(function () {
        //             virtualink.click();
        //             document.body.removeChild(virtualink);
        //         }, 1);
        //     });
        // }

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

