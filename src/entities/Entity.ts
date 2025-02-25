export class Entity extends Phaser.Physics.Arcade.Sprite {

    public arcadebody : Phaser.Physics.Arcade.Body;

    private components: IComponent[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.arcadebody = this.body as Phaser.Physics.Arcade.Body;
    }

    /*
    public init(texture: string, frame?: string) {
        this.arcadebody = this.body as Phaser.Physics.Arcade.Body;
        this.arcadebody.allowGravity = false;
        this.arcadebody.setFriction(0, 0);

        this.setTexture(texture, frame);
    }

     */

    public addComponent(component: IComponent) {
        this.components.push(component);
    }

    public removeComponent(component: IComponent) {
        const index = this.components.indexOf(component);
        if(index >= 0) {
            this.components.splice(index, 1);
        }
    }

    public removeComponents(componentType: new(...args: any[]) => IComponent) {
        this.components = this.components.filter(component => !(component instanceof componentType));
    }

    public getComponent<T extends IComponent>(componentType: new(...args: any[]) => T): T {
        return this.components.find(component => component instanceof componentType) as T;
    }

    public getComponents<T extends IComponent>(componentType: new(...args: any[]) => T): T[] {
        return this.components.filter(component => component instanceof componentType) as T[];
    }

}
