const fs = require('fs');
const path = 'e:/akash_workspace/projects/fullstack/cms/src/context/CMSContext.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace from const INITIAL_COMPLAINTS down to export const CMSProvider
const startIdx = content.indexOf('const INITIAL_COMPLAINTS = [');
const endIdx = content.indexOf('export const CMSProvider = ({ children }) => {');

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = 'export const INITIAL_COMPLAINTS = [];\nexport const INITIAL_ROLE_REQUESTS = [];\n\n';
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  console.log('Successfully replaced INITIAL_COMPLAINTS and INITIAL_ROLE_REQUESTS');
} else {
  console.error('Could not find markers for INITIAL_COMPLAINTS');
}

fs.writeFileSync(path, content, 'utf8');
