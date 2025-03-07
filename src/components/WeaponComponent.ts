import {Entity} from "../entities/Entity.ts";
import {Bullet} from "../entities/Bullet.ts";

export class WeaponComponent implements IComponent {

    private bullets: Phaser.Physics.Arcade.Group;
    private shootSoundKey: Phaser.Sound.BaseSound;
    private bulletWidth: number;
    private bulletHeight: number;
    private bulletColor: number;
    private bulletSpeed: number;

    public constructor(bullets: Phaser.Physics.Arcade.Group, shootSoundKey: Phaser.Sound.BaseSound, bulletWidth: number, bulletHeight: number, bulletColor: number, bulletSpeed: number) {
        this.bullets = bullets;
        this.shootSoundKey = shootSoundKey;
        this.bulletWidth = bulletWidth;
        this.bulletHeight = bulletHeight;
        this.bulletColor = bulletColor;
        this.bulletSpeed = bulletSpeed;
    }

    public shoot(entity: Entity) {
        const bullet: Bullet = this.bullets.get() as Bullet;
        if(bullet) {

            const angle = entity.rotation;
            const forwardX = Math.cos(angle);
            const forwardY = Math.sin(angle);
            const velocityX = forwardX * this.bulletSpeed;
            const velocityY = forwardY * this.bulletSpeed;
            bullet.enable(entity.x, entity.y, this.bulletWidth, this.bulletHeight, this.bulletColor, velocityY, velocityX);
            this.shootSoundKey.play();
        }
    }

    public getBulletSpeed() {
        return this.bulletSpeed;
    }

    public getBulletWidth() {
        return this.bulletWidth;
    }

    public getBulletHeight() {
        return this.bulletHeight;
    }

    public getBulletColor() {
        return this.bulletColor;
    }

    public getShootSoundKey() {
        return this.shootSoundKey;
    }




}
