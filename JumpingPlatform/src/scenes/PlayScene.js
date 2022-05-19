import BaseScene from './BaseScene';
const PLATFORM_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene', config);

    this.dude = null;
    this.bird = null;
    this.platform = null;
    this.isPaused = false;
    this.cursors = null;
    this.left = false;

    this.scoreText = '';
    this.overText = '';
    this.menu = [
      { scene: 'PlayScene', text: 'Replay' },
      { scene: null, text: 'Exit' },
    ];
  }

  create() {
    super.create();
    this.createDude();
    this.createPlatform();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();
    this.score = 0;

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude_left', {
        start: 2,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'left_halt',
      frames: [{ key: 'dude_left', frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: 'right_halt',
      frames: [{ key: 'dude_right', frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: 'left_burn',
      frames: [{ key: 'dude_left', frame: 29 }],
      frameRate: 20,
    });
    this.anims.create({
      key: 'right_burn',
      frames: [{ key: 'dude_right', frame: 34 }],
      frameRate: 20,
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude_right', {
        start: 0,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  update() {
    this.checkGameStatus();
    this.recyclePlatform();
    this.cursors = this.input.keyboard.createCursorKeys();
    if (this.cursors.left.isDown) {
      this.left = true;
      this.dude.setVelocityX(-400);

      this.dude.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.left = false;
      this.dude.setVelocityX(400);

      this.dude.anims.play('right', true);
    } else {
      this.dude.setVelocityX(0);
      if (this.left) {
        this.dude.anims.play('left_halt');
      } else {
        this.dude.anims.play('right_halt');
      }
    }

    if (this.cursors.up.isDown && this.dude.body.touching.down) {
      this.dude.setVelocityY(-300);
    }
    if (
      this.dude.getBounds().bottom >= this.config.height ||
      this.dude.y <= 0
    ) {
      if (this.left) {
        this.dude.anims.play('left_burn');
      } else {
        this.dude.anims.play('right_burn');
      }
    }
  }

  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }

    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add
        .text(
          ...this.screenCenter,
          'Ready? ' + this.initialTime,
          this.fontOptions
        )
        .setOrigin(0.5);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText('Ready? ' + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText('');
      this.physics.resume();
      this.timedEvent.remove();
    }
  }

  createBG() {
    this.add.image(0, 0, 'sky').setOrigin(0);
  }
  createDude() {
    this.dude = this.physics.add
      .sprite(100, 450, 'dude_right')
      .setScale(1.5)
      .setBounce(0.2)
      .setCollideWorldBounds(true);
    this.dude.body.gravity.y = 300;
    this.dude.setBodySize(this.dude.width, this.dude.height - 10);
  }

  createPlatform() {
    this.platform = this.physics.add.group();
    const platform1 = this.platform
      .create(600, 400, 'platform')
      .setImmovable(true);
    const platform2 = this.platform
      .create(80, 250, 'platform')
      .setImmovable(true);
    const platform3 = this.platform
      .create(620, 160, 'platform')
      .setImmovable(true);
    const platform4 = this.platform
      .create(320, 10, 'platform')
      .setImmovable(true)
      .setScale(0.7);
    const platform5 = this.platform
      .create(55, 530, 'platform')
      .setImmovable(true);
    this.platform.setVelocityY(25);
  }

  createColliders() {
    this.physics.add.collider(this.dude, this.platform);
  }

  createScore() {
    const bestScore = localStorage.getItem('bestScore');

    this.scoreText = this.add.text(16, 16, `Score: ${0}`, {
      fontSize: '32px',
      fill: '#fff',
    });
    this.add.text(16, 52, `Best score: ${bestScore || 0}`, {
      fontSize: '18px',
      fill: '#fff',
    });
  }

  createPause() {
    this.isPaused = false;
    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, 'pause')
      .setInteractive()
      .setScale(3)
      .setOrigin(1);

    pauseButton.on('pointerdown', () => {
      this.isPaused = true;
      this.physics.pause();
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  handleInputs() {}

  checkGameStatus() {
    if (
      this.dude.getBounds().bottom >= this.config.height ||
      this.dude.y <= 0
    ) {
      this.gameOver();
    }
  }

  placePlatform(platform) {
    platform.y = 0; //back to top
  }

  recyclePlatform() {
    const tempPlatform = [];
    this.platform.getChildren().forEach((platform) => {
      if (platform.getBounds().top >= 600) {
        tempPlatform.push(platform);
        if (tempPlatform.length === 1) {
          this.placePlatform(...tempPlatform);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score === 1) {
      this.platform.setVelocityY(45);
    }

    if (this.score === 4) {
      this.platform.setVelocityY(90);
    }
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore');
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score);
    }
  }

  gameOver() {
    this.physics.pause();
    this.saveBestScore();

    this.time.addEvent({
      delay: 1800,
      callback: () => {
        super.create();
        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
        this.add.text(
          this.config.width / 3,
          this.config.height / 4,
          `Your Score: ${this.score}`,
          {
            fontSize: '32px',
            fill: '#FFFFFF',
          }
        );
      },
      loop: false,
    });
  }
  setupMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    textGO.on('pointerover', () => {
      textGO.setStyle({ fill: '#ff0' });
    });

    textGO.on('pointerout', () => {
      textGO.setStyle({ fill: '#fff' });
    });

    textGO.on('pointerup', () => {
      this.scene.start(menuItem.scene);
    });
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

export default PlayScene;
