import GUI from 'lil-gui'
import Stats from 'stats.js';
export default class Debug {

    private active: boolean;
    public ui: GUI | undefined;
    public stats: Stats | undefined;

    constructor() {
        this.active = window.location.hash === '#debug'

        if (this.active) {
            this.ui = new GUI()
            this.stats = new Stats()
            this.stats.showPanel(0);

            document.body.appendChild(this.stats.dom);
        }
    }

    dispose() {

        if (this.active) {
            this.ui?.destroy()
        }
    }
}

