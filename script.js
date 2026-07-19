// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => console.log('Service Worker registered'))
        .catch(error => console.log('Service Worker registration failed:', error));
}

// App State
const appState = {
    currentQuestion: 0,
    answers: {},
    totalQuestions: 9,
};

const questions = [
    {
        id: 1,
        text: "Quanto tempo você está residindo no Brasil?",
        options: [
            "Menos de 1 ano",
            "Entre 1 e 4 anos",
            "Entre 4 e 15 anos",
            "Mais de 15 anos"
        ]
    },
    {
        id: 2,
        text: "Você possui RNE ou CRNM (Registro Nacional de Estrangeiro)?",
        options: [
            "Sim, tenho registro vigente",
            "Sim, mas está expirado",
            "Não tenho registro"
        ]
    },
    {
        id: 3,
        text: "¿Hablas português?",
        options: [
            "Sim, com fluidez",
            "Nível intermediário",
            "Nível básico o nada"
        ]
    },
    {
        id: 4,
        text: "Você tem antecedentes penais no Brasil ou em seu país de origem?",
        options: [
            "Não, registro limpo",
            "Sim, no Brasil",
            "Sim, no meu país de origen"
        ]
    },
    {
        id: 5,
        text: "Você é conhecido, filho ou padre brasileiro?",
        options: [
            "Cônjuge brasileiro",
            "Filho brasileiro",
            "Padre ou madre brasileira",
            "Não"
        ]
    },
    {
        id: 6,
        text: "Qual é a sua situación migratória atual?",
        options: [
            "Residência temporária vigente",
            "Residência permanente",
            "Estou como turista / visto temporal curto",
            "Soja irregular / sem documentación"
        ]
    },
    {
        id: 7,
        text: "Você pode demonstrar meios de subsistência (ingressos/emprego) no Brasil?",
        options: [
            "Sim, tenho provas",
            "Não, na realidade não"
        ]
    },
    {
        id: 8,
        text: "Você pode demonstrar meios de subsistência (ingressos/emprego) no Brasil?",
        options: [
            "Sim, tenho provas",
            "Não, na realidade não"
        ]
    },
    {
        id: 9,
        text: "Qual é o seu objetivo principal?",
        options: [
            "Obter a nacionalidade brasileira",
            "Obter residência permanente",
            "Obter o renovar residência temporal",
            "Regularizar minha situação migratória"
        ]
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setupUploadArea();
    setupProfileForm();
    showSection('inicio');
});

// Navigation Setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Está seguro de que desea cerrar sesión?')) {
                alert('Sesión cerrada. Hasta luego!');
            }
        });
    }
}

// Show Section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');

    sections.forEach(section => section.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Load questionnaire if diagnostico section
    if (sectionId === 'diagnostico') {
        loadQuestionnaire();
    }

    window.scrollTo(0, 0);
}

// Load Questionnaire
function loadQuestionnaire() {
    const container = document.getElementById('questionsContainer');
    if (!container) return;

    container.innerHTML = '';
    const question = questions[appState.currentQuestion];

    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';

    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = `${appState.currentQuestion + 1}. ${question.text}`;

    const options = document.createElement('div');
    options.className = 'question-options';

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        if (appState.answers[appState.currentQuestion] === index) {
            button.classList.add('selected');
        }
        button.addEventListener('click', () => selectAnswer(index));
        options.appendChild(button);
    });

    questionCard.appendChild(questionText);
    questionCard.appendChild(options);
    container.appendChild(questionCard);

    updateProgress();
    updateNavigationButtons();
}

// Select Answer
function selectAnswer(index) {
    appState.answers[appState.currentQuestion] = index;
    loadQuestionnaire();
}

// Update Progress
function updateProgress() {
    const progress = ((appState.currentQuestion + 1) / appState.totalQuestions) * 100;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (progressFill) progressFill.style.width = progress + '%';
    if (progressText) progressText.textContent = Math.round(progress) + '%';
}

// Update Navigation Buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        if (appState.currentQuestion > 0) {
            prevBtn.style.display = 'inline-flex';
        } else {
            prevBtn.style.display = 'none';
        }
    }

    if (nextBtn) {
        if (appState.currentQuestion === appState.totalQuestions - 1) {
            nextBtn.textContent = 'Enviar →';
        } else {
            nextBtn.textContent = 'Próxima →';
        }
    }
}

// Next Question
function nextQuestion() {
    if (appState.currentQuestion < appState.totalQuestions - 1) {
        appState.currentQuestion++;
        loadQuestionnaire();
    } else {
        showDiagnosticResult();
    }
}

// Previous Question
function previousQuestion() {
    if (appState.currentQuestion > 0) {
        appState.currentQuestion--;
        loadQuestionnaire();
    }
}

// Show Diagnostic Result
function showDiagnosticResult() {
    const diagnosticoSection = document.getElementById('diagnostico');
    const resultSection = document.getElementById('diagnostico-resultado');

    if (diagnosticoSection) diagnosticoSection.style.display = 'none';
    if (resultSection) resultSection.style.display = 'block';

    window.scrollTo(0, 0);
}

// Start Diagnostico
function startDiagnostico() {
    appState.currentQuestion = 0;
    appState.answers = {};
    showSection('diagnostico');
}

// Reset Diagnostico
function resetDiagnostico() {
    startDiagnostico();
}

// Scroll to Services
function scrollToServices() {
    const servicesSection = document.querySelector('.services-section');
    if (servicesSection) {
        showSection('inicio');
        setTimeout(() => {
            servicesSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }
}

// Upload Area Setup
function setupUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.backgroundColor = '#f0faf8';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.backgroundColor = 'transparent';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.backgroundColor = 'transparent';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect();
        }
    });

    fileInput.addEventListener('change', handleFileSelect);
}

// Handle File Select
function handleFileSelect() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileName = file.name;
        const fileSize = (file.size / 1024 / 1024).toFixed(2);

        console.log(`Archivo seleccionado: ${fileName} (${fileSize} MB)`);

        uploadArea.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 10px;">✓</div>
            <p style="color: var(--success-color); font-weight: 600;">${fileName}</p>
            <small>${fileSize} MB</small>
        `;
    }
}

// Setup Profile Form
function setupProfileForm() {
    const form = document.querySelector('.profile-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Perfil actualizado exitosamente! Tus cambios han sido guardados.');
        this.reset();
    });
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('App instalable disponible');
});

window.addEventListener('appinstalled', () => {
    console.log('App instalada exitosamente');
});
