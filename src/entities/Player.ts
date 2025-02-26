import {Entity} from "./Entity.ts";
import {WeaponComponent} from "../components/WeaponComponent.ts";
import {Movement} from "../components/Movement.ts";
import {GameDataKeys} from "../Data/GameDataKeys.ts";
import {Health} from "../components/Health.ts";

export class Player extends Entity {
    private readonly rateOfFire: number;
    private playerShipData: PlayerShipData;
    private lastShotTime: number;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;


    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string, bullets: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture, frame);

        this.addComponent(new WeaponComponent(bullets, scene.sound.add('laser_Player'), 4, 12, 0xffe066, 1024));
        this.addComponent(new Movement(0.2));
        this.addComponent(new Health(2));

        this.lastShotTime = 0;
        this.rateOfFire = 0.5;

        this.rotation = -Math.PI / 2;

        this.selectPlayerShip(this.scene.registry.get(GameDataKeys.PlayerShip));

        if (scene.input.keyboard) {
            this.cursorKeys = scene.input.keyboard.createCursorKeys();
        }


    }

    public selectPlayerShip(playerShipDataId: number) {
        const playerShipsData = this.scene.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData[playerShipDataId];

        // console.log(playerShipDataId);
        this.setTexture('sprites', this.playerShipData.texture);
        // this.setCircle(this.playerShipData.body.radius, this.playerShipData.body.offsetX, this.playerShipData.body.offsetY);
        // this.arcadebody.updateCenter()
    }

    public update(timeSinceLaunch: number, delta: number) {

        if(!this.active) { return; }

        this.getComponent(Movement)?.setSpeed(this.playerShipData.movementSpeed);

        if(this.playerShipData) {
            if(this.cursorKeys.left.isDown || this.scene.input.gamepad!.getPad(0) && this.scene.input.gamepad!.getPad(0).leftStick.x < -0.1) {
                this.getComponent(Movement)?.moveHorizontally(this, -delta);
            }
            else if(this.cursorKeys.right.isDown || this.scene.input.gamepad!.getPad(0) && this.scene.input.gamepad!.getPad(0).leftStick.x > 0.1) {
                this.getComponent(Movement)?.moveHorizontally(this, delta);
            }

            if(this.cursorKeys.down.isDown || this.scene.input.gamepad!.getPad(0) && this.scene.input.gamepad!.getPad(0).leftStick.y > 0.1) {
                this.getComponent(Movement)?.moveVertically(this, delta);
            }
            else if(this.cursorKeys.up.isDown || this.scene.input.gamepad!.getPad(0) && this.scene.input.gamepad!.getPad(0).leftStick.y < -0.1) {
                this.getComponent(Movement)?.moveVertically(this, -delta);
            }
        }

        this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ONE).on('down', () =>{
            this.selectPlayerShip(1);
        });
        this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.TWO).on('down', () =>{
            this.selectPlayerShip(2);
        });
        this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.THREE).on('down', () =>{
            this.selectPlayerShip(3);
        });

        this.scene.input.gamepad?.on("down", (button: Phaser.Input.Gamepad.Button) => {
            if (button.index === 1) {
                this.selectPlayerShip(1);
            } else if (button.index === 2) {
                this.selectPlayerShip(2);
            } else if (button.index === 3) {
                this.selectPlayerShip(3);
            }
        });

        if(this.cursorKeys.space.isDown && timeSinceLaunch - this.lastShotTime > this.rateOfFire * 1000 ||
            this.scene.input.gamepad!.getPad(0) && this.scene.input.gamepad!.getPad(0).buttons[0].pressed && timeSinceLaunch - this.lastShotTime > this.rateOfFire * 1000
        ) {
            this.getComponent(WeaponComponent)?.shoot(this);
            this.lastShotTime = timeSinceLaunch;
        }

        this.x = Phaser.Math.Clamp(this.x, this.displayWidth /2, this.scene.cameras.main.width - this.displayWidth / 2);
    }


}
