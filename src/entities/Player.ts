import {Entity} from "./Entity.ts";
import {WeaponComponent} from "../components/WeaponComponent.ts";

export class Player extends Entity {
    private readonly rateOfFire: number;
    private playerShipData: PlayerShipData;
    private lastShotTime: number;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;


    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string, bullets: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture, frame);

        this.addComponent(new WeaponComponent(bullets, scene.sound.add('laser_Player'), 4, 12, 0xffe066, 1024));

        this.lastShotTime = 0;
        this.rateOfFire = 0.5;

        this.rotation = -Math.PI / 2;

        this.selectPlayerShip(1);

        if (scene.input.keyboard) {
            this.cursorKeys = scene.input.keyboard.createCursorKeys();
        }


    }

    public selectPlayerShip(playerShipDataId: number) {
        const playerShipsData = this.scene.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData[playerShipDataId];
        this.setTexture('sprites', this.playerShipData.texture);
        this.setCircle(this.playerShipData.body.radius, this.playerShipData.body.offsetX, this.playerShipData.body.offsetY);
        this.arcadebody.updateCenter()
    }

    public update(timeSinceLaunch: number, delta: number) {

        if(!this.active) { return; }

        if(this.playerShipData) {
            if(this.cursorKeys.left.isDown) {
                this.x -= this.playerShipData.movementSpeed * delta;
            }
            else if(this.cursorKeys.right.isDown) {
                this.x += this.playerShipData.movementSpeed * delta;
            }

            if(this.cursorKeys.down.isDown) {
                this.y += this.playerShipData.movementSpeed * delta;
            }
            else if(this.cursorKeys.up.isDown) {
                this.y -= this.playerShipData.movementSpeed * delta;
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

        if(this.cursorKeys.space.isDown && timeSinceLaunch - this.lastShotTime > this.rateOfFire * 1000) {
            this.getComponent(WeaponComponent)?.shoot(this);
            this.lastShotTime = timeSinceLaunch;
        }

        this.x = Phaser.Math.Clamp(this.x, this.displayWidth /2, this.scene.cameras.main.width - this.displayWidth / 2);
    }

}
