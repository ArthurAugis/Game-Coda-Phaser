import {GameDataKeys} from "../Data/GameDataKeys.ts";

export class MainMenuScene extends Phaser.Scene {

  constructor() {
    super("MainMenuScene");
  }

    private background: Phaser.GameObjects.TileSprite;
    private ships: Phaser.GameObjects.Image[] = [];
    private selectedShipIndex: number = 0;

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

        if (!this.registry.has(GameDataKeys.PlayerShip)) {
            this.registry.set(GameDataKeys.PlayerShip, "1");
        }
    }

    create() {
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

        console.log("Selected ship index");
        console.log(this.selectedShipIndex);
        console.log("Ship keys");
        console.log(shipKeys);
        console.log("Player ship");
        console.log(this.registry.get(GameDataKeys.PlayerShip));

        const gamepad = this.input.gamepad?.getPad(0);
        let restartText = "";
        if (gamepad) {
            let buttonName = "A (Xbox)";
            restartText = ` or ${buttonName}`;
        }

        this.add
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
}
