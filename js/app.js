document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SMOOTH SCROLL NAVIGATION ---
    const navButtons = {
        'home': document.getElementById('nav-home') || document.querySelector('.home'),
        'about': document.getElementById('nav-about') || document.querySelector('.about'),
        'skills': document.getElementById('nav-skills') || document.querySelector('.skills'),
        'projects': document.getElementById('nav-projects') || document.querySelector('.projects'),
        'contact': document.getElementById('nav-contact') || document.querySelector('.contact')
    };

    Object.entries(navButtons).forEach(([sectionId, button]) => {
        if (!button) return;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- 2. SCROLL SPY & REVEAL ANIMATIONS (INTERSECTION OBSERVER) ---
    const sections = document.querySelectorAll('section');
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    
    // Observer options
    const sectionObserverOptions = {
        root: null,
        threshold: 0.35, // Trigger when 35% of the section is visible
        rootMargin: "-10% 0px -20% 0px"
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeSectionId = entry.target.getAttribute('id');
                
                // Highlight corresponding navigation button
                Object.entries(navButtons).forEach(([key, button]) => {
                    if (button) {
                        if (key === activeSectionId) {
                            button.classList.add('active');
                        } else {
                            button.classList.remove('active');
                        }
                    }
                });

                // Trigger skill progress bars when skills section is in viewport
                if (activeSectionId === 'skills') {
                    skillBars.forEach(bar => {
                        const targetWidth = bar.getAttribute('data-percentage') || '0%';
                        bar.style.width = targetWidth;
                    });
                }
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- 3. ELEMENTS REVEAL ON SCROLL ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserverOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    
    // --- 4. CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');

    if (contactForm && toast) {
        const toastTitle = toast.querySelector('strong');
        const toastDesc = toast.querySelector('span');
        const toastSvg = toast.querySelector('svg');
        let toastTimeout;

        // Helper to show custom toast message
        const showToast = (isSuccess, title, desc) => {
            // Clear any active timeout
            if (toastTimeout) {
                clearTimeout(toastTimeout);
                toast.classList.remove('show');
            }

            if (toastTitle) toastTitle.textContent = title;
            if (toastDesc) toastDesc.textContent = desc;

            if (isSuccess) {
                toast.style.borderColor = 'var(--clr-cyan)';
                if (toastSvg) {
                    toastSvg.style.stroke = 'var(--clr-cyan)';
                    toastSvg.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
                }
            } else {
                toast.style.borderColor = '#ef4444';
                if (toastSvg) {
                    toastSvg.style.stroke = '#ef4444';
                    toastSvg.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
                }
            }

            // Force reflow to restart transition if necessary
            void toast.offsetWidth;

            toast.classList.add('show');
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 5000);
        };

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            // Disable submit button during submission
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'SENDING...';
            }

            const accessKey = document.getElementById('accessKeyInput') ? document.getElementById('accessKeyInput').value : '';

            // Send data to Web3Forms API using fetch
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    name: name,
                    email: email,
                    message: message,
                    subject: `New Portfolio Message from ${name}`
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success === true) {
                    // Show success message
                    showToast(true, 'Message Sent!', 'I will get back to you shortly.');
                    contactForm.reset();
                    
                    // Re-enable submit button since AJAX succeeded
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'SEND MESSAGE';
                    }
                } else {
                    // Show error message
                    showToast(false, 'Submission Failed', data.message || 'Please try again later.');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'SEND MESSAGE';
                    }
                }
            })
            .catch(error => {
                console.warn('AJAX fetch failed or blocked (likely due to CORS on local file:// protocol). Falling back to native HTML form submission...', error);
                
                // Configure form for native POST submission
                contactForm.action = 'https://api.web3forms.com/submit';
                contactForm.method = 'POST';

                // Submit natively (doesn't trigger event listener recursively)
                contactForm.submit();
            });
        });
    }

    // --- 5. COMPATIBILITY: ADJUST NAV HIGHLIGHT ON ZERO SCROLL ---
    window.addEventListener('scroll', () => {
        if (window.scrollY === 0) {
            Object.entries(navButtons).forEach(([key, button]) => {
                if (button) {
                    if (key === 'home') {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                }
            });
        }
    });
});
