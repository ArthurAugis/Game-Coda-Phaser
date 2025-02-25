import {GameDataKeys} from "../Data/GameDataKeys.ts";

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor('#000000');
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Game Over', {color: '#ffffff', fontSize: '64px', fontFamily: 'Arial', fontStyle: 'bold'}).setOrigin(0.5);
        const score = this.registry.get(GameDataKeys.PlayerScore);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Score: ${score}`, {color: '#ffffff', fontSize: '48px', fontFamily: 'Arial', fontStyle: 'bold'}).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Press SPACE to restart', {color: '#ffffff', fontSize: '32px', fontFamily: 'Arial', fontStyle: 'italic'}).setOrigin(0.5);
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.scene.start('MainGameScene');
        });
    }
}
