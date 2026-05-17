const demoMailbox = {
  email: 'shadowbox_482@tempmail.studio',
  id: 'demo_mailbox_01'
};

const demoEmails = [
  {
    id: 'm1',
    from: 'security@mockservice.com',
    subject: 'Código de verificación para tu registro',
    body: 'Hola. Tu código temporal es 482193. Usa este número dentro de los próximos 10 minutos para completar tu acceso.'
  },
  {
    id: 'm2',
    from: 'welcome@alphaapp.dev',
    subject: 'Bienvenido a AlphaApp',
    body: 'Tu cuenta fue creada correctamente con un correo temporal. Este mensaje sirve como ejemplo de lectura desde la API.'
  },
  {
    id: 'm3',
    from: 'alerts@beta-store.io',
    subject: 'Confirma tu suscripción',
    body: 'Gracias por suscribirte. Haz clic en el enlace de validación o usa este correo como demo visual para tu proyecto académico.'
  }
];

let mailboxId = null;
let currentEmail = '';
let inbox = [];

const currentEmailEl = document.getElementById('currentEmail');
const mailCountEl = document.getElementById('mailCount');
const mailListEl = document.getElementById('mailList');
const messageFromEl = document.getElementById('messageFrom');
const messageSubjectEl = document.getElementById('messageSubject');
const messageBodyEl = document.getElementById('messageBody');
const apiStatusEl = document.getElementById('apiStatus');

function renderInbox(messages) {
  inbox = messages;
  mailListEl.innerHTML = '';
  mailCountEl.textContent = messages.length;

  if (!messages.length) {
    mailListEl.innerHTML = '<div class="mail-item"><strong>Sin mensajes</strong><p>Genera un buzón o carga la demo para ver correos aquí.</p></div>';
    messageFromEl.textContent = 'Sin remitente';
    messageSubjectEl.textContent = 'Selecciona un correo';
    messageBodyEl.textContent = 'Aquí aparecerá el contenido del mensaje.';
    return;
  }

  messages.forEach((mail, index) => {
    const item = document.createElement('button');
    item.className = 'mail-item' + (index === 0 ? ' active' : '');
    item.innerHTML = `<strong>${mail.subject}</strong><p>${mail.from}</p>`;
    item.addEventListener('click', () => selectMail(mail, item));
    mailListEl.appendChild(item);
  });

  selectMail(messages[0], mailListEl.firstChild);
}

function selectMail(mail, element) {
  document.querySelectorAll('.mail-item').forEach(item => item.classList.remove('active'));
  if (element) element.classList.add('active');
  messageFromEl.textContent = mail.from || 'Sin remitente';
  messageSubjectEl.textContent = mail.subject || 'Sin asunto';
  messageBodyEl.textContent = mail.body || 'Sin contenido';
}

function loadDemoData() {
  mailboxId = demoMailbox.id;
  currentEmail = demoMailbox.email;
  currentEmailEl.textContent = currentEmail;
  apiStatusEl.textContent = 'Modo demo';
  renderInbox(demoEmails);
}

async function generateMailbox() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const createEndpoint = document.getElementById('createEndpoint').value.trim();

  if (!apiKey) {
    loadDemoData();
    return;
  }

  try {
    apiStatusEl.textContent = 'Conectando';
    const response = await fetch(`${createEndpoint}?key=${encodeURIComponent(apiKey)}`);
    const result = await response.json();

    const mailbox = result.data || result.result || result;
    mailboxId = mailbox.id || mailbox.token || mailbox.mailbox_id;
    currentEmail = mailbox.email || mailbox.address || 'Correo creado';
    currentEmailEl.textContent = currentEmail;
    apiStatusEl.textContent = 'API activa';
    renderInbox([]);
  } catch (error) {
    apiStatusEl.textContent = 'Error API';
    alert('No se pudo conectar con la API real. Se cargará la demo visual.');
    loadDemoData();
  }
}

async function refreshInbox() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const emailsEndpoint = document.getElementById('emailsEndpoint').value.trim();

  if (!apiKey || !mailboxId) {
    renderInbox(demoEmails);
    return;
  }

  try {
    apiStatusEl.textContent = 'Consultando';
    const response = await fetch(`${emailsEndpoint}?key=${encodeURIComponent(apiKey)}&id=${encodeURIComponent(mailboxId)}`);
    const result = await response.json();
    const messages = result.data || result.result || [];
    renderInbox(messages);
    apiStatusEl.textContent = 'API activa';
  } catch (error) {
    apiStatusEl.textContent = 'Error API';
    alert('No se pudo actualizar la bandeja. Se mostrará la demo.');
    renderInbox(demoEmails);
  }
}

async function copyEmail() {
  if (!currentEmail || currentEmail === 'No generado aún') return;
  try {
    await navigator.clipboard.writeText(currentEmail);
    alert('Correo copiado: ' + currentEmail);
  } catch (error) {
    alert('No se pudo copiar automáticamente.');
  }
}

document.getElementById('generateBtn').addEventListener('click', generateMailbox);
document.getElementById('refreshBtn').addEventListener('click', refreshInbox);
document.getElementById('copyBtn').addEventListener('click', copyEmail);
document.getElementById('loadDemoBtn').addEventListener('click', loadDemoData);

renderInbox([]);