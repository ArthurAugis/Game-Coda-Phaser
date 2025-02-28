export class Entity extends Phaser.Physics.Arcade.Sprite {

    public arcadebody : Phaser.Physics.Arcade.Body;

    private components: IComponent[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.arcadebody = this.body as Phaser.Physics.Arcade.Body;
    }

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

    public getComponent<T extends IComponent>(componentType: new(...args: any[]) => T): T | undefined{
        return this.components.find(component => component instanceof componentType) as T;
    }

    public getComponents<T extends IComponent>(componentType: new(...args: any[]) => T): T[] {
        return this.components.filter(component => component instanceof componentType) as T[];
    }

    public bossMove() {
        if (this.arcadebody.velocity.x === 0) {
            this.arcadebody.setVelocityX(100);
        }

        if (this.x >= 800) {
            this.arcadebody.setVelocityX(-100);
        } else if (this.x <= 250) {
            this.arcadebody.setVelocityX(100);
        }

        if (this.y >= 600) {
            this.arcadebody.setVelocityY(-100);
        } else if (this.y <= 550) {
            this.arcadebody.setVelocityY(100);
        }
    }



}
