import { Entity } from "./Entity.ts"
import { WeaponComponent } from "../components/WeaponComponent.ts"

export class Enemy extends Entity {
    private rateOfFire: number
    private lastShotTime: number
    private bullets: Phaser.Physics.Arcade.Group

    public init(bullets: Phaser.Physics.Arcade.Group) {
        this.rateOfFire = 1.5
        this.lastShotTime = 0
        this.bullets = bullets

        this.addComponent(new WeaponComponent(
            this.bullets,
            this.scene.sound.add('laser_Enemy'),
            4,
            12,
            0xffe066,
            1024
        ))
    }

    public update(timeSinceLaunch: number) {
        if (Math.random() < 0.01 && timeSinceLaunch - this.lastShotTime > this.rateOfFire * 1000) {
            this.play('ufoshoot');
            this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.getComponent(WeaponComponent)?.shoot(this)
                this.lastShotTime = timeSinceLaunch

                this.scene.sound.play('laser_Enemy');
            });
        }
    }

    public disable() {
        this.disableBody(true, true);
    }

    public enable(x:number, y:number) {
        this.enableBody(true, x, y, true, true);
        this.arcadebody.setVelocityY(256);

        if(this.rotation === 0) {
            this.rotation = 1.57;
        }

    }
}
