document.addEventListener('DOMContentLoaded', () => {
    const year = document.querySelector('#current-year');
    if (year) year.textContent = new Date().getFullYear();

    const navLinks = [...document.querySelectorAll('.site-nav a')];
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        const linksById = new Map(navLinks.map((link) => [link.hash.slice(1), link]));
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (!visible[0]) return;
            navLinks.forEach((link) => {
                const isActive = link === linksById.get(visible[0].target.id);
                link.classList.toggle('is-active', isActive);
                if (isActive) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        }, { rootMargin: '-20% 0px -68% 0px', threshold: 0 });
        sections.forEach((section) => observer.observe(section));
    }

    const entropyDemo = document.querySelector('[data-entropy-demo]');
    if (entropyDemo) {
        const numGoals = 3;
        const maxEntropy = Math.log(numGoals);
        const plot = { left: 58, top: 10, width: 222, height: 56 };
        const sigmoidConfigs = {
            goalIg: { midpoint: 0.75, scale: 0.12, invert: true, autoAlphaScale: true },
            mode: { midpoint: 0.65, scale: 0.05, invert: false, autoAlphaScale: true }
        };

        const slider = entropyDemo.querySelector('[data-certainty-slider]');
        const bars = [...entropyDemo.querySelectorAll('[data-goal-bar]')];
        const percentages = [...entropyDemo.querySelectorAll('[data-goal-percent]')];
        const entropyText = entropyDemo.querySelector('[data-entropy-value]');
        const goalIgText = entropyDemo.querySelector('[data-goal-ig-value]');
        const modeText = entropyDemo.querySelector('[data-mode-value]');
        const goalIgBalance = entropyDemo.querySelector('[data-goal-ig-balance]');
        const modeBalance = entropyDemo.querySelector('[data-mode-balance]');

        const rawSigmoid = (entropy, config) => {
            let exponent = (entropy - config.midpoint) / config.scale;
            if (config.invert) exponent = -exponent;
            return 1 / (1 + Math.exp(exponent));
        };

        const sigmoidValue = (entropy, config) => {
            const stiffness = rawSigmoid(entropy, config);
            if (!config.autoAlphaScale) return stiffness;
            const start = rawSigmoid(0, config);
            const end = rawSigmoid(maxEntropy, config);
            const range = Math.abs(start - end);
            if (range < 1e-12) return stiffness;
            return Math.min(1, Math.max(0, (stiffness - Math.min(start, end)) / range));
        };

        const entropyFromProbabilities = (probabilities) => (
            -probabilities.reduce((sum, probability) => (
                sum + probability * Math.log(probability + 1e-8)
            ), 0)
        );

        const probabilitiesFromCertainty = (certaintyPercent) => {
            const certainty = certaintyPercent / 100;
            const dominant = 1 / numGoals + certainty * (1 - 1 / numGoals);
            const remaining = Math.max(0, 1 - dominant);
            return [dominant, remaining / 2, remaining / 2];
        };

        const curvePath = (config) => {
            const points = [];
            for (let index = 0; index <= 96; index += 1) {
                const entropy = (index / 96) * maxEntropy;
                const x = plot.left + (entropy / maxEntropy) * plot.width;
                const y = plot.top + plot.height - sigmoidValue(entropy, config) * plot.height;
                points.push(`${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
            }
            return points.join(' ');
        };

        Object.entries(sigmoidConfigs).forEach(([key, config]) => {
            const curve = entropyDemo.querySelector(`[data-curve="${key}"]`);
            if (curve) curve.setAttribute('d', curvePath(config));
        });

        const updateEntropyDemo = () => {
            const probabilities = probabilitiesFromCertainty(Number(slider.value));
            const entropy = Math.max(0, entropyFromProbabilities(probabilities));
            const goalIg = sigmoidValue(entropy, sigmoidConfigs.goalIg);
            const mode = sigmoidValue(entropy, sigmoidConfigs.mode);
            const markerX = plot.left + (entropy / maxEntropy) * plot.width;

            bars.forEach((bar, index) => {
                bar.style.height = `${probabilities[index] * 62}px`;
            });

            percentages.forEach((percentage, index) => {
                percentage.textContent = `${Math.round(probabilities[index] * 100)}%`;
            });
            entropyText.textContent = entropy.toFixed(2);
            goalIgText.textContent = goalIg.toFixed(2);
            modeText.textContent = mode.toFixed(2);
            goalIgBalance.style.width = `${goalIg * 100}%`;
            modeBalance.style.width = `${mode * 100}%`;

            entropyDemo.querySelectorAll('[data-marker]').forEach((marker) => {
                marker.setAttribute('x1', markerX.toFixed(2));
                marker.setAttribute('x2', markerX.toFixed(2));
            });
        };

        slider.addEventListener('input', updateEntropyDemo);
        updateEntropyDemo();
    }

    const systemText = {
        gpu: {
            title: 'GPU AIF inference',
            body: 'The inference runtime builds a recent interaction history and evaluates candidate action chunks on a GPU server. The selected action is the one expected to best balance task progress and uncertainty reduction.',
            bullets: ['30 Hz observation and update loop with short action chunks.', 'Inputs summarize robot motion, force interaction, previous commands, and interaction mode.', 'The system records goal belief, candidate trajectories, EFE components, surprise, and timing for analysis.']
        },
        controller: {
            title: 'Execution layer',
            body: 'The execution layer turns selected action chunks into smooth robot motion. It interpolates the chosen trajectory, keeps motion inside the usable workspace, and coordinates safe stopping or reset behavior.',
            bullets: ['Smooths short-horizon action chunks before they reach the robot.', 'Handles stale predictions and trial-end behavior.', 'Supports both stiff goal-directed assistance and more compliant interaction.'],
            figure: {
                src: './assets/images/realtime-inference.png',
                alt: 'Real-time inference architecture diagram',
                caption: 'Real-time inference architecture used to connect policy prediction, world-model update, action execution, and visualization.'
            }
        },
        path: {
            title: 'Startup and handoff',
            body: 'The handoff logic moves the robot into the correct physical setup before inference starts and returns it to a usable pose after success, timeout, or continuous stacking transitions.',
            bullets: ['Moves up, over, down, and forward into the box-grab pose.', 'Waits for controller readiness and grab-force readiness.', 'Runs reset handoff after success, timeout, or continuous stacking transitions.']
        },
        franka: {
            title: 'Low-level Franka control',
            body: 'The low-level controller stack turns selected actions into compliant robot motion. Impedance control tracks commanded end-effector poses, while admittance control converts human-applied force into yielding motion around the equilibrium pose.',
            bullets: ['Cartesian impedance tracks selected pose commands with stiffness, damping, torque limits, wrench limits, startup protection, and first-command smoothing.', 'Cartesian admittance maps measured external wrench into compliant motion and supports human-following behavior.', 'Controller-side limits and startup ramps reduce abrupt command changes.']
        },
        viz: {
            title: 'Visualization and recording',
            body: 'Visualization and recording make the behavior inspectable after each trial. The system stores what the robot believed, what it considered, what it selected, and how the interaction forces evolved.',
            bullets: ['Goal markers show the most likely target and completed stacking boxes.', 'Candidate and selected trajectories are drawn as RViz marker paths.', 'Recorder stores synchronized robot state, wrench, images, predictions, EFE metrics, posterior, and timing.'],
            placeholder: 'visualization'
        }
    };

    const detail = document.querySelector('[data-system-detail]');
    document.querySelectorAll('[data-system]').forEach((button) => {
        button.addEventListener('click', () => {
            const content = systemText[button.dataset.system];
            if (!content || !detail) return;
            document.querySelectorAll('[data-system]').forEach((item) => {
                item.classList.toggle('is-active', item === button);
            });
            detail.innerHTML = `
                <h3>${content.title}</h3>
                <p>${content.body}</p>
                <ul>${content.bullets.map((item) => `<li>${item}</li>`).join('')}</ul>
                ${content.figure ? `
                    <figure class="wide-figure no-crop-figure system-figure">
                        <img src="${content.figure.src}" alt="${content.figure.alt}">
                        <figcaption>${content.figure.caption}</figcaption>
                    </figure>
                ` : ''}
                ${content.placeholder === 'visualization' ? `
                    <figure class="visualization-placeholder system-figure" aria-label="Placeholder for RViz live visualization and PlotJuggler screenshot">
                        <div class="viz-placeholder-grid">
                            <div class="rviz-placeholder">
                                <div class="viz-toolbar"><span></span><span></span><span></span></div>
                                <div class="rviz-stage">
                                    <i class="rviz-robot"></i>
                                    <i class="rviz-path path-a"></i>
                                    <i class="rviz-path path-b"></i>
                                    <i class="rviz-goal goal-a"></i>
                                    <i class="rviz-goal goal-b"></i>
                                </div>
                                <strong>RViz live visualization</strong>
                            </div>
                            <div class="plotjuggler-placeholder">
                                <div class="viz-toolbar"><span></span><span></span><span></span></div>
                                <div class="plot-lines">
                                    <i></i><i></i><i></i><i></i>
                                </div>
                                <strong>PlotJuggler</strong>
                            </div>
                        </div>
                        <figcaption><strong>Visualization placeholder.</strong> Add the final screenshot here showing RViz live markers and PlotJuggler signal traces.</figcaption>
                    </figure>
                ` : ''}
            `;
        });
    });

    const videoTabs = document.querySelector('[data-video-tabs]');
    if (videoTabs) {
        const panels = [...videoTabs.querySelectorAll('[data-panel-id]')];
        const tabs = [...videoTabs.querySelectorAll('[role="tab"]')];

        const activatePanel = (panelId) => {
            tabs.forEach((tab) => {
                const active = tab.dataset.panel === panelId;
                tab.setAttribute('aria-selected', String(active));
                tab.classList.toggle('is-active', active);
            });

            panels.forEach((panel) => {
                const active = panel.dataset.panelId === panelId;
                panel.classList.toggle('is-active', active);
                if (active) {
                    panel.removeAttribute('hidden');
                    panel.style.display = '';
                } else {
                    panel.setAttribute('hidden', '');
                    panel.style.display = 'none';
                    panel.querySelectorAll('video').forEach((video) => video.pause());
                }
            });
        };

        videoTabs.addEventListener('click', (event) => {
            const button = event.target.closest('[role="tab"][data-panel]');
            if (!button || !videoTabs.contains(button)) return;
            activatePanel(button.dataset.panel);
        });

        const initialTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
        if (initialTab) activatePanel(initialTab.dataset.panel);
    }

    const expandableImages = [...document.querySelectorAll('img:not([alt=""])')];
    if (expandableImages.length) {
        const lightbox = document.createElement('div');
        lightbox.className = 'image-lightbox';
        lightbox.hidden = true;
        lightbox.innerHTML = `
            <figure>
                <button type="button" aria-label="Close image preview">&times;</button>
                <img alt="">
                <figcaption></figcaption>
            </figure>
        `;
        document.body.appendChild(lightbox);

        const lightboxImage = lightbox.querySelector('img');
        const lightboxCaption = lightbox.querySelector('figcaption');
        const closeButton = lightbox.querySelector('button');

        const closeLightbox = () => {
            lightbox.hidden = true;
            lightboxImage.removeAttribute('src');
            document.body.style.overflow = '';
        };

        expandableImages.forEach((image) => {
            image.dataset.expandableImage = '';
            image.tabIndex = 0;
            image.setAttribute('role', 'button');
            image.setAttribute('aria-label', `Expand image: ${image.alt || 'visual'}`);

            const openLightbox = () => {
                const captionNode = image.closest('figure')?.querySelector('figcaption');
                lightboxImage.src = image.currentSrc || image.src;
                lightboxImage.alt = image.alt || '';
                if (captionNode) {
                    lightboxCaption.innerHTML = captionNode.innerHTML;
                } else {
                    lightboxCaption.textContent = image.alt || '';
                }
                lightbox.hidden = false;
                document.body.style.overflow = 'hidden';
                closeButton.focus();
            };

            image.addEventListener('click', openLightbox);
            image.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openLightbox();
                }
            });
        });

        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox || event.target === lightboxImage || event.target === closeButton) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
        });
    }
});
