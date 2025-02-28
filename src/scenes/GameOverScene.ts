import {GameDataKeys} from "../Data/GameDataKeys.ts";

export class GameOverScene extends Phaser.Scene {

    private menuMessage: Phaser.GameObjects.Text;
    private saveScoreButton: Phaser.GameObjects.Text;

    constructor() {
        super('GameOverScene');
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor('#000000');
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Game Over', {color: '#ffffff', fontSize: '64px', fontFamily: 'Arial', fontStyle: 'bold'}).setOrigin(0.5);
        const score = this.registry.get(GameDataKeys.PlayerScore);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Score: ${score}`, {color: '#ffffff', fontSize: '48px', fontFamily: 'Arial', fontStyle: 'bold'}).setOrigin(0.5);
        const gamepad = this.input.gamepad?.getPad(0)
        let restartText = ""
        if (gamepad) {
            let buttonName = "A"
            restartText = ` or ${buttonName}`
        }

        this.menuMessage = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            `Press SPACE${restartText} to return to the main menu`,
            { color: '#ffffff', fontSize: '32px', fontFamily: 'Arial', fontStyle: 'italic' }
        ).setOrigin(0.5);

        this.saveScoreButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 200,
            'Save Score',
            { color: 'black', backgroundColor: 'white', fontSize: '32px', fontFamily: 'Arial', fontStyle: 'italic', padding: { x: 10, y: 5 } }
        ).setOrigin(0.5).setInteractive();

        this.saveScoreButton.on('pointerdown', async () => {
            const name = prompt('Enter your name');
            const points = this.registry.get(GameDataKeys.PlayerScore);
            const secret = 'les_chaussettes_de_l_archiduchesse_sont_elles_seches_ou_archi_seches';

            if (name) {
                try {
                    const response = await fetch('http://185.158.132.158:25026/scores', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, points, secret })
                    });

                    if (response.ok) {
                        this.scene.start('LeaderBoard');
                    } else {
                        alert('An error occurred while saving the score');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });

        this.input.keyboard?.on('keydown-SPACE', () => {
            this.scene.start('MainMenuScene');
        });

        this.input.gamepad?.on("down", (button: Phaser.Input.Gamepad.Button) => {
            if (button.index === 0) {
                this.scene.start("MainMenuScene");
            }
        });
    }

    update() {
        if (this.input.gamepad?.gamepads[0]) {
            this.menuMessage.setText(`Press SPACE or A to start the game`);
        } else {
            this.menuMessage.setText(`Press SPACE to start the game`);
        }
    }
}
