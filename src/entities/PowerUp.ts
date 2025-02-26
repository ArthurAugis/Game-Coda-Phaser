import { Entity } from "./Entity.ts";
import { Player } from "./Player.ts";
import { Health } from "../components/Health.ts";
import { Movement } from "../components/Movement.ts";

export class PowerUp extends Entity {
    public type: 'health' | 'speed';

    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string, type: 'health' | 'speed') {
        super(scene, x, y, texture, frame);
        this.type = type;
    }

    public applyEffect(player: Player) {
        if (this.type === 'health') {
            player.getComponent(Health)?.inc(1);
        } else if (this.type === 'speed') {
            const movement = player.getComponent(Movement);
            if (movement) {
                const originalSpeed = movement.getSpeed();
                player.removeComponent(movement);
                player.addComponent(new Movement(originalSpeed * 2));

                this.scene.time.delayedCall(15000, () => {
                    player.removeComponent(movement);
                    player.addComponent(new Movement(originalSpeed));
                });
            }
        }
        this.destroy();
    }
}