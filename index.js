const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')
const bigHighScoreEl = document.querySelector("#bigHighScoreEl")
const highScoreEl = document.querySelector("#highScoreEl")
const startGameAudio = new Audio('./audio/startGame.mp3')
const endGameAudio = new Audio('./audio/endGame.mp3')
const shootAudio = new Audio('./audio/shoot.mp3')
const enemyHitAudio = new Audio('./audio/enemyHit.mp3')
const enemyEliminatedAudio = new Audio('./audio/enemyEliminated.mp3')
const obtainPowerUpAudio = new Audio('./audio/obtainPowerUp.mp3')
const backgroundMusicAudio = new Audio('./audio/musicccc.mp3')
backgroundMusicAudio.loop = true

let icb = document.getElementById("ic")
let gq = "Medium"
let settings = document.getElementById("settingsBtn")
let l = document.getElementById("low")
let m = document.getElementById("medium")
let h = document.getElementById("high")
let mc = document.getElementById("m")
let sfx = document.getElementById("sfx")

const scene = {
  active: false
}

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = {
      x: 0,
      y: 0
    }
    this.friction = 0.99
    this.powerUp = ''
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.velocity.x *= this.friction
    this.velocity.y *= this.friction

    if (
      this.x - this.radius + this.velocity.x > 0 &&
      this.x + this.radius + this.velocity.x < canvas.width
    ) {
      this.x = this.x + this.velocity.x
    } else {
      this.velocity.x = 0
    }

    if (
      this.y - this.radius + this.velocity.y > 0 &&
      this.y + this.radius + this.velocity.y < canvas.height
    ) {
      this.y = this.y + this.velocity.y
    } else {
      this.velocity.y = 0
    }
  }

  shoot(mouse, color = 'white') {
    const angle = Math.atan2(mouse.y - this.y, mouse.x - this.x)
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(this.x, this.y, 5, color, velocity))
    if (sfx.checked) {
      shootAudio.cloneNode().play()
    }
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const powerUpImg = new Image()
powerUpImg.src = './img/lightning.png'

class PowerUp {
  constructor(x, y, velocity) {
    this.x = x
    this.y = y
    this.velocity = velocity
    this.width = 14
    this.height = 18
    this.radians = 0
  }

  draw() {
    c.save()
    c.translate(this.x + this.width / 2, this.y + this.height / 2)
    c.rotate(this.radians)
    c.translate(-this.x - this.width / 2, -this.y - this.height / 2)
    c.drawImage(powerUpImg, this.x, this.y, 14, 18)
    c.restore()
  }

  update() {
    this.radians += 0.002
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.type = 'linear'
    this.center = {
      x,
      y
    }
    this.radians = 0

    if (Math.random() < 0.25) {
      this.type = 'homing'

      if (Math.random() < 0.5) {
        this.type = 'spinning'

        if (Math.random() < 0.75) {
          this.type = 'homingSpinning'
        }
      }
    }
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()

    if (this.type === 'linear') {
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
    } else if (this.type === 'homing') {
      const angle = Math.atan2(player.y - this.y, player.x - this.x)

      this.velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }

      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
    } else if (this.type === 'spinning') {
      this.radians += 0.05
      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 100
      this.y = this.center.y + Math.sin(this.radians) * 100
    } else if (this.type === 'homingSpinning') {
      const angle = Math.atan2(player.y - this.y, player.x - this.x)

      this.velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }

      this.radians += 0.05
      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 100
      this.y = this.center.y + Math.sin(this.radians) * 100
    }

    // linear travel
    // this.x = this.x + this.velocity.x
    // this.y = this.y + this.velocity.y
  }
}

const friction = 0.99
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

class BackgroundParticle {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.alpha = 0.05
    this.initialAlpha = this.alpha
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update() {
    this.draw()
    // this.alpha -= 0.01
  }
}

let player
let powerUps = []
let projectiles = []
let enemies = []
let particles = []
let backgroundParticles = []

function init() {
  const x = canvas.width / 2
  const y = canvas.height / 2
  player = new Player(x, y, 10, 'white')
  powerUps = []
  projectiles = []
  enemies = []
  particles = []
  backgroundParticles = []

  if(m.selected) {
    for (let x = 0; x < canvas.width; x += 30) {
      for (let y = 0; y < canvas.height; y += 30) {
        backgroundParticles.push(new BackgroundParticle(x, y, 3, 'blue'))
      }
    }
  } else if (h.selected) {
    for (let x = 0; x < canvas.width; x += 30) {
      for (let y = 0; y < canvas.height; y += 30) {
        backgroundParticles.push(new BackgroundParticle(x, y, 3, 'blue'))
      }
    }
  }
}

function spawnEnemies() {
  const radius = Math.random() * (30 - 4) + 4

  let x
  let y

  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
    y = Math.random() * canvas.height
  } else {
    x = Math.random() * canvas.width
    y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
  }

  const color = `hsl(${Math.random() * 360}, 50%, 50%)`

  const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  }

  enemies.push(new Enemy(x, y, radius, color, velocity))
}

function spawnPowerUps() {
  let x
  let y

  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? 0 - 7 : canvas.width + 7
    y = Math.random() * canvas.height
  } else {
    x = Math.random() * canvas.width
    y = Math.random() < 0.5 ? 0 - 9 : canvas.height + 9
  }

  const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  }

  powerUps.push(new PowerUp(x, y, velocity))
}

function createScoreLabel(obj, val) {
  const scoreLabel = document.createElement('label')
  scoreLabel.innerHTML = val
  scoreLabel.style.position = 'absolute'
  scoreLabel.style.color = 'white'
  scoreLabel.style.userSelect = 'none'
  scoreLabel.style.left = obj.x
  scoreLabel.style.top = obj.y
  document.body.appendChild(scoreLabel)

  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => {
      scoreLabel.parentNode.removeChild(scoreLabel)
    }
  })
}

let animationId
let score = 0
let frame = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  frame++
  if (h.selected) {
    c.fillStyle = 'rgb(0, 0, 0, 0.1)'
  } else {
    c.fillStyle = 'black'
  }
  c.fillRect(0, 0, canvas.width, canvas.height)
  
  if (frame % 70 === 0) spawnEnemies()
  if (frame % 300 === 0) spawnPowerUps()

  backgroundParticles.forEach((backgroundParticle) => {
    const dist = Math.hypot(
      player.x - backgroundParticle.x,
      player.y - backgroundParticle.y
    )

    const hideRadius = 100
    if (dist < hideRadius) {
      if (dist < 70) {
        backgroundParticle.alpha = 0
      } else {
        backgroundParticle.alpha = 0.5
      }
    } else if (
      dist >= hideRadius &&
      backgroundParticle.alpha < backgroundParticle.initialAlpha
    ) {
      backgroundParticle.alpha += 0.01
    } else if (
      dist >= hideRadius &&
      backgroundParticle.alpha > backgroundParticle.initialAlpha
    ) {
      backgroundParticle.alpha -= 0.01
    }

    backgroundParticle.update()
  })

  player.update()
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  })

  if (player.powerUp === 'Automatic' && mouse.down) {
    if (frame % 4 === 0) {
      player.shoot(mouse, '#FFF500')
    }
  }

  powerUps.forEach((powerUp, index) => {
    const dist = Math.hypot(player.x - powerUp.x, player.y - powerUp.y)

    // obtain power up

    if (dist - player.radius - powerUp.width / 2 < 1) {
      let p = (Math.floor(Math.random() * 2) == 0)
      
      if (p) {
        createScoreLabel(player, 'Obtained Automatic Power!')
        player.powerUp = 'Automatic'
        player.color = 'yellow'
        powerUps.splice(index, 1)
  
        if (sfx.checked) {
          obtainPowerUpAudio.cloneNode().play()
        }
  
        setTimeout(() => {
          player.powerUp = null
          player.color = '#FFFFFF'
        }, 5000)
      } else {
        createScoreLabel(player, 'Obtained One Shot Power!')
        player.color = 'red'
        player.powerUp = 'One Shot'
        powerUps.splice(index, 1)
  
        if (sfx.checked) {
          obtainPowerUpAudio.cloneNode().play()
        }
  
        setTimeout(() => {
          player.powerUp = null
          player.color = '#FFFFFF'
        }, 5000)
      }
    } else {
      powerUp.update()
    }
  })

  projectiles.forEach((projectile, index) => {
    projectile.update()

    // remove from edges of screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1)
      }, 0)
    }
  })

  enemies.slice().forEach((enemy, index) => {
    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    // end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
      modalEl.style.display = 'flex'
      bigScoreEl.innerHTML = score
      if (sfx.checked) {
        endGameAudio.cloneNode().play()
      }
      scene.active = false

      gsap.to('#whiteModalEl', {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: 'expo'
      })
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // hit enemy
      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 0.03) {
        // create explosions

        if (h.selected) {
          for (let i = 0; i < enemy.radius * 2; i++) {
            particles.push(
              new Particle(
                projectile.x,
                projectile.y,
                Math.random() * 2,
                enemy.color,
                {
                  x: (Math.random() - 0.5) * (Math.random() * 6),
                  y: (Math.random() - 0.5) * (Math.random() * 6)
                }
              )
            )
          }
        }

        // shrink enemy
        if (enemy.radius - 10 > 5 && player.powerUp != 'One Shot') {
          if (sfx.checked) {
            enemyHitAudio.cloneNode().play()
          }

          // increase our score
          score += 100
          scoreEl.innerHTML = score
          createScoreLabel(projectile, 100)
          
          checkCookie()
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1)
          }, 0)
        } else {
          // eliminate enemy
          if (sfx.checked) {
            enemyEliminatedAudio.cloneNode().play()
          }

          // remove from scene altogether
          score += 250
          scoreEl.innerHTML = score
          createScoreLabel(projectile, 250)
          
          checkCookie()
          // change backgroundParticle colors
          backgroundParticles.forEach((backgroundParticle) => {
            backgroundParticle.color = enemy.color
            gsap.to(backgroundParticle, {
              alpha: 0.5,
              duration: 0.015,
              onComplete: () => {
                gsap.to(backgroundParticle, {
                  alpha: backgroundParticle.initialAlpha,
                  duration: 0.03
                })
              }
            })
          })

          setTimeout(() => {
            const enemyFound = enemies.find((enemyValue) => {
              return enemyValue === enemy
            })

            if (enemyFound) {
              enemies.splice(index, 1)
              projectiles.splice(projectileIndex, 1)
            } else if (player.powerUp === 'One Shot') {
              enemies.splice(index, 1)
              projectiles.splice(projectileIndex, 1)
            }
          }, 0)
        }
      }
    })
  })
}

const mouse = {
  down: false,
  x: undefined,
  y: undefined
}

addEventListener('mousedown', ({ clientX, clientY }) => {
  mouse.x = clientX
  mouse.y = clientY

  mouse.down = true
})

addEventListener('mousemove', ({ clientX, clientY }) => {
  mouse.x = clientX
  mouse.y = clientY
})

addEventListener('mouseup', () => {
  mouse.down = false
})

addEventListener('touchstart', (event) => {
  mouse.x = event.touches[0].clientX
  mouse.y = event.touches[0].clientY

  mouse.down = true
})

addEventListener('touchmove', (event) => {
  mouse.x = event.touches[0].clientX
  mouse.y = event.touches[0].clientY
})

addEventListener('touchend', () => {
  mouse.down = false
})

addEventListener('click', ({ clientX, clientY }) => {
  if (scene.active && player.powerUp !== 'Automatic') {
    mouse.x = clientX
    mouse.y = clientY

    if (player.powerUp === 'One Shot') {
      player.shoot(mouse, 'red')
    } else {
      player.shoot(mouse)
    }
  }
})

addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight

  init()
})

startGameBtn.addEventListener('click', () => {
  init()
  animate()
  if (sfx.checked) {
    startGameAudio.cloneNode().play()
  }
  scene.active = true

  score = 0
  scoreEl.innerHTML = score
  bigScoreEl.innerHTML = score
  if (mc.checked) {
    backgroundMusicAudio.play()
  }

  gsap.to('#whiteModalEl', {
    opacity: 0,
    scale: 0.75,
    duration: 0.25,
    ease: 'expo.in',
    onComplete: () => {
      modalEl.style.display = 'none'
    }
  })
})

settings.addEventListener('click', () => {
  let settingsModalEl = document.getElementById("settingsModalEl")
  gsap.to('#whiteModalEl', {
    opacity: 0,
    scale: 0.75,
    duration: 0.25,
    ease: 'expo.in',
    onComplete: () => {
      modalEl.style.display = 'none'
    }
  })
  settingsModalEl.style.display = "flex"
  gsap.to('#settingsWhiteModalEl', {
    opacity: 1,
    scale: 1,
    duration: 0.45,
    ease: 'expo'
  })
})

addEventListener('keydown', ({ keyCode }) => {
  if (icb.checked == false) {
    if (keyCode === 87) {
      player.velocity.y -= 1
    } else if (keyCode === 65) {
      player.velocity.x -= 1
    } else if (keyCode === 83) {
      player.velocity.y += 1
    } else if (keyCode === 68) {
      player.velocity.x += 1
    }
  
    switch (keyCode) {
      case 37:
        player.velocity.x -= 1
        break
  
      case 40:
        player.velocity.y += 1
        break
  
      case 39:
        player.velocity.x += 1
        break
  
      case 38:
        player.velocity.y -= 1
        break
    }
  } else if (icb.checked == true) {
    if (keyCode === 87) {
      player.velocity.y += 1
    } else if (keyCode === 65) {
      player.velocity.x += 1
    } else if (keyCode === 83) {
      player.velocity.y -= 1
    } else if (keyCode === 68) {
      player.velocity.x -= 1
    }
  
    switch (keyCode) {
      case 37:
        player.velocity.x += 1
        break
  
      case 40:
        player.velocity.y -= 1
        break
  
      case 39:
        player.velocity.x -= 1
        break
  
      case 38:
        player.velocity.y += 1
        break
    }
  }
})

function setCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i < ca.length; i++) {
	  let c = ca[i];
	  while (c.charAt(0) == ' ') {
		c = c.substring(1);
	  }
	  if (c.indexOf(name) == 0) {
		return c.substring(name.length, c.length);
	  }
	}
	return "";
  }

  function checkCookie() {
      let highscore = getCookie("highscore")
      if (highscore != "") {
        if (score > highscore) {
          setCookie("highscore", score, 60)
        } 
        highScoreEl.innerHTML = getCookie("highscore")
        bigHighScoreEl.innerHTML = getCookie("highscore")
      } else {
        setCookie("highscore", 0, 60)
        highScoreEl.innerHTML = 0
        bigHighScoreEl.innerHTML = 0
      }
  }

function changeSettings() {

gsap.to('#whiteModalEl', {
    opacity: 0,
    scale: 0.75,
    duration: 0.25,
    ease: 'expo.in',
    onComplete: () => {
      settingsModalEl.style.display = 'none'
    }
  })

  modalEl.style.display = "flex"
  gsap.to('#whiteModalEl', {
    opacity: 1,
    scale: 1,
    duration: 0.45,
    ease: 'expo'
  })

}
