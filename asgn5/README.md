# Assignment 5 — Three.js scene

## Vite

Obligatory README because Vite was so confusing to debug. The main issue comes from me not understanding the build, deploy, /dist path, and how it all links together on GitHub Pages. Especially when my repo has multiple folders.

> [!NOTE]
> This took a solid 4 days past the deadline to debug, thank you Professor James Davis for allowing my submission 🙏

#### Steps to successfully deploy:

1. Change the `vite.config.js` base value to "CSE160/asgn5/dist"
2. Make sure the `resources` folder is in `/asgn5`
3. Manually run `npm run build` to create a new `/dist` folder
4. Move `resources` back into /dist
5. Commit and push all changes
6. Run `npm run deploy` to deploy to GitHub Pages

#### Notes
- `/dist` is the html webpage that will be shown on GitHub Pages
- `/asgn5/index.html` needed to have a folder `/src` to include path `./src/main.js`
- Removed the `predeploy` command from package.json, which was "npm run build" and ran it manually