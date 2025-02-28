import { Entity } from "./Entity.ts"
import { WeaponComponent } from "../components/WeaponComponent.ts"
import {Movement} from "../components/Movement.ts";
import {Health} from "../components/Health.ts";
import { PowerUp } from "./PowerUp.ts";
import {MainGameScene} from "../scenes/MainGameScene.ts";
import {GameDataKeys} from "../Data/GameDataKeys.ts";
import {Bullet} from "./Bullet.ts";

export class Boss extends Entity {
    private rateOfFire: number
    private lastShotTime: number
    private bullets: Phaser.Physics.Arcade.Group

    public init(bullets: Phaser.Physics.Arcade.Group) {
        this.rateOfFire = 0
        this.lastShotTime = 0
        this.bullets = bullets

        this.addComponent(new WeaponComponent(
            this.bullets,
            this.scene.sound.add('laser_Enemy'),
            4,
            12,
            0xffe066,
            1024
        ));

        this.addComponent(new Movement(0.2));
        this.addComponent(new Health(10));
    }

    protected preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        if(this.y > 600 && !this.scene.registry.get(GameDataKeys.BossIsSpawned)) {
            this.getComponent(Movement)?.setSpeed(0)
            this.scene.registry.set(GameDataKeys.BossIsSpawned, true)
        } else if(this.scene.registry.get(GameDataKeys.BossIsSpawned)) {
            this.bossMove();
        }

        this.getComponent(Movement)?.moveVertically(this, delta);
        if (Math.random() < 0.15 && time - this.lastShotTime > this.rateOfFire * 1000) {
                this.randomShoot();
                this.lastShotTime = time

                this.scene.sound.play('laser_Enemy');
        }
    }

    public disable() {
        this.disableBody(true, true);
    }

    public enable(x:number, y:number) {
        this.enableBody(true, x, y, true, true);

        if(this.rotation === 0) {
            this.rotation = 1.57;
        }

        this.getComponent(Health)?.once('death', () => {
            this.disable();
        });

    }

    public dropPowerUp() {
        if (Math.random() < 0.2) {
            const type = Math.random() < 0.5 ? 'health' : 'speed';
            const powerUp = new PowerUp(this.scene, this.x, this.y, 'sprites', "star_gold.png", type);
            this.scene.physics.add.existing(powerUp);
            (this.scene as MainGameScene).addPowerUpToList(powerUp);
        }
    }

    public randomShoot() {
        if(this.scene.registry.get(GameDataKeys.BossIsSpawned)) {
            const bullet: Bullet = this.bullets.get() as Bullet;
            const weaponComponent = this.getComponent(WeaponComponent);
            if (bullet) {
                const angle = Math.random() * Math.PI * 2;
                const forwardX = Math.cos(angle);
                const forwardY = Math.sin(angle);
                const velocityX = forwardX * (weaponComponent as WeaponComponent).getBulletSpeed();
                const velocityY = forwardY * (weaponComponent as WeaponComponent).getBulletSpeed();
                bullet.enable(this.x, this.y, (weaponComponent as WeaponComponent).getBulletWidth(), (weaponComponent as WeaponComponent).getBulletHeight(), (weaponComponent as WeaponComponent).getBulletColor(), velocityY, velocityX);
                (weaponComponent as WeaponComponent).getShootSoundKey().play();
            }
        }
    }
}
