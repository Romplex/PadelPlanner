function bookSlot(slotId) {
  fetch('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slotId })
  }).then(res => res.json()).then(data => {
    if (data.success) location.reload();
    else alert('Buchung fehlgeschlagen');
  });
}