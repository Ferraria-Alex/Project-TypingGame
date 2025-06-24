// Vlaesyvia - Main Game Logic
class VlaesyviaGame {
    constructor() {
        this.currentHealth = 100;
        this.gold = 0;
        this.gameActive = false;
        this.currentLevel = 1;
        this.enemies = [];
        this.powerWords = [];
        this.activePowers = [];
        this.gameCanvas = null;
        this.backgroundImage = '';
        
        // Power definitions with their associated words and effects
        this.powers = [
            {
                name: 'FireBall',
                icon: 'img/icons/FireBall.png',
                words: ['FIRE', 'FLAME', 'BURN', 'BLAZE'],
                damage: 25,
                cooldown: 2000,
                lastUsed: 0,
                color: '#ff4444'
            },
            {
                name: 'RockShatter',
                icon: 'img/icons/RockShatter.png',
                words: ['ROCK', 'STONE', 'EARTH', 'CRUSH'],
                damage: 35,
                cooldown: 3000,
                lastUsed: 0,
                color: '#8B4513'
            },
            {
                name: 'GreenWall',
                icon: 'img/icons/GreenWall.png',
                words: ['SHIELD', 'WALL', 'GUARD', 'BLOCK'],
                damage: 0,
                heal: 15,
                cooldown: 4000,
                lastUsed: 0,
                color: '#44ff44'
            },
            {
                name: 'Entangle',
                icon: 'img/icons/Entangle.png',
                words: ['BIND', 'TRAP', 'HOLD', 'SNARE'],
                damage: 20,
                stun: 2000,
                cooldown: 3500,
                lastUsed: 0,
                color: '#228B22'
            }
        ];

        // Enemy types
        this.enemyTypes = [
            {
                name: 'Slime',
                health: 50,
                damage: 15,
                speed: 1.5,
                goldReward: 1,
                image: ['img/enemies/slime1.png', 'img/enemies/slime2.png', 'img/enemies/slime3.png']
            },
            {
                name: 'Orc',
                health: 80,
                damage: 20,
                speed: 1,
                goldReward: 2,
                color: '#654321'
            },
            {
                name: 'Dragon',
                health: 150,
                damage: 35,
                speed: 0.5,
                goldReward: 5,
                color: '#8B0000'
            }
        ];

        this.init();
    }

    init() {
        this.setupGameCanvas();
        this.setupEventListeners();
        this.setupPowerDisplay();
        this.updateUI();
        this.showStartButton();
    }

    setupGameCanvas() {
        this.gameCanvas = document.getElementById('game');
        if (this.gameCanvas) {
            this.gameCanvas.style.position = 'relative';
            this.gameCanvas.style.overflow = 'hidden';
        }
    }

    setupEventListeners() {
        const typeInput = document.getElementById('typeInput');
        if (typeInput) {
            typeInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleWordInput(typeInput.value.toUpperCase().trim());
                    typeInput.value = '';
                }
            });

            typeInput.addEventListener('input', (e) => {
                this.highlightMatchingPowers(e.target.value.toUpperCase());
            });
        }

        // Focus input when clicking on game area
        this.gameCanvas?.addEventListener('click', () => {
            typeInput?.focus();
        });
    }

    setupPowerDisplay() {
        const powerContainers = document.querySelectorAll('.power-container');
        
        powerContainers.forEach((container, index) => {
            if (index < this.powers.length) {
                const power = this.powers[index];
                const img = container.querySelector('img');
                const wordP = container.querySelector('.word');
                
                if (img && window.STATIC_URL) {
                    img.src = window.STATIC_URL + power.icon;
                    img.alt = power.name;
                }
                
                if (wordP) {
                    // Display one of the power words
                    wordP.textContent = power.words[0];
                    wordP.style.fontSize = '0.8rem';
                    wordP.style.fontWeight = 'bold';
                    wordP.style.color = '#333';
                    wordP.style.margin = '0.2rem';
                }
            }
        });
    }

    highlightMatchingPowers(inputText) {
        const powerContainers = document.querySelectorAll('.power-container');
        
        powerContainers.forEach((container, index) => {
            if (index < this.powers.length) {
                const power = this.powers[index];
                const isMatching = power.words.some(word => 
                    word.startsWith(inputText) && inputText.length > 0
                );
                
                if (isMatching) {
                    container.style.backgroundColor = power.color;
                    container.style.opacity = '0.8';
                } else {
                    container.style.backgroundColor = '';
                    container.style.opacity = '1';
                }
            }
        });
    }

    handleWordInput(word) {
        if (!this.gameActive || !word) return;

        // Find matching power
        const matchingPower = this.powers.find(power => 
            power.words.includes(word)
        );

        if (matchingPower) {
            this.castSpell(matchingPower);
        } else {
            this.showFloatingText('UNKNOWN SPELL!', '#ff4444', this.gameCanvas.offsetWidth / 2, 100);
        }

        // Clear highlighting
        this.highlightMatchingPowers('');
    }

    castSpell(power) {
        const now = Date.now();
        
        // Check cooldown
        if (now - power.lastUsed < power.cooldown) {
            this.showFloatingText('COOLDOWN!', '#ffaa44', this.gameCanvas.offsetWidth / 2, 150);
            return;
        }

        power.lastUsed = now;
        
        // Create spell effect
        this.createSpellEffect(power);
        
        // Apply spell effects
        if (power.damage > 0) {
            this.damageEnemies(power);
        }
        
        if (power.heal > 0) {
            this.healPlayer(power.heal);
        }
        
        if (power.stun > 0) {
            this.stunEnemies(power.stun);
        }

        this.showFloatingText(power.name.toUpperCase() + '!', power.color, 
                            this.gameCanvas.offsetWidth / 2, 50);
    }

    createSpellEffect(power) {
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.width = '100px';
        effect.style.height = '100px';
        effect.style.borderRadius = '50%';
        effect.style.backgroundColor = power.color;
        effect.style.opacity = '0.7';
        effect.style.left = Math.random() * (this.gameCanvas.offsetWidth - 100) + 'px';
        effect.style.top = Math.random() * (this.gameCanvas.offsetHeight - 100) + 'px';
        effect.style.transition = 'all 1s ease-out';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '10';

        this.gameCanvas.appendChild(effect);

        // Animate effect
        setTimeout(() => {
            effect.style.transform = 'scale(2)';
            effect.style.opacity = '0';
        }, 100);

        // Remove effect
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1100);
    }

    damageEnemies(power) {
        this.enemies.forEach(enemy => {
            if (!enemy.stunned) {
                enemy.health -= power.damage;
                this.showFloatingText(`-${power.damage}`, '#ff4444', 
                                    enemy.x + 25, enemy.y - 10);
                
                if (enemy.health <= 0) {
                    this.killEnemy(enemy);
                }
            }
        });
    }

    healPlayer(amount) {
        this.currentHealth = Math.min(100, this.currentHealth + amount);
        this.updateUI();
        this.showFloatingText(`+${amount} HP`, '#44ff44', 200, 100);
    }

    stunEnemies(duration) {
        this.enemies.forEach(enemy => {
            enemy.stunned = true;
            setTimeout(() => {
                enemy.stunned = false;
            }, duration);
        });
    }

    spawnEnemy() {
        if (this.enemies.length >= 5) return; // Max 5 enemies

        const enemyType = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
        const enemy = {
            ...enemyType,
            id: Date.now() + Math.random(),
            x: this.gameCanvas.offsetWidth,
            y: Math.random() * (this.gameCanvas.offsetHeight - 60) + 30,
            maxHealth: enemyType.health,
            stunned: false,
            lastAttack: 0
        };

        this.enemies.push(enemy);
        this.createEnemyElement(enemy);
    }

    createEnemyElement(enemy) {
        const enemyEl = document.createElement('div');
        enemyEl.style.position = 'absolute';
        enemyEl.style.width = '50px';
        enemyEl.style.height = '50px';
        enemyEl.style.backgroundImage = `url(${window.STATIC_URL + enemy.image[Math.random()*2]})`;
        enemyEl.style.left = enemy.x + 'px';
        enemyEl.style.top = enemy.y + 'px';
        enemyEl.style.transition = 'left 0.1s linear';
        enemyEl.style.display = 'flex';
        enemyEl.style.alignItems = 'center';
        enemyEl.style.justifyContent = 'center';
        enemyEl.style.fontSize = '10px';
        enemyEl.style.fontWeight = 'bold';
        enemyEl.textContent = enemy.name.charAt(0);

        // Health bar
        const healthBar = document.createElement('div');
        healthBar.style.position = 'absolute';
        healthBar.style.top = '-8px';
        healthBar.style.left = '0';
        healthBar.style.width = '100%';
        healthBar.style.height = '4px';
        healthBar.style.backgroundColor = '#ff4444';
        healthBar.style.border = '1px solid #000';

        const healthFill = document.createElement('div');
        healthFill.style.width = '100%';
        healthFill.style.height = '100%';
        healthFill.style.backgroundColor = '#44ff44';
        healthFill.style.transition = 'width 0.3s';

        healthBar.appendChild(healthFill);
        enemyEl.appendChild(healthBar);

        this.gameCanvas.appendChild(enemyEl);
    }

    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            if (!enemy.stunned) {
                enemy.x -= enemy.speed;
            }

            const enemyEl = document.getElementById(`enemy-${enemy.id}`);
            if (enemyEl) {
                enemyEl.style.left = enemy.x + 'px';
                
                // Update health bar
                const healthFill = enemyEl.querySelector('div div');
                if (healthFill) {
                    const healthPercent = (enemy.health / enemy.maxHealth) * 100;
                    healthFill.style.width = healthPercent + '%';
                }
            }

            // Check if enemy reached player
            if (enemy.x <= 0) {
                this.enemyAttackPlayer(enemy);
                this.removeEnemy(enemy, index);
            }
        });

        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
    }

    enemyAttackPlayer(enemy) {
        this.currentHealth -= enemy.damage;
        this.updateUI();
        this.showFloatingText(`-${enemy.damage} HP`, '#ff4444', 100, 100);
        
        if (this.currentHealth <= 0) {
            this.gameOver();
        }
    }

    killEnemy(enemy) {
        this.gold += enemy.goldReward;
        this.updateUI();
        this.showFloatingText(`+${enemy.goldReward} GOLD`, '#ffaa00', enemy.x + 25, enemy.y + 30);
        
        // Remove enemy element
        const enemyEl = document.getElementById(`enemy-${enemy.id}`);
        if (enemyEl) {
            enemyEl.remove();
        }
    }

    removeEnemy(enemy, index) {
        const enemyEl = document.getElementById(`enemy-${enemy.id}`);
        if (enemyEl) {
            enemyEl.remove();
        }
        this.enemies.splice(index, 1);
    }

    showFloatingText(text, color, x, y) {
        const textEl = document.createElement('div');
        textEl.textContent = text;
        textEl.style.position = 'absolute';
        textEl.style.left = x + 'px';
        textEl.style.top = y + 'px';
        textEl.style.color = color;
        textEl.style.fontSize = '1.2rem';
        textEl.style.fontWeight = 'bold';
        textEl.style.pointerEvents = 'none';
        textEl.style.zIndex = '20';
        textEl.style.transition = 'all 2s ease-out';
        
        this.gameCanvas.appendChild(textEl);
        
        setTimeout(() => {
            textEl.style.transform = 'translateY(-50px)';
            textEl.style.opacity = '0';
        }, 100);
        
        setTimeout(() => {
            if (textEl.parentNode) {
                textEl.parentNode.removeChild(textEl);
            }
        }, 2100);
    }

    showStartButton() {
        // Create start button
        const startButton = document.createElement('button');
        startButton.id = 'start-button';
        startButton.textContent = 'START GAME';
        startButton.style.position = 'absolute';
        startButton.style.top = '50%';
        startButton.style.left = '50%';
        startButton.style.transform = 'translate(-50%, -50%)';
        startButton.style.padding = '20px 40px';
        startButton.style.fontSize = '1.5rem';
        startButton.style.fontFamily = "'Upheaval TT', Impact, monospace";
        startButton.style.backgroundColor = '#FEFCFD';
        startButton.style.color = '#1E1E1E';
        startButton.style.border = '3px solid #1E1E1E';
        startButton.style.borderRadius = '0.5rem';
        startButton.style.cursor = 'pointer';
        startButton.style.zIndex = '30';
        startButton.style.transition = 'all 0.2s ease';

        // Hover effect
        startButton.addEventListener('mouseenter', () => {
            startButton.style.background = 'linear-gradient(145deg, rgba(158,43,37,1) 82%, rgba(203,161,53,1) 100%)';
            startButton.style.color = '#FEFCFD';
            startButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });

        startButton.addEventListener('mouseleave', () => {
            startButton.style.background = '#FEFCFD';
            startButton.style.color = '#1E1E1E';
            startButton.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // Start game on click
        startButton.addEventListener('click', () => {
            this.hideStartButton();
            this.startGame();
        });

        this.gameCanvas.appendChild(startButton);

        // Show game instructions
        this.showInstructions();
    }

    hideStartButton() {
        const startButton = document.getElementById('start-button');
        const instructions = document.getElementById('game-instructions');
        
        if (startButton) {
            startButton.remove();
        }
        if (instructions) {
            instructions.remove();
        }
    }

    showInstructions() {
        const instructions = document.createElement('div');
        instructions.id = 'game-instructions';
        instructions.innerHTML = `
            <h3>HOW TO PLAY:</h3>
            <p>• Type spell words and press ENTER to cast</p>
            <p>• Defeat enemies before they reach you</p>
            <p>• Earn gold by defeating enemies</p>
            <p>• Survive as long as possible!</p>
            <br>
            <p><strong>SPELL WORDS:</strong></p>
            <p>🔥 FIRE, FLAME, BURN, BLAZE</p>
            <p>🪨 ROCK, STONE, EARTH, CRUSH</p>
            <p>🛡️ SHIELD, WALL, GUARD, BLOCK</p>
            <p>🌿 BIND, TRAP, HOLD, SNARE</p>
        `;
        instructions.style.position = 'absolute';
        instructions.style.top = '10px';
        instructions.style.left = '10px';
        instructions.style.backgroundColor = 'rgba(254, 252, 253, 0.95)';
        instructions.style.padding = '15px';
        instructions.style.borderRadius = '0.5rem';
        instructions.style.border = '2px solid #1E1E1E';
        instructions.style.fontFamily = "'RobotoFlex', sans-serif";
        instructions.style.fontSize = '0.9rem';
        instructions.style.lineHeight = '1.3';
        instructions.style.maxWidth = '300px';
        instructions.style.zIndex = '25';

        // Style the heading
        const heading = instructions.querySelector('h3');
        if (heading) {
            heading.style.fontFamily = "'Upheaval TT', Impact, monospace";
            heading.style.color = 'rgba(158,43,37,1)';
            heading.style.margin = '0 0 10px 0';
            heading.style.fontSize = '1.1rem';
        }

        // Style paragraphs
        const paragraphs = instructions.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.margin = '5px 0';
            p.style.color = '#000'
        });

        this.gameCanvas.appendChild(instructions);
    }

    updateUI(){
        // Update health bar
        const healthEl = document.getElementById('health');
        if (healthEl) {
            healthEl.setAttribute('currentHealth', this.currentHealth.toString());
        }

        // Update gold
        const goldEl = document.getElementById('gold');
        if (goldEl) {
            goldEl.setAttribute('money', this.gold.toString().padStart(12, '0'));
        }
    }

    startGame() {
        const character = document.createElement('img');
        character.src = window.STATIC_URL + 'img/characters/Wizard.png';
        character.style.position = 'relative';
        character.style.top = '10.5rem',
        character.style.width = '8rem';
        this.gameCanvas.appendChild(character);

        this.gameCanvas.classList.remove('bg-white')
        this.gameCanvas.style.backgroundImage = `url(${window.STATIC_URL + 'img/gameplay/SpringBackground.png'})`;

        this.gameActive = true;
        this.gameLoop();
        
        // Spawn enemies periodically
        setInterval(() => {
            if (this.gameActive) {
                this.spawnEnemy();
            }
        }, 3000);

        // Focus on input
        const typeInput = document.getElementById('typeInput');
        if (typeInput) {
            typeInput.focus();
        }

        this.showFloatingText('GAME START!', '#44ff44', this.gameCanvas.offsetWidth / 2, 200);
    }

    gameLoop() {
        if (!this.gameActive) return;

        this.updateEnemies();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    gameOver() {
        this.gameActive = false;
        this.showFloatingText('GAME OVER!', '#ff4444', this.gameCanvas.offsetWidth / 2, this.gameCanvas.offsetHeight / 2);
        
        setTimeout(() => {
            if (confirm('Game Over! Your final score: ' + this.gold + ' gold. Play again?')) {
                this.resetGame();
            }
        }, 2000);
    }

    resetGame() {
        // Reset game state
        this.currentHealth = 100;
        this.gold = 0;
        this.enemies = [];
        this.currentLevel = 1;
        
        // Clear game canvas
        this.gameCanvas.innerHTML = '';
        this.gameCanvas.backgroundImage = '';
        this.gameCanvas.classList.add('bg-white');
        
        // Reset power cooldowns
        this.powers.forEach(power => {
            power.lastUsed = 0;
        });
        
        this.updateUI();
        this.showStartButton();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const game = new VlaesyviaGame();
    }, 500);
});