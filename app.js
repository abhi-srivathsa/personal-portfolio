// Night Owl Portfolio — Stripe.dev Inspired Interactions

document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initMobileMenu();
    initSmoothScrolling();
    initScrollAnimations();
    initKeyboardNav();
});

// --- Navigation ---
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    let lastScroll = 0;
    let ticking = false;

    function onScroll() {
        const currentScroll = window.scrollY;

        // Hide/show navbar on scroll
        if (currentScroll > 100) {
            if (currentScroll > lastScroll && currentScroll > 300) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        } else {
            navbar.classList.remove('hidden');
        }

        lastScroll = currentScroll;

        // Active section tracking
        let currentSection = '';
        sections.forEach(function (section) {
            const top = section.offsetTop - 120;
            if (currentScroll >= top) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// --- Mobile Menu ---
function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
    });

    // Close on link click
    menu.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        }
    });
}

// --- Smooth Scrolling ---
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;

            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// --- Scroll Animations ---
function initScrollAnimations() {
    var animatedElements = document.querySelectorAll(
        '.section-label, .section-title, .section-subtitle, ' +
        '.about-description, .highlight-card, .photo-card, ' +
        '.exp-card, .project-card, .skill-group, .edu-card, ' +
        '.cert-card, .contact-card, .hero-title, ' +
        '.hero-subtitle, .hero-stats, ' +
        '.certs-title'
    );

    animatedElements.forEach(function (el) {
        el.classList.add('fade-in');
    });

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animatedElements.forEach(function (el) {
        observer.observe(el);
    });
}

// --- Terminal Typing Effect ---
function initTerminalTyping() {
    var typedEl = document.getElementById('typed-text');
    var outputEl = document.getElementById('terminal-output');
    if (!typedEl || !outputEl) return;

    var commands = [
        {
            text: 'cat about.json',
            output:
                '<span class="output-comment">// abhilash.config</span>\n' +
                '{\n' +
                '  <span class="output-label">"name"</span>: <span class="output-string">"Abhilash Srivathsa"</span>,\n' +
                '  <span class="output-label">"role"</span>: <span class="output-string">"Senior Software Engineer"</span>,\n' +
                '  <span class="output-label">"company"</span>: <span class="output-string">"CodeRabbit"</span>,\n' +
                '  <span class="output-label">"stack"</span>: [<span class="output-string">"TypeScript"</span>, <span class="output-string">"AI"</span>, <span class="output-string">"LLMs"</span>, <span class="output-string">"GCP"</span>],\n' +
                '  <span class="output-label">"location"</span>: <span class="output-string">"San Francisco"</span>\n' +
                '}'
        },
        {
            text: 'echo $IMPACT',
            output:
                '<span class="output-value">20%</span> cost reduction\n' +
                '<span class="output-value">80%</span> manual tasks automated\n' +
                '<span class="output-value">34%</span> workload reduction'
        },
        {
            text: 'ls projects/',
            output:
                '<span class="output-string">chord-dht/</span>    <span class="output-string">student-marketplace/</span>\n' +
                '<span class="output-string">galapagos/</span>     <span class="output-string">socrates-ii/</span>'
        }
    ];

    var cmdIndex = 0;
    var charIndex = 0;

    function typeCommand() {
        var cmd = commands[cmdIndex];
        if (charIndex < cmd.text.length) {
            typedEl.textContent += cmd.text[charIndex];
            charIndex++;
            setTimeout(typeCommand, 40 + Math.random() * 40);
        } else {
            // Show output after typing
            setTimeout(function () {
                outputEl.innerHTML = cmd.output;
                // After showing output, wait and then type next command
                setTimeout(function () {
                    cmdIndex = (cmdIndex + 1) % commands.length;
                    charIndex = 0;
                    typedEl.textContent = '';
                    outputEl.innerHTML = '';
                    typeCommand();
                }, 3000);
            }, 400);
        }
    }

    // Start after a brief delay
    setTimeout(typeCommand, 800);
}

// --- Keyboard Navigation (stripe.dev style) ---
function initKeyboardNav() {
    var keyMap = {
        a: '#about',
        e: '#experience',
        p: '#projects',
        s: '#skills',
        d: '#education',
        c: '#contact'
    };

    document.addEventListener('keydown', function (e) {
        // Don't trigger if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        var key = e.key.toLowerCase();
        if (keyMap[key]) {
            var target = document.querySelector(keyMap[key]);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}
