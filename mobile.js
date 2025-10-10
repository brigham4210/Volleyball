// Mobile Volleyball Formation App with Rotation System
class MobileVolleyballApp {
  constructor() {
    this.players = [
      { id: 1, position: 'o1', label: 'O1', x: 20, y: 55, name: 'Outside Hitter 1', rotationPosition: 1 },
      { id: 2, position: 'o2', label: 'O2', x: 80, y: 30, name: 'Outside Hitter 2', rotationPosition: 6 },
      { id: 3, position: 'm1', label: 'M1', x: 50, y: 55, name: 'Middle Blocker 1', rotationPosition: 2 },
      { id: 4, position: 'm2', label: 'M2', x: 50, y: 30, name: 'Middle Blocker 2', rotationPosition: 5 },
      { id: 5, position: 's', label: 'S', x: 80, y: 55, name: 'Setter', rotationPosition: 3 },
      { id: 6, position: 'op', label: 'OP', x: 20, y: 30, name: 'Opposite', rotationPosition: 4 },
      { id: 7, position: 'l', label: 'L', x: 15, y: 90, name: 'Libero', rotationPosition: 0 }
    ];
    
    this.initialPlayers = JSON.parse(JSON.stringify(this.players));
    this.currentRotation = 1;
    this.draggedPlayer = null;
    this.dragOffset = { x: 0, y: 0 };
    this.courtRect = null;
    
    // Standard volleyball rotation positions (percentage-based for mobile)
    this.rotationPositions = {
      1: { x: 20, y: 55 }, // Back left (position 1) - O1
      2: { x: 50, y: 55 }, // Back middle (position 2) - M1
      3: { x: 80, y: 55 }, // Back right (position 3) - S
      4: { x: 20, y: 30 }, // Front left (position 4) - OP
      5: { x: 50, y: 30 }, // Front middle (position 5) - M2
      6: { x: 80, y: 30 }  // Front right (position 6) - O2
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderPlayers();
    this.setupPWA();
    this.updateCourtRect();
  }

  setupEventListeners() {
    // Header buttons
    document.getElementById('menuBtn').addEventListener('click', () => this.toggleMenu());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetPositions());

    // Toolbar buttons
    document.getElementById('nextRotationBtn').addEventListener('click', () => this.nextRotation());
    document.getElementById('editLabelsBtn').addEventListener('click', () => this.openLabelModal());
    document.getElementById('saveBtn').addEventListener('click', () => this.saveFormation());
    document.getElementById('loadBtn').addEventListener('click', () => this.loadFormation());

    // Menu
    document.getElementById('closeMeuBtn').addEventListener('click', () => this.closeMenu());
    document.getElementById('resetRotationBtn').addEventListener('click', () => this.resetRotation());

    // Modal events
    document.getElementById('saveLabelBtn').addEventListener('click', () => this.saveLabels());
    document.getElementById('cancelLabelBtn').addEventListener('click', () => this.closeLabelModal());
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
      });
    });

    // Court touch events
    const court = document.getElementById('court');
    court.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    court.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    court.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    
    // Mouse events for desktop testing
    court.addEventListener('mousedown', this.handleMouseDown.bind(this));
    court.addEventListener('mousemove', this.handleMouseMove.bind(this));
    court.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('sideMenu');
      const menuBtn = document.getElementById('menuBtn');
      if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== menuBtn) {
        this.closeMenu();
      }
    });

    // Close modals when clicking backdrop
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });

    // Prevent zoom on double tap
    document.addEventListener('touchend', (e) => {
      if (e.target.closest('.player')) {
        e.preventDefault();
      }
    });

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateCourtRect(), 100);
    });

    // Handle resize
    window.addEventListener('resize', () => this.updateCourtRect());
  }

  updateCourtRect() {
    const court = document.getElementById('court');
    this.courtRect = court.getBoundingClientRect();
  }

  renderPlayers() {
    const court = document.getElementById('court');
    
    // Remove existing players
    court.querySelectorAll('.player').forEach(el => el.remove());
    
    // Add players
    this.players.forEach(player => {
      const playerEl = document.createElement('div');
      playerEl.className = `player ${player.position}`;
      
      playerEl.style.left = `${player.x}%`;
      playerEl.style.top = `${player.y}%`;
      playerEl.textContent = player.label;
      playerEl.setAttribute('data-id', player.id);
      playerEl.title = player.name;
      
      // Double-tap to edit label
      let tapCount = 0;
      playerEl.addEventListener('touchend', (e) => {
        tapCount++;
        if (tapCount === 1) {
          setTimeout(() => {
            if (tapCount === 2) {
              this.editPlayerLabel(player.id);
            }
            tapCount = 0;
          }, 300);
        }
        e.preventDefault();
      });
      
      court.appendChild(playerEl);
    });
    
    // Update rotation info
    this.updateRotationInfo();
  }

  updateRotationInfo() {
    document.getElementById('rotationInfo').textContent = `Rotation: ${this.currentRotation}/6`;
  }

  nextRotation() {
    // Rotate all players according to your specific pattern (except libero)
    this.players.forEach(player => {
      if (player.rotationPosition > 0) { // Skip libero (position 0)
        // Custom rotation mapping: 1→4, 2→1, 3→2, 4→5, 5→6, 6→3
        switch(player.rotationPosition) {
          case 1: player.rotationPosition = 4; break; // Back left → Front left
          case 2: player.rotationPosition = 1; break; // Back middle → Back left
          case 3: player.rotationPosition = 2; break; // Back right → Back middle
          case 4: player.rotationPosition = 5; break; // Front left → Front middle
          case 5: player.rotationPosition = 6; break; // Front middle → Front right
          case 6: player.rotationPosition = 3; break; // Front right → Back right
        }
        
        // Update position on court based on rotation
        const newPos = this.rotationPositions[player.rotationPosition];
        player.x = newPos.x;
        player.y = newPos.y;
      }
      // Libero stays at original position (x: 15, y: 90) - off court
    });
    
    // Update rotation count
    this.currentRotation = this.currentRotation === 6 ? 1 : this.currentRotation + 1;
    
    this.renderPlayers();
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Show brief notification
    this.showToast(`Rotation ${this.currentRotation}`);
  }

  resetRotation() {
    // Reset to starting rotation (Rotation 1)
    this.players = JSON.parse(JSON.stringify(this.initialPlayers));
    this.currentRotation = 1;
    this.renderPlayers();
    this.updateRotationInfo();
    this.showToast('Reset to starting rotation');
  }

  // Touch event handlers
  handleTouchStart(e) {
    const playerEl = e.target.closest('.player');
    if (!playerEl) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const playerId = parseInt(playerEl.getAttribute('data-id'));
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;
    
    this.draggedPlayer = player;
    this.updateCourtRect();
    
    const playerRect = playerEl.getBoundingClientRect();
    this.dragOffset = {
      x: touch.clientX - playerRect.left - playerRect.width / 2,
      y: touch.clientY - playerRect.top - playerRect.height / 2
    };
    
    playerEl.classList.add('dragging');
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  handleTouchMove(e) {
    if (!this.draggedPlayer) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    this.updatePlayerPosition(touch.clientX, touch.clientY);
  }

  handleTouchEnd(e) {
    if (!this.draggedPlayer) return;
    e.preventDefault();
    
    this.draggedPlayer = null;
    this.renderPlayers();
  }

  // Mouse event handlers (for desktop testing)
  handleMouseDown(e) {
    const playerEl = e.target.closest('.player');
    if (!playerEl) return;
    
    const playerId = parseInt(playerEl.getAttribute('data-id'));
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;
    
    this.draggedPlayer = player;
    this.updateCourtRect();
    
    const playerRect = playerEl.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - playerRect.left - playerRect.width / 2,
      y: e.clientY - playerRect.top - playerRect.height / 2
    };
    
    playerEl.classList.add('dragging');
  }

  handleMouseMove(e) {
    if (!this.draggedPlayer) return;
    this.updatePlayerPosition(e.clientX, e.clientY);
  }

  handleMouseUp() {
    if (!this.draggedPlayer) return;
    this.draggedPlayer = null;
    this.renderPlayers();
  }

  updatePlayerPosition(clientX, clientY) {
    if (!this.draggedPlayer || !this.courtRect) return;
    
    // Convert to percentage within court
    let x = ((clientX - this.courtRect.left - this.dragOffset.x) / this.courtRect.width) * 100;
    let y = ((clientY - this.courtRect.top - this.dragOffset.y) / this.courtRect.height) * 100;
    
    // Constrain to court bounds with some overflow
    x = Math.max(-10, Math.min(110, x));
    y = Math.max(-10, Math.min(110, y));
    
    this.draggedPlayer.x = x;
    this.draggedPlayer.y = y;
    
    this.renderPlayers();
    
    // Maintain dragging state
    const court = document.getElementById('court');
    const playerEl = court.querySelector(`[data-id="${this.draggedPlayer.id}"]`);
    if (playerEl) {
      playerEl.classList.add('dragging');
    }
  }

  // Menu functions
  toggleMenu() {
    const menu = document.getElementById('sideMenu');
    menu.classList.toggle('open');
  }

  closeMenu() {
    document.getElementById('sideMenu').classList.remove('open');
  }

  // Formation functions
  resetPositions() {
    // Reset positions for current rotation only (if players were dragged)
    this.players.forEach(player => {
      if (player.rotationPosition > 0) { // Skip libero
        const correctPos = this.rotationPositions[player.rotationPosition];
        player.x = correctPos.x;
        player.y = correctPos.y;
      } else {
        // Reset libero to off-court position
        player.x = 15;
        player.y = 90;
      }
    });
    this.renderPlayers();
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    this.showToast('Positions reset to current rotation');
  }

  openLabelModal() {
    // Populate current labels
    this.players.forEach(player => {
      const input = document.getElementById(`label-${player.position}`);
      if (input) {
        input.value = player.label;
      }
    });
    
    document.getElementById('labelModal').style.display = 'block';
  }

  closeLabelModal() {
    document.getElementById('labelModal').style.display = 'none';
  }

  saveLabels() {
    this.players.forEach(player => {
      const input = document.getElementById(`label-${player.position}`);
      if (input && input.value.trim()) {
        player.label = input.value.trim();
      }
    });
    
    this.renderPlayers();
    this.closeLabelModal();
    this.showToast('Labels updated');
  }

  editPlayerLabel(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;
    
    const newLabel = prompt(`Enter new label for ${player.name}:`, player.label);
    if (newLabel !== null && newLabel.trim()) {
      player.label = newLabel.trim().substring(0, 4);
      this.renderPlayers();
    }
  }

  saveFormation() {
    const formationData = {
      players: this.players,
      currentRotation: this.currentRotation,
      currentServer: this.currentServer,
      timestamp: new Date().toISOString(),
      name: prompt('Enter formation name:', 'My Formation') || 'Unnamed Formation'
    };
    
    try {
      const formations = JSON.parse(localStorage.getItem('volleyballFormations') || '[]');
      formations.push(formationData);
      localStorage.setItem('volleyballFormations', JSON.stringify(formations));
      
      // Show success message
      this.showToast('Formation saved successfully!');
    } catch (error) {
      console.error('Error saving formation:', error);
      this.showToast('Error saving formation');
    }
  }

  loadFormation() {
    try {
      const formations = JSON.parse(localStorage.getItem('volleyballFormations') || '[]');
      
      if (formations.length === 0) {
        this.showToast('No saved formations found');
        return;
      }
      
      // For mobile, use a simple selection
      const formationNames = formations.map((f, i) => `${i + 1}. ${f.name}`);
      const selection = prompt(`Select formation:\n\n${formationNames.join('\n')}\n\nEnter number:`);
      
      const index = parseInt(selection) - 1;
      if (index >= 0 && index < formations.length) {
        const formation = formations[index];
        this.players = JSON.parse(JSON.stringify(formation.players));
        this.currentRotation = formation.currentRotation || 1;
        this.currentServer = formation.currentServer || 6;
        this.renderPlayers();
        this.showToast('Formation loaded!');
      } else {
        this.showToast('Invalid selection');
      }
    } catch (error) {
      console.error('Error loading formation:', error);
      this.showToast('Error loading formation');
    }
  }

  showToast(message) {
    // Simple toast notification
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 120px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 20px;
      font-size: 0.9rem;
      z-index: 1000;
      animation: fadeInOut 2s ease forwards;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 2000);
  }

  setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Handle install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install prompt
      const installPrompt = document.getElementById('installPrompt');
      installPrompt.style.display = 'block';
      
      document.getElementById('installBtn').addEventListener('click', () => {
        installPrompt.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
        });
      });
      
      document.getElementById('dismissBtn').addEventListener('click', () => {
        installPrompt.style.display = 'none';
      });
    });

    // Handle app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      document.getElementById('installPrompt').style.display = 'none';
    });
  }
}

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    20% { opacity: 1; transform: translateX(-50%) translateY(0); }
    80% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
`;
document.head.appendChild(style);

// Initialize the mobile app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MobileVolleyballApp();
});