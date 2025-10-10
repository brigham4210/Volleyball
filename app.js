// Volleyball Formation App - Native App Logic

class VolleyballFormationApp {
  constructor() {
    this.players = [
      { id: 1, position: 'o1', label: 'O1', x: 100, y: 220, name: 'Outside Hitter 1', rotationPosition: 1 },
      { id: 2, position: 'o2', label: 'O2', x: 400, y: 120, name: 'Outside Hitter 2', rotationPosition: 6 },
      { id: 3, position: 'm1', label: 'M1', x: 250, y: 220, name: 'Middle Blocker 1', rotationPosition: 2 },
      { id: 4, position: 'm2', label: 'M2', x: 250, y: 120, name: 'Middle Blocker 2', rotationPosition: 5 },
      { id: 5, position: 's', label: 'S', x: 400, y: 220, name: 'Setter', rotationPosition: 3 },
      { id: 6, position: 'op', label: 'OP', x: 100, y: 120, name: 'Opposite', rotationPosition: 4 },
      { id: 7, position: 'l', label: 'L', x: 100, y: 350, name: 'Libero', rotationPosition: 0 }
    ];
    
    this.initialPlayers = JSON.parse(JSON.stringify(this.players));
    this.currentRotation = 1;
    this.draggedPlayer = null;
    this.dragOffset = { x: 0, y: 0 };
    
    // Standard volleyball rotation positions (clockwise from position 1)
    this.rotationPositions = {
      1: { x: 100, y: 220 }, // Back left (position 1) - O1
      2: { x: 250, y: 220 }, // Back middle (position 2) - M1
      3: { x: 400, y: 220 }, // Back right (position 3) - S
      4: { x: 100, y: 120 }, // Front left (position 4) - OP
      5: { x: 250, y: 120 }, // Front middle (position 5) - M2
      6: { x: 400, y: 120 }  // Front right (position 6) - O2
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderPlayers();
    this.setupElectronIPC();
  }

  setupEventListeners() {
    // Button event listeners
    document.getElementById('resetBtn').addEventListener('click', () => this.resetPositions());
    document.getElementById('editLabelsBtn').addEventListener('click', () => this.openLabelModal());
    document.getElementById('saveBtn').addEventListener('click', () => this.saveFormation());
    document.getElementById('loadBtn').addEventListener('click', () => this.loadFormation());
    document.getElementById('nextRotationBtn').addEventListener('click', () => this.nextRotation());
    document.getElementById('resetRotationBtn').addEventListener('click', () => this.resetRotation());

    // Modal event listeners
    document.getElementById('saveLabelBtn').addEventListener('click', () => this.saveLabels());
    document.getElementById('cancelLabelBtn').addEventListener('click', () => this.closeLabelModal());
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
      });
    });

    // Formation preset buttons - REMOVED
    // document.querySelectorAll('.formation-preset').forEach(btn => {
    //   btn.addEventListener('click', (e) => {
    //     this.loadPresetFormation(e.target.dataset.formation);
    //   });
    // });

    // Court drag and drop
    const court = document.getElementById('court');
    court.addEventListener('mousedown', this.handleMouseDown.bind(this));
    court.addEventListener('mousemove', this.handleMouseMove.bind(this));
    court.addEventListener('mouseup', this.handleMouseUp.bind(this));
    court.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Touch events for mobile
    court.addEventListener('touchstart', this.handleTouchStart.bind(this));
    court.addEventListener('touchmove', this.handleTouchMove.bind(this));
    court.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Prevent context menu on court
    court.addEventListener('contextmenu', (e) => e.preventDefault());

    // Click outside modal to close
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  }

  setupElectronIPC() {
    if (window.electronAPI) {
      window.electronAPI.onResetFormation(() => this.resetFormation());
      window.electronAPI.onSaveFormation(() => this.saveFormation());
      window.electronAPI.onLoadFormation(() => this.loadFormation());
      window.electronAPI.onEditLabels(() => this.openLabelModal());
      window.electronAPI.onResetPositions(() => this.resetPositions());
      window.electronAPI.onShowAbout(() => this.showAbout());
    }
  }

  renderPlayers() {
    const court = document.getElementById('court');
    
    // Remove existing players
    court.querySelectorAll('.player').forEach(el => el.remove());
    
    // Add players
    this.players.forEach(player => {
      const playerEl = document.createElement('div');
      playerEl.className = `player ${player.position}`;
      
      playerEl.style.left = `${player.x}px`;
      playerEl.style.top = `${player.y}px`;
      playerEl.textContent = player.label;
      playerEl.setAttribute('data-id', player.id);
      playerEl.title = player.name;
      
      // Double-click to edit label
      playerEl.addEventListener('dblclick', () => {
        this.editPlayerLabel(player.id);
      });
      
      court.appendChild(playerEl);
    });
    
    // Update rotation info
    this.updateRotationInfo();
  }

  updateRotationInfo() {
    document.getElementById('rotationCount').textContent = this.currentRotation;
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
      // Libero stays at original position (x: 100, y: 350) - off court
    });
    
    // Update rotation count
    this.currentRotation = this.currentRotation === 6 ? 1 : this.currentRotation + 1;
    
    this.renderPlayers();
  }

  resetRotation() {
    // Reset to initial positions with setter as server
    this.players = JSON.parse(JSON.stringify(this.initialPlayers));
    this.currentRotation = 1;
    this.currentServer = 5; // Setter
    this.renderPlayers();
  }

  handleMouseDown(e) {
    const playerEl = e.target.closest('.player');
    if (!playerEl) return;
    
    const playerId = parseInt(playerEl.getAttribute('data-id'));
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;
    
    this.draggedPlayer = player;
    const rect = playerEl.getBoundingClientRect();
    const courtRect = document.getElementById('court').getBoundingClientRect();
    
    this.dragOffset = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    };
    
    playerEl.classList.add('dragging');
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.draggedPlayer) return;
    
    const court = document.getElementById('court');
    const courtRect = court.getBoundingClientRect();
    
    let x = e.clientX - courtRect.left - this.dragOffset.x - 25; // 25 = half player width
    let y = e.clientY - courtRect.top - this.dragOffset.y - 25;  // 25 = half player height
    
    // Constrain to court bounds with some overflow
    x = Math.max(-30, Math.min(480, x));
    y = Math.max(-30, Math.min(430, y));
    
    this.draggedPlayer.x = x;
    this.draggedPlayer.y = y;
    
    this.renderPlayers();
    
    // Maintain dragging state
    const playerEl = court.querySelector(`[data-id="${this.draggedPlayer.id}"]`);
    if (playerEl) {
      playerEl.classList.add('dragging');
    }
  }

  handleMouseUp() {
    if (!this.draggedPlayer) return;
    
    this.draggedPlayer = null;
    document.body.style.cursor = '';
    this.renderPlayers();
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    const fakeEvent = { target: e.target, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() };
    this.handleMouseDown(fakeEvent);
  }

  handleTouchMove(e) {
    if (!this.draggedPlayer) return;
    e.preventDefault();
    const touch = e.touches[0];
    const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
    this.handleMouseMove(fakeEvent);
  }

  handleTouchEnd() {
    this.handleMouseUp();
  }

  resetPositions() {
    this.players = JSON.parse(JSON.stringify(this.initialPlayers));
    this.currentRotation = 1;
    this.renderPlayers();
  }

  resetFormation() {
    // Reset both positions and labels
    this.players = [
      { id: 1, position: 'o1', label: 'O1', x: 400, y: 120, name: 'Outside Hitter 1', rotationPosition: 3 },
      { id: 2, position: 'o2', label: 'O2', x: 100, y: 220, name: 'Outside Hitter 2', rotationPosition: 4 },
      { id: 3, position: 'm1', label: 'M1', x: 250, y: 120, name: 'Middle Blocker 1', rotationPosition: 2 },
      { id: 4, position: 'm2', label: 'M2', x: 250, y: 220, name: 'Middle Blocker 2', rotationPosition: 5 },
      { id: 5, position: 's', label: 'S', x: 400, y: 220, name: 'Setter', rotationPosition: 6 },
      { id: 6, position: 'op', label: 'OP', x: 100, y: 120, name: 'Opposite', rotationPosition: 1 },
      { id: 7, position: 'l', label: 'L', x: 100, y: 350, name: 'Libero', rotationPosition: 0 }
    ];
    this.currentRotation = 1;
    this.renderPlayers();
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
  }

  editPlayerLabel(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;
    
    const newLabel = prompt(`Enter new label for ${player.name}:`, player.label);
    if (newLabel !== null && newLabel.trim()) {
      player.label = newLabel.trim().substring(0, 4); // Limit to 4 characters
      this.renderPlayers();
    }
  }

  saveFormation() {
    const formationData = {
      players: this.players,
      currentRotation: this.currentRotation,
      timestamp: new Date().toISOString(),
      name: prompt('Enter formation name:', 'My Formation') || 'Unnamed Formation'
    };
    
    try {
      const formations = JSON.parse(localStorage.getItem('volleyballFormations') || '[]');
      formations.push(formationData);
      localStorage.setItem('volleyballFormations', JSON.stringify(formations));
      alert('Formation saved successfully!');
    } catch (error) {
      console.error('Error saving formation:', error);
      alert('Error saving formation. Please try again.');
    }
  }

  loadFormation() {
    try {
      const formations = JSON.parse(localStorage.getItem('volleyballFormations') || '[]');
      
      if (formations.length === 0) {
        alert('No saved formations found.');
        return;
      }
      
      // Create a simple selection dialog
      const formationNames = formations.map((f, i) => `${i + 1}. ${f.name} (${new Date(f.timestamp).toLocaleDateString()})`);
      const selection = prompt(`Select formation to load:\n\n${formationNames.join('\n')}\n\nEnter number:`);
      
      const index = parseInt(selection) - 1;
      if (index >= 0 && index < formations.length) {
        const formation = formations[index];
        this.players = JSON.parse(JSON.stringify(formation.players));
        this.currentRotation = formation.currentRotation || 1;
        this.renderPlayers();
        alert('Formation loaded successfully!');
      } else {
        alert('Invalid selection.');
      }
    } catch (error) {
      console.error('Error loading formation:', error);
      alert('Error loading formation. Please try again.');
    }
  }

  // Remove preset formation methods since we removed quick formations
  // loadPresetFormation() method removed

  showAbout() {
    document.getElementById('aboutModal').style.display = 'block';
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VolleyballFormationApp();
});