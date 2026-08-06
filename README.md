# Human-Robot Collaborative Object Manipulation Using Deep Active Inference

Static project website for Ferdinand Hartmann's master thesis.

The page presents the thesis motivation, deep active inference method, ROS 2 implementation, Franka controller stack, teleoperation/data collection workflow, experiment videos, result plots, and all available diagrams.

## Local Preview

From this repository:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Assets

All media used by the website is copied into `assets/` so the GitHub Pages deployment is self-contained.

- `assets/images/`: experiment photos and architecture image.
- `assets/videos/`: boxlift, goal-change, stacking, and latent-distribution videos.
- `assets/diagram-images/`: rendered diagram images used inline on the page.
- `assets/results/`: prediction visualizations.
- `assets/result-images/`: rendered result/diagram images used inline on the page.

The original PowerPoint and source documents are used only as source material and are not published in this repository.

## Deployment

GitHub Actions deploys the static site to GitHub Pages on every push to `main`.

The workflow lives at `.github/workflows/pages.yml` and uses the official Pages actions:

- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

No build step or package installation is required.
