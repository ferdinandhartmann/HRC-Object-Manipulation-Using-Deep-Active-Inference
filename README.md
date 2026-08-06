# Human-Robot Collaborative Object Manipulation Using Deep Active Inference

Static project website for Ferdinand Hartmann's master thesis.

**Website:** [ferdinandhartmann.github.io/HRC-Object-Manipulation-Using-Deep-Active-Inference](https://ferdinandhartmann.github.io/HRC-Object-Manipulation-Using-Deep-Active-Inference/)

The page presents the thesis motivation, deep active inference method, ROS 2 implementation, Franka controller stack, teleoperation/data collection workflow, experiment videos, result plots, and all available diagrams.

## Local Preview

From this website directory:

```bash
python3 -m http.server 4173
```

Then open [localhost:4173](http://localhost:4173).

## Run In VS Code

1. Open this folder in VS Code:

   ```bash
   code /home/ferdinand/masterthesis_website/HRC-Object-Manipulation-Using-Deep-Active-Inference
   ```

2. Open the integrated terminal in VS Code and start a local static server:

   ```bash
   python3 -m http.server 4173
   ```

3. Open the page in VS Code's Simple Browser or any normal browser:

   ```text
   http://localhost:4173/
   ```

   For example, paste that URL into Firefox, Chrome, Edge, or VS Code Simple Browser on the same computer.

4. To open it from another browser/device on the same network, first find this computer's IP address:

   ```bash
   hostname -I
   ```

   Then open:

   ```text
   http://YOUR_IP_ADDRESS:4173/
   ```

   Example:

   ```text
   http://192.168.1.42:4173/
   ```

If the VS Code browser shows an old version after editing `index.html`, `styles.css`, or `script.js`, hard-refresh the Simple Browser tab or close and reopen it. Use the server URL instead of opening `index.html` directly so the interactive JavaScript and media paths behave like the deployed site.

## Cache Busting

When changing `styles.css` or `script.js`, bump the version query in `index.html` so browsers fetch the new files after deployment:

```html
<link rel="stylesheet" href="./styles.css?v=20260806-3">
<script src="./script.js?v=20260806-3" defer></script>
```

Use any newer value, for example `?v=20260807-1`. After GitHub Pages redeploys, hard-refresh the browser with `Ctrl+Shift+R` if the old styling is still visible.

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

The workflow lives at [.github/workflows/pages.yml](.github/workflows/pages.yml) and uses the official Pages actions:

- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

No build step or package installation is required.
