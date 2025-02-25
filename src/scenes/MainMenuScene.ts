export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Main Menu Scene', {color: '#ffffff', fontSize: '64px'}).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Press SPACE to start', {color: '#ffffff', fontSize: '32px'}).setOrigin(0.5);
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.scene.start('MainGameScene');
        });
    }
}
