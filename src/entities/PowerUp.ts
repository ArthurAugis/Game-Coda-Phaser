import { Entity } from "./Entity.ts";
import { Player } from "./Player.ts";
import { Health } from "../components/Health.ts";
import { Movement } from "../components/Movement.ts";

interface BonusDisplay {
    icon: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
    timerEvent: Phaser.Time.TimerEvent;
    resetSpeedCall?: Phaser.Time.TimerEvent;
    baseSpeed?: number;
    movement?: Movement;
}

export class PowerUp extends Entity {
    public type: 'health' | 'speed';

    private static bonusDisplays: { [sceneKey: string]: { [key in 'health' | 'speed']?: BonusDisplay } } = {};

    private static iconConfigs: { [key in 'health' | 'speed']: { key: string, frame?: string | number } } = {
        health: { key: 'sprites', frame: 'heart.png' },
        speed: { key: 'sprites', frame: 'powerupGreen_bolt.png' }
    };

    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string, type: 'health' | 'speed') {
        super(scene, x, y, texture, frame);
        this.type = type;

        const sceneKey = scene.sys.settings.key;
        if (!PowerUp.bonusDisplays[sceneKey]) {
            PowerUp.bonusDisplays[sceneKey] = {};
        }
    }

    public applyEffect(player: Player) {
        const sceneKey = this.scene.sys.settings.key;
        if (this.type === 'health') {
            player.getComponent(Health)?.inc(1);
            PowerUp.addBonusDisplay(this.scene, 'health', 3000);
        } else if (this.type === 'speed') {
            const movement = player.getComponent(Movement);
            if (movement) {
                const displays = PowerUp.getDisplays(this.scene);
                if (!displays['speed']) {
                    const baseSpeed = movement.getSpeed();
                    movement.setSpeed(baseSpeed * 2);
                    PowerUp.addBonusDisplay(this.scene, 'speed', 15000, baseSpeed, movement);
                } else {
                    PowerUp.addBonusDisplay(this.scene, 'speed', 15000);
                }
            }
        }
        this.destroy();
    }

    private static getDisplays(scene: Phaser.Scene): { [key in 'health' | 'speed']?: BonusDisplay } {
        const sceneKey = scene.sys.settings.key;
        if (!this.bonusDisplays[sceneKey]) {
            this.bonusDisplays[sceneKey] = {};
        }
        const displays = this.bonusDisplays[sceneKey];
        for (const key in displays) {
            const display = displays[key as 'health' | 'speed'];
            if (display && (!display.icon.active || !display.text.active)) {
                delete displays[key as 'health' | 'speed'];
            }
        }
        return displays;
    }

    private static repositionDisplays(scene: Phaser.Scene) {
        const displays = this.getDisplays(scene);
        let index = 0;
        for (const key in displays) {
            const display = displays[key as 'health' | 'speed']!;
            const x = 10;
            const y = 10 + index * 40;
            display.icon.setPosition(x, y);
            display.text.setPosition(x + display.icon.width + 5, y);
            index++;
        }
    }

    private static removeBonusDisplay(scene: Phaser.Scene, type: 'health' | 'speed') {
        const displays = this.getDisplays(scene);
        if (displays[type]) {
            if (displays[type]!.resetSpeedCall) {
                displays[type]!.resetSpeedCall.remove(false);
            }
            displays[type]!.icon.destroy();
            displays[type]!.text.destroy();
            delete displays[type];
            this.repositionDisplays(scene);
        }
    }

    private static addBonusDisplay(
        scene: Phaser.Scene,
        type: 'health' | 'speed',
        duration?: number,
        baseSpeed?: number,
        movement?: Movement
    ) {
        const displays = this.getDisplays(scene);
        const iconConfig = this.iconConfigs[type];

        if (type === 'health') {
            if (displays[type] && displays[type].icon && displays[type].icon.active) {
                let count = parseInt(displays[type]!.text.text.replace('+', ''));
                count++;
                displays[type]!.text.setText("+" + count.toString());
                displays[type]!.timerEvent.remove(false);
                displays[type]!.timerEvent = scene.time.delayedCall(duration || 3000, () => {
                    PowerUp.removeBonusDisplay(scene, 'health');
                });
            } else {
                const index = Object.keys(displays).length;
                const x = 10;
                const y = 10 + index * 40;
                const icon = scene.add.image(x, y, iconConfig.key, iconConfig.frame).setOrigin(0, 0);
                const text = scene.add.text(x + icon.width + 5, y, '', { font: '32px Arial', color: '#fff' });
                text.setText("+1");
                const timerEvent = scene.time.delayedCall(duration || 3000, () => {
                    PowerUp.removeBonusDisplay(scene, 'health');
                });
                displays[type] = { icon, text, timerEvent };
                this.repositionDisplays(scene);
            }
        } else if (type === 'speed') {
            if (displays[type] && displays[type].icon && displays[type].icon.active) {
                displays[type]!.timerEvent.remove(false);
                const timeMs = duration || 15000;
                let countdown = timeMs / 1000;
                displays[type]!.text.setText(countdown.toString());
                let timerEvent: Phaser.Time.TimerEvent;
                timerEvent = scene.time.addEvent({
                    delay: 1000,
                    repeat: countdown - 1,
                    callback: () => {
                        countdown--;
                        const currentDisplay = PowerUp.getDisplays(scene)['speed'];
                        if (!currentDisplay || !currentDisplay.text.active) {
                            timerEvent.remove();
                            return;
                        }
                        currentDisplay.text.setText(countdown.toString());
                    }
                });
                displays[type]!.timerEvent = timerEvent;
                if (displays[type]!.resetSpeedCall) {
                    displays[type]!.resetSpeedCall.remove(false);
                }
                displays[type]!.resetSpeedCall = scene.time.delayedCall(duration || 15000, () => {
                    if (displays['speed'] && displays['speed']!.movement && displays['speed']!.baseSpeed !== undefined) {
                        displays['speed']!.movement.setSpeed(displays['speed']!.baseSpeed);
                    }
                    PowerUp.removeBonusDisplay(scene, 'speed');
                });
            } else {
                const index = Object.keys(displays).length;
                const x = 10;
                const y = 10 + index * 40;
                const icon = scene.add.image(x, y, iconConfig.key, iconConfig.frame).setOrigin(0, 0);
                const text = scene.add.text(x + icon.width + 5, y, '', { font: '32px Arial', color: '#fff' });
                const timeMs = duration || 15000;
                let countdown = timeMs / 1000;
                text.setText(countdown.toString());
                let timerEvent: Phaser.Time.TimerEvent;
                timerEvent = scene.time.addEvent({
                    delay: 1000,
                    repeat: countdown - 1,
                    callback: () => {
                        countdown--;
                        const currentDisplay = PowerUp.getDisplays(scene)['speed'];
                        if (!currentDisplay || !currentDisplay.text.active) {
                            timerEvent.remove();
                            return;
                        }
                        currentDisplay.text.setText(countdown.toString());
                    }
                });
                const resetSpeedCall = scene.time.delayedCall(duration || 15000, () => {
                    if (displays['speed'] && displays['speed']!.movement && displays['speed']!.baseSpeed !== undefined) {
                        displays['speed']!.movement.setSpeed(displays['speed']!.baseSpeed);
                    }
                    PowerUp.removeBonusDisplay(scene, 'speed');
                });
                displays[type] = { icon, text, timerEvent, resetSpeedCall, baseSpeed, movement };
                this.repositionDisplays(scene);
            }
        }
    }
}
