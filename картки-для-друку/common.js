function toggleEdit() {
  const nodes = document.querySelectorAll('[contenteditable]');
  if (!nodes.length) return;
  const on = nodes[0].getAttribute('contenteditable') !== 'true';
  nodes.forEach((el) => el.setAttribute('contenteditable', on ? 'true' : 'false'));
  alert(on ? 'Редагування увімкнено — клікай по тексту.' : 'Редагування вимкнено.');
}
