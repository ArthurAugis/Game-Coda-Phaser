import { Scene } from 'phaser';

export class MainGameScene extends Scene
{

    private player: Phaser.GameObjects.Image;
    // private playerCenter: Phaser.GameObjects.Arc;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private lastShotTime: number = 0;
    private playerRateFire: number = 0.5;
    private bullets: Phaser.Physics.Arcade.Group;
    private enemies: Phaser.Physics.Arcade.Group;
    private enemies_bullets: Phaser.Physics.Arcade.Group;
    private vies: number = 1;
    private bg: Phaser.GameObjects.TileSprite
    private sprites: Phaser.GameObjects.TileSprite
    private playerShipData: PlayerShipData;


    constructor ()
    {
        super('MainGameScene');
    }

    preload ()
    {
        this.load.setPath('assets');

        this.load.image('background', 'Backgrounds/darkPurple.png');
        this.load.image('meteor', 'PNG/Meteors/meteorBrown_big1.png');
        this.load.atlas('sprites', 'texture.png', 'texture.json');

        this.load.audio('laser_Enemy', 'Bonus/sfx_laser1.ogg');
        this.load.audio('laser_Player', 'Bonus/sfx_laser2.ogg');

        this.load.json('playerShips', 'Data/playerShips.json');

    }

    create ()
    {
        const playerShipsData = this.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData["1"];

        this.cameras.main.setBackgroundColor(0x50514f);
        // this.playerCenter = this.add.circle(this.cameras.main.centerX, this.cameras.main.centerY, 28, 0xf25f5c);

        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background').setOrigin(0).setTileScale(2);

        this.player = this.add.image(this.cameras.main.centerX, this.cameras.main.height -128, 'sprites', this.playerShipData.texture);
        this.physics.add.existing(this.player);

        if(this.input.keyboard) {
            this.cursorKeys = this.input.keyboard.createCursorKeys();

            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE).on('down', () =>{
                this.selectPlayerShip(1);
            });
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO).on('down', () =>{
                this.selectPlayerShip(2);
            });
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE).on('down', () =>{
                this.selectPlayerShip(3);
            });
        }

        this.anims.create({
            key: 'ufoshoot',
            frames: [
                {key: 'sprites', frame: 'ufoRed.png'},
                {key: 'sprites', frame: 'enemy_2.png'},
                {key: 'sprites', frame: 'enemy_3.png'},
            ],
            frameRate: 8,
        })

        this.bullets = this.physics.add.group()
        this.enemies = this.physics.add.group()
        this.enemies_bullets = this.physics.add.group()
        this.physics.add.collider(this.bullets, this.enemies,(bullet, enemy) => {
            bullet.destroy();
            enemy.destroy();
        });

        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            this.vies--;
            enemy.destroy();

            if(this.vies === 0) {
                player.destroy();
            }
        });

        this.physics.add.collider(this.player, this.enemies_bullets, (player, enemy_bullet) => {
            this.vies--;
            enemy_bullet.destroy();

            if(this.vies === 0) {
                player.destroy();
            }
        });

        this.time.addEvent({
            delay: 1500,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        })

    }

    private selectPlayerShip(ship: number) {
        const playerShipsData = this.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData[ship];
        this.player.setTexture('sprites', this.playerShipData.texture);
    }

    private spawnEnemy() {
        if (this.enemies.getLength() >= 5) {
            return;
        }
        const enemySize: number = 32;
        let enemy: Phaser.GameObjects.Sprite = this.add.sprite(
            Phaser.Math.Between(enemySize, this.cameras.main.width - enemySize),
            -enemySize / 2,
            'sprites', "ufoRed.png",
        ).setDepth(100);

        this.enemies.add(enemy);
        let enemyBody: Phaser.Physics.Arcade.Body = enemy.body as Phaser.Physics.Arcade.Body;
        enemyBody.allowGravity = false;
        enemyBody.setFriction(0, 0);
        enemyBody.setVelocityY(256);

        this.time.addEvent({
            delay: 1.3 * 1000,
            callback: () => this.enemyFire(enemy),
            callbackScope: this,
            loop: true
        });
    }

    private enemyFire(enemy: Phaser.GameObjects.GameObject) {
        if (!this.enemies.contains(enemy)) return;

        enemy.play('ufoshoot');
        enemy.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            let enemyEntity = enemy as Phaser.GameObjects.Rectangle;
            let enemy_bullet: Phaser.GameObjects.Image = this.add.image(
                enemyEntity.x,
                enemyEntity.y - enemyEntity.displayHeight / 2,
                'sprites', 'laserRed16.png'
            ).setOrigin(0.5);
            this.enemies_bullets.add(enemy_bullet);
            let bulletBody: Phaser.Physics.Arcade.Body = enemy_bullet.body as Phaser.Physics.Arcade.Body;
            bulletBody.allowGravity = false;
            bulletBody.setFriction(0, 0);
            bulletBody.setVelocityY(1024);

            this.sound.play('laser_Enemy');
        });
    }


    update(_timestamp: number, _delta: number) {
        this.bg.tilePositionY -= 0.1 * _delta;

        if(this.cursorKeys.left.isDown) {
            this.player.x -= this.playerShipData.movementSpeed * _delta;
        }
        else if(this.cursorKeys.right.isDown) {
            this.player.x += this.playerShipData.movementSpeed * _delta;
        }

        if(this.cursorKeys.down.isDown) {
            this.player.y += this.playerShipData.movementSpeed * _delta;
        }
        else if(this.cursorKeys.up.isDown) {
            this.player.y -= this.playerShipData.movementSpeed * _delta;
        }

        if(this.cursorKeys.space.isDown && _timestamp - this.lastShotTime > this.playerRateFire * 1000) {
            if(this.vies === 0) { return;}
            let bullet: Phaser.GameObjects.Image = this.add.image
            (this.player.x, this.player.y - this.player.displayHeight / 2, 'sprites', 'laserGreen10.png').setOrigin(0.5);
            this.bullets.add(bullet);
            let bulletBody: Phaser.Physics.Arcade.Body = bullet.body as Phaser.Physics.Arcade.Body;
            bulletBody.allowGravity = false;
            bulletBody.setFriction(0, 0);
            bulletBody.setVelocityY(-1024);

            this.sound.play('laser_Player');

            this.lastShotTime = _timestamp;
        }

        this.bullets.getChildren().forEach(bullet => {
            if((bullet as Phaser.GameObjects.Rectangle).y < -(bullet as Phaser.GameObjects.Rectangle).displayHeight) {
                bullet.destroy();
            }
        });

        this.enemies.getChildren().forEach(enemy => {
            if((enemy as Phaser.GameObjects.Rectangle).y >= this.cameras.main.height + (enemy as Phaser.GameObjects.Arc).displayHeight) {
                enemy.destroy();
            }
        });

        this.enemies_bullets.getChildren().forEach(enemy_bullet => {
            if((enemy_bullet as Phaser.GameObjects.Rectangle).y >= this.cameras.main.height + (enemy_bullet as Phaser.GameObjects.Arc).displayHeight) {
                enemy_bullet.destroy();
            }
        });

        this.player.x = Phaser.Math.Clamp(this.player.x, this.player.displayWidth / 2, this.cameras.main.width - this.player.displayWidth/2)
        this.player.y = Phaser.Math.Clamp(this.player.y, this.player.displayHeight / 2, this.cameras.main.height - this.player.displayHeight/2)

        // this.playerCenter.setPosition(this.player.x, this.player.y);
    }
}
