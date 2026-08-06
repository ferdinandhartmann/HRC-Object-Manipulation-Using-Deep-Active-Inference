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

    const beliefStates = {
        uncertain: {
            copy: "When goal certainty is low, the system values information gain and tends to follow or explore to infer the human's intended goal.",
            mode: 'Follow / explore',
            detail: 'Goal information gain dominates the action choice.',
            bars: ['76%', '52%', '39%', '63%']
        },
        certain: {
            copy: 'When one goal becomes likely, pragmatic value has more weight and the selected action chunk can lead the box toward the inferred target.',
            mode: 'Lead / assist',
            detail: 'Pragmatic value dominates while uncertainty stays monitored.',
            bars: ['92%', '18%', '12%', '9%']
        }
    };

    const beliefDemo = document.querySelector('[data-belief-demo]');
    if (beliefDemo) {
        const copy = beliefDemo.querySelector('[data-belief-copy]');
        const mode = beliefDemo.querySelector('[data-belief-mode]');
        const detail = beliefDemo.querySelector('[data-belief-detail]');
        const bars = [...beliefDemo.querySelectorAll('.belief-bars span')];

        beliefDemo.querySelectorAll('[data-belief]').forEach((button) => {
            button.addEventListener('click', () => {
                const state = beliefStates[button.dataset.belief];
                if (!state) return;
                beliefDemo.querySelectorAll('[data-belief]').forEach((item) => {
                    item.classList.toggle('is-selected', item === button);
                });
                copy.textContent = state.copy;
                mode.textContent = state.mode;
                detail.textContent = state.detail;
                bars.forEach((bar, index) => {
                    bar.style.height = state.bars[index] || '20%';
                });
            });
        });
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
            bullets: ['Smooths short-horizon action chunks before they reach the robot.', 'Handles stale predictions and trial-end behavior.', 'Supports both stiff goal-directed assistance and more compliant interaction.']
        },
        path: {
            title: 'Startup and handoff',
            body: 'The handoff logic moves the robot into the correct physical setup before inference starts and returns it to a usable pose after success, timeout, or continuous stacking transitions.',
            bullets: ['Moves up, over, down, and forward into the box-grab pose.', 'Waits for controller readiness and grab-force readiness.', 'Runs reset handoff after success, timeout, or continuous stacking transitions.']
        },
        franka: {
            title: 'Low-level Franka control',
            body: 'The low-level controller stack tracks Cartesian pose commands while preserving compliant behavior. Impedance control provides accurate pose tracking; admittance control turns human-applied forces into yielding motion.',
            bullets: ['Cartesian impedance tracks pose commands with stiffness, damping, torque limits, and first-command smoothing.', 'Cartesian admittance maps external wrench into compliant motion.', 'Controller-side limits and startup ramps reduce abrupt command changes.']
        },
        viz: {
            title: 'Visualization and recording',
            body: 'Visualization and recording make the behavior inspectable after each trial. The system stores what the robot believed, what it considered, what it selected, and how the interaction forces evolved.',
            bullets: ['Goal markers show the most likely target and completed stacking boxes.', 'Candidate and selected trajectories are drawn as RViz marker paths.', 'Recorder stores synchronized robot state, wrench, images, predictions, EFE metrics, posterior, and timing.']
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
});
