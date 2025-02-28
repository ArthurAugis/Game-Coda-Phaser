export class LeaderBoard extends Phaser.Scene {

    constructor() {
        super('LeaderBoard');
    }

    private backText: Phaser.GameObjects.Text;

    async create() {
        try {
            const response = await fetch('http://185.158.132.158:25026/topscores');
            const scores = await response.json();

            this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 350, 'Leaderboard', { color: '#ffffff', fontSize: '72px', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5);

            for (let index = 0; index < 10; index++) {
                let color = '#ffffff';
                let displayText = `${index + 1}. ___ - _______`;

                if (scores[index]) {
                    const score = scores[index];
                    if (index === 0) color = '#ffd700';
                    else if (index === 1) color = '#c0c0c0';
                    else if (index === 2) color = '#cd7f32';
                    displayText = `${index + 1}. ${score.nom} - ${score.score}`;
                }

                this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 250 + index * 50, displayText, { color, fontSize: '36px', fontFamily: 'Arial' }).setOrigin(0.5);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }



        if(this.input.gamepad?.total === 0) {
            this.backText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 200, 'Press SPACE to return to the main menu', {
                color: '#ffffff',
                fontSize: '36px',
                fontFamily: 'Arial',
                fontStyle: 'italic'
            }).setOrigin(0.5);
        } else {
            this.backText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 200, 'Press SPACE or A to return to the main menu', {
                color: '#ffffff',
                fontSize: '36px',
                fontFamily: 'Arial',
                fontStyle: 'italic'
            }).setOrigin(0.5);
        }
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.scene.start('MainMenuScene');
        });

        this.input.gamepad?.on("down", (button: Phaser.Input.Gamepad.Button) => {
            if (button.index === 0) {
                this.scene.start("MainMenuScene");
            }
        });
    }

    update(time: number, delta: number) {
        if(this.input.gamepad?.gamepads[0]) {
            this.backText.setText(`Press SPACE or A to return to the main menu`);
        } else {
            this.backText.setText(`Press SPACE to return to the main menu`);
        }
    }
}
