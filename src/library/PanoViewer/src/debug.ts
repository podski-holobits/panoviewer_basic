import GUI from 'lil-gui'

export default class Debug {

    private active: boolean;
    public ui: GUI | undefined;

    constructor() {
        this.active = window.location.hash === '#debug'

        if (this.active) {
            this.ui = new GUI()
        }
    }

    dispose() {

        if (this.active)
            this.ui?.destroy()
    }
}

