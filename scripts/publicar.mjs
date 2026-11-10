// Gera o build e publica a pasta dist/ na branch gh-pages (GitHub Pages).
// Uso: npm run publicar   (requer o GitHub CLI logado: gh auth status)
import { execSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'

const REPO = 'https://github.com/powermino/julio-kshesek-96.git'
const AUTOR = ['-c', 'user.name=powermino', '-c', 'user.email=171260758+powermino@users.noreply.github.com']
const CRED = ['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential']
const sh = (cmd, cwd = '.') => execSync(cmd, { cwd, stdio: 'inherit', shell: true })
const git = (args, cwd = 'dist') => sh(['git', ...args].map((a) => (/[\s!=]/.test(a) ? `"${a}"` : a)).join(' '), cwd)

sh('npx vite build')
writeFileSync('dist/.nojekyll', '')
rmSync('dist/.git', { recursive: true, force: true })
git(['init', '-q', '-b', 'gh-pages'])
git(['add', '-A'])
git([...AUTOR, 'commit', '-q', '-m', `Publicação ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`])
// versão limpa a cada publicação (a branch gh-pages guarda só o site atual)
git([...CRED, 'push', '-f', REPO, 'gh-pages'])
rmSync('dist/.git', { recursive: true, force: true })
console.log('\nPublicado: https://powermino.github.io/julio-kshesek-96/  (pode levar 1–2 minutos para atualizar)')
