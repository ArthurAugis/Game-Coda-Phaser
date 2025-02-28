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
}
