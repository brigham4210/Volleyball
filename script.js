    const initialPlayers = [
    { id: 1, x: 80,  y: 150, type: 'OH',     label: 'OH' },
    { id: 2, x: 200, y: 150, type: 'MB',     label: 'MB' },
    { id: 3, x: 320, y: 150, type: 'OP',     label: 'OP' },
    { id: 4, x: 80,  y: 250, type: 'OH',     label: 'OH' },
    { id: 5, x: 200, y: 250, type: 'S',      label: 'S'  },
    { id: 6, x: 320, y: 250, type: 'MB',     label: 'MB' },
    { id: 7, x: 150, y: 200, type: 'libero', label: 'L'  }
    ];

    let players = JSON.parse(JSON.stringify(initialPlayers));
    let draggedPlayerId = null;
    let offsetX = 0, offsetY = 0;

    function renderPlayers() {
    const court = document.getElementById('court');
    court.querySelectorAll('.player').forEach(el => el.remove());
    players.forEach(player => {
    const div = document.createElement('div');
    div.className = `player ${player.type}`;
    div.style.left = `${player.x}px`;
    div.style.top = `${player.y}px`;
    div.textContent = player.label;
    div.setAttribute('data-id', player.id);

    div.onmousedown = function(e) {
    draggedPlayerId = player.id;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    div.classList.add('dragging');
    document.body.style.cursor = 'grabbing';
};

    court.appendChild(div);
});
}

    function onCourtMouseMove(e) {
    if (draggedPlayerId === null) return;
    const court = document.getElementById('court');
    const rect = court.getBoundingClientRect();
    let x = e.clientX - rect.left - offsetX;
    let y = e.clientY - rect.top - offsetY;
    x = Math.max(-50, Math.min(450, x));
    y = Math.max(-50, Math.min(450, y));
    players = players.map(p => p.id === draggedPlayerId ? { ...p, x, y } : p);

    // Direct update instead of full re-render
    const el = court.querySelector(`.player[data-id='${draggedPlayerId}']`);
    if (el) {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
}
}

    function onCourtMouseUp() {
    if (draggedPlayerId !== null) {
    draggedPlayerId = null;
    document.body.style.cursor = '';
    renderPlayers(); // Final sync
}
}

    function resetPlayers() {
    players = JSON.parse(JSON.stringify(initialPlayers));
    renderPlayers();
}

    // Init
    renderPlayers();

    // Desktop events
    const court = document.getElementById('court');
    court.addEventListener('mousemove', onCourtMouseMove);
    court.addEventListener('mouseup', onCourtMouseUp);
    court.addEventListener('mouseleave', onCourtMouseUp);
    document.addEventListener('mouseup', onCourtMouseUp);

    // Touch events
    court.addEventListener('touchstart', function(e) {
    const target = e.target.closest('.player');
    if (!target) return;

    draggedPlayerId = Number(target.getAttribute('data-id'));

    const touch = e.touches[0];
    const rect = target.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;

    target.classList.add('dragging');
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
}, { passive: false });

    court.addEventListener('touchmove', function(e) {
    if (draggedPlayerId === null) return;

    const touch = e.touches[0];
    const rect = court.getBoundingClientRect();
    let x = touch.clientX - rect.left - offsetX;
    let y = touch.clientY - rect.top - offsetY;

    x = Math.max(-50, Math.min(450, x));
    y = Math.max(-50, Math.min(450, y));

    players = players.map(p => p.id === draggedPlayerId ? { ...p, x, y } : p);

    const el = court.querySelector(`.player[data-id='${draggedPlayerId}']`);
    if (el) {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.classList.add('dragging');
}

    e.preventDefault(); // Prevent page scroll
}, { passive: false });

    court.addEventListener('touchend', function(e) {
    draggedPlayerId = null;
    document.body.style.cursor = '';
    renderPlayers();
}, { passive: false });
