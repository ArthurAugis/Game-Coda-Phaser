import {GameDataKeys} from "../Data/GameDataKeys.ts";

export class MainMenuScene extends Phaser.Scene {

  constructor() {
    super("MainMenuScene");
  }

    private background: Phaser.GameObjects.TileSprite;
    private ships: Phaser.GameObjects.Image[] = [];
    private selectedShipIndex: number = 0;
    private startMessage: Phaser.GameObjects.Text;

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '40px monospace',
                color: '#ffffff',
                align: 'center'
            }
        }).setOrigin(0.5);
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
            loadingText.setText('Loading...' + Math.round(value * 100) + '%');
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });

        this.load.setPath('assets');
        this.load.image('background', 'Backgrounds/darkPurple.png');
        this.load.atlas('sprites', 'texture.png', 'texture.json');
        this.load.json('playerShips', 'Data/playerShips.json');
        this.load.font('font_future', 'Bonus/kenvector_future.ttf');
        this.load.audio('laser_Enemy', 'Bonus/sfx_laser1.ogg');
        this.load.audio('laser_Player', 'Bonus/sfx_laser2.ogg');
    }

    create() {
        this.ships = [];
        this.background = this.add.tileSprite(0, 0, 1080, 1920, "background").setOrigin(0, 0).setTileScale(2);

        this.add
            .text(
                this.cameras.main.centerX,
                150,
                "Space Invaders",
                { color: "#00ff00", fontSize: "64px", fontFamily: "font_future" }
            )
            .setOrigin(0.5);

        const playerShipsData = this.cache.json.get('playerShips') as { [key: string]: any };
        const shipKeys = Object.keys(playerShipsData);

        shipKeys.forEach((key, index) => {
            const shipData = playerShipsData[key];
            const ship = this.add.image(this.cameras.main.centerX + (index - 1) * 200, this.cameras.main.centerY, "sprites", shipData.texture).setScale(2);
            ship.setAngle(270);
            this.ships.push(ship);
        });

        if (this.registry.has(GameDataKeys.PlayerShip)) {
            this.updateAlreadySelectedShip();
        } else {
            this.updateShipPositions();
        }

        const gamepad = this.input.gamepad?.getPad(0);
        let restartText = "";
        if (gamepad) {
            let buttonName = "A";
            restartText = ` or ${buttonName}`;
        }

        const leaderboardButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 500,
            "Leaderboard",
            { color: "black", backgroundColor:'white', padding: { x: 10, y: 5 } ,fontSize: "40px", fontFamily: "font_future" }
        ).setOrigin(0.5).setInteractive();

        leaderboardButton.on('pointerdown', () => {
            this.scene.start("LeaderBoard");
        });

        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 350,
            "Controls:\n- Arrows or Left Stick to move\n- SPACE or B (Xbox) to shoot",
            { color: "#ffffff", fontSize: "36px", fontFamily: "font_future", align: "center" }
        ).setOrigin(0.5);

        this.startMessage = this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.height - 150,
                `Press SPACE${restartText} to start the game`,
                { color: "#00ff00", fontSize: "40px", fontFamily: "font_future" }
            )
            .setOrigin(0.5);

        this.input.keyboard?.on("keydown-SPACE", () => {
            this.registry.set(GameDataKeys.PlayerShip, shipKeys[this.selectedShipIndex]);
            this.scene.start("MainGameScene");
        });

        this.input.gamepad?.on("down", (button: Phaser.Input.Gamepad.Button) => {
            if (button.index === 0) {
                this.registry.set(GameDataKeys.PlayerShip, shipKeys[this.selectedShipIndex]);
                this.scene.start("MainGameScene");
            }
        });

        this.input.keyboard?.on("keydown-RIGHT", () => {
            this.cycleShips(1);
        });

        this.input.keyboard?.on("keydown-LEFT", () => {
            this.cycleShips(-1);
        });
    }



    private cycleShips(direction: number) {
        this.selectedShipIndex = Phaser.Math.Wrap(this.selectedShipIndex + direction, 0, this.ships.length);
        this.registry.set(GameDataKeys.PlayerShip, this.selectedShipIndex.toString());
        this.updateShipPositions();
    }

    private updateShipPositions() {
        this.ships.forEach((ship, index) => {
            const offset = index - this.selectedShipIndex;
            ship.x = this.cameras.main.centerX + offset * 200;
            ship.setScale(offset === 0 ? 2 : 0.8);
            ship.setDepth(offset === 0 ? 1 : 0.5);
        });
    }

    private updateAlreadySelectedShip() {
        this.ships.forEach((ship, index) => {
            if (index.toString() === this.registry.get(GameDataKeys.PlayerShip)) {
                this.selectedShipIndex = index - 1;
            }
        });
        this.updateShipPositions();
    }

    update() {
        if(this.input.gamepad?.gamepads[0]) {
            this.startMessage.setText(`Press SPACE or A to start the game`);
        } else {
            this.startMessage.setText(`Press SPACE to start the game`);
        }

        if(this.input.gamepad?.gamepads[0] && this.input.gamepad?.gamepads[0].leftStick.x < -0.1) {
            this.cycleShips(-1)
        }

        if(this.input.gamepad?.gamepads[0] && this.input.gamepad?.gamepads[0].leftStick.x > 0.1) {
            this.cycleShips(1)
        }
    }
}
