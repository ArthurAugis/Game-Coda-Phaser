import {Entity} from "../entities/Entity.ts";

export class Movement implements IComponent {

    private speed: number = 0;

    public constructor(speed: number) {
        if(speed) {
            this.speed = speed;
        }
    }

    public setSpeed(speed: number) {
        this.speed = speed;
    }

    public getSpeed() {
        return this.speed;
    }

    public moveHorizontally(entity: Entity, delta: number) {
        entity.x += this.speed * delta;
    }

    public moveVertically(entity: Entity, delta: number) {
        entity.y += this.speed * delta;
    }

    public bossMove(entity: Entity, delta: number) {
        if (entity.arcadebody.velocity.x === 0) {
            entity.arcadebody.setVelocityX(100);
        }

        if (entity.x >= 800) {
            entity.arcadebody.setVelocityX(-100);
        } else if (entity.x <= 250) {
            entity.arcadebody.setVelocityX(100);
        }

        if (entity.y >= 600) {
            entity.arcadebody.setVelocityY(-100);
        } else if (entity.y <= 550) {
            entity.arcadebody.setVelocityY(100);
        }
    }
}
