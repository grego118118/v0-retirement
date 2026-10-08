const { execFileSync } = require('node:child_process')
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0')
const blocked = files.filter(file => {
  const name = file.split('/').pop()
  return /^(?:\.\d*env(?:\..*)?|env\.local.*)$/.test(name) &&
    !/^\.env\.(?:example|sample|template)$/.test(name)
})
if (blocked.length) {
  // Report filenames only; never read or emit credential contents.
  console.error('Credential-like files are tracked:', blocked.join(', '))
  process.exit(1)
}
console.log('Credential filename check passed')
