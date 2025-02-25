export class Bullet extends Phaser.GameObjects.Rectangle {

    private arcadebody : Phaser.Physics.Arcade.Body;

    public init() {
        this.arcadebody = this.body as Phaser.Physics.Arcade.Body;
        this.arcadebody.allowGravity = false;
        this.arcadebody.setFriction(0, 0);
    }

    public enable(x: number, y: number, width: number, height: number, color: number, velocityY: number, velocityX: number) {

        this.setPosition(x, y);
        this.setSize(width, height);
        this.setFillStyle(color);
        this.setOrigin(0.5);

        this.scene.physics.world.add(this.arcadebody);

        this.arcadebody.setVelocity(velocityX, velocityY);

        this.setActive(true);
        this.setVisible(true);
    }

    public disable() {
        this.scene.physics.world.remove(this.arcadebody);

        this.arcadebody.setEnable(false);

        this.setActive(false);
        this.setVisible(false);
    }

    update(timeSinceLaunch: number, delta: number) {
        super .update(timeSinceLaunch, delta);

        if(this.y > this.scene.cameras.main.height + this.displayHeight
        || this.y < -this.displayHeight
        || this.x > this.scene.cameras.main.width + this.displayWidth
        || this.x < -this.displayWidth) {
            this.disable();
        }

    }

}
