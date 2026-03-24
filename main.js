document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });
    sections.forEach(section => {
        observer.observe(section);
    });

    // Smooth scrolling for internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - (document.querySelector('header')?.offsetHeight || 0),
                behavior: 'smooth'
            });
        });
    });

    // Language switcher
    const langToggle = document.getElementById('langToggle');

    const translations = {
        sv: {
            langLabel: 'SE svenska',
            success: 'Meddelandet skickades!',
            error: 'Ett fel uppstod. Försök igen.',
            remove: 'Ta bort'
        },
        en: {
            langLabel: 'EN english',
            success: 'Message sent successfully!',
            error: 'There was an error sending your message. Please try again.',
            remove: 'Remove'
        }
    };

    const getLang = () => document.documentElement.lang || 'sv';

    const showToast = (message, isError = false, duration = 3000) => {
        const popup = document.createElement('div');
        popup.textContent = message;
        popup.style.position = 'fixed';
        popup.style.top = '20px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.background = isError ? '#d9534f' : '#333';
        popup.style.color = '#fff';
        popup.style.padding = '16px 32px';
        popup.style.borderRadius = '8px';
        popup.style.fontSize = '1.2rem';
        popup.style.zIndex = '9999';
        popup.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.remove();
        }, duration);
    };

    function setLanguage(lang) {
        document.documentElement.lang = lang;
        localStorage.setItem('siteLanguage', lang);

        if (langToggle) {
            const label = translations[lang]?.langLabel || translations.en.langLabel;
            langToggle.innerHTML = `<i class="fas fa-globe"></i><span class="lang-toggle-label">${label}</span>`;
        }

        const messageEl = document.getElementById('message');
        if (messageEl) {
            const placeholder = messageEl.dataset[lang === 'sv' ? 'placeholderSv' : 'placeholderEn'];
            if (placeholder) messageEl.placeholder = placeholder;
        }
    }

    const savedLang = localStorage.getItem('siteLanguage');
    setLanguage(savedLang === 'en' ? 'en' : 'sv');

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const next = document.documentElement.lang === 'sv' ? 'en' : 'sv';
            setLanguage(next);
        });
    }

    // Mobile nav toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const headerEl = document.querySelector('header');
    const mainNav = document.getElementById('mainNav');

    if (mobileMenuToggle && headerEl && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            headerEl.classList.toggle('nav-open');
        });

        // Close the menu when clicking on a normal link (not a dropdown header)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const parent = link.closest('.has-dropdown');

                // If it's a dropdown header, just toggle submenu (don't close)
                if (parent && parent.querySelector('.dropdown')) {
                    return;
                }

                headerEl.classList.remove('nav-open');
            });
        });

        // Mobile dropdown accordion: tapping the dropdown header toggles it (doesn't close menu)
        mainNav.querySelectorAll('.has-dropdown > a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const parent = link.parentElement;
                    parent.classList.toggle('open');
                }
            });
        });
    }

    // Contact form file upload / submit logic
    const filesInput = document.getElementById('filesInput');
    const addFileBtn = document.getElementById('addFileBtn');
    const fileList = document.getElementById('fileList');

    if (filesInput && addFileBtn && fileList) {
        let filesArray = [];

        function updateFileList() {
            fileList.innerHTML = '';
            filesArray.forEach((file, idx) => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.alignItems = 'center';
                row.style.height = '28px';
                row.style.marginBottom = '6px';
                row.style.width = '100%';

                const bullet = document.createElement('span');
                bullet.textContent = '•';
                bullet.style.marginRight = '8px';
                bullet.style.fontSize = '1.1rem';
                bullet.style.color = '#222';
                bullet.style.display = 'inline-block';
                bullet.style.verticalAlign = 'middle';

                const nameSpan = document.createElement('span');
                nameSpan.textContent = file.name;
                nameSpan.style.display = 'inline-block';
                nameSpan.style.textAlign = 'left';
                nameSpan.style.color = '#222';
                nameSpan.style.width = 'calc(100% - 40px)';
                nameSpan.style.overflow = 'hidden';
                nameSpan.style.textOverflow = 'ellipsis';
                nameSpan.style.whiteSpace = 'nowrap';

                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '&times;';
                removeBtn.title = translations[getLang()]?.remove || translations.en.remove;
                removeBtn.style.background = 'transparent';
                removeBtn.style.color = 'red';
                removeBtn.style.border = 'none';
                removeBtn.style.fontSize = '1.3rem';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.padding = '0';
                removeBtn.style.marginLeft = 'auto';
                removeBtn.onclick = () => {
                    filesArray.splice(idx, 1);
                    updateFileList();
                };

                row.appendChild(bullet);
                row.appendChild(nameSpan);
                row.appendChild(removeBtn);
                fileList.appendChild(row);
            });
        }

        filesInput.addEventListener('change', function() {
            if (filesInput.files.length > 0) {
                for (let i = 0; i < filesInput.files.length; i++) {
                    filesArray.push(filesInput.files[i]);
                }
                updateFileList();
                filesInput.value = '';
            }
        });

        addFileBtn.addEventListener('click', function() {
            filesInput.click();
        });

        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(contactForm);
                filesArray.forEach(file => {
                    formData.append('files[]', file);
                });

                fetch(contactForm.action, {
                    method: 'POST',
                    body: formData
                })
                .then(async (response) => {
                    const text = await response.text();
                    if (!response.ok) throw new Error(text || 'Server error');
                    return text;
                })
                .then(() => {
                    const lang = getLang();
                    showToast(translations[lang]?.success || translations.en.success, false, 3000);

                    contactForm.reset();
                    filesArray = [];
                    updateFileList();
                })
                .catch((error) => {
                    const lang = getLang();
                    const fallback = translations[lang]?.error || translations.en.error;
                    const msg = (error && error.message) ? error.message : fallback;

                    showToast(msg, true, 5000);
                    console.error('Contact form error:', error);
                });
            });
        }
    }
});
