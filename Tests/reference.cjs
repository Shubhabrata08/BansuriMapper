const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(process.argv[2], 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
// Execute the original calculation and rendering functions, with a minimal DOM
// sink. The implementation under test never supplies the expected values.
const elements = new Map();
const get = id => {
  if (!elements.has(id)) elements.set(id, { checked: false, textContent: '', hidden: false });
  return elements.get(id);
};
const context = { document: { getElementById: get } };
vm.createContext(context);
const end = source.indexOf("  el('thaatSelect').addEventListener");
const expose = `
  globalThis.reference = { thaats, swaras, roots, setMode: mode => notationMode = mode,
    getPitch, getRelativeInterval, getFingerSpec, getRegister, relativeDescription,
    displaySwar, renderDetail, select: key => selectedKey = key };
})();`;
vm.runInContext(source.slice(0, end) + expose, context);
const app = context.reference;
const cases = [];
const roots = Object.keys(app.roots);
for (const [thaat, keys] of Object.entries(app.thaats))
  for (const reference of roots)
    for (const flute of roots)
      for (const flats of [false, true])
        for (const alternate of [false, true]) {
          app.setMode(flats ? 'flats' : 'sharps');
          get('altPa').checked = alternate;
          for (const key of keys) {
            app.select(key);
            app.renderDetail(reference, flute);
            const pitch = app.getPitch(app.swaras[key], reference);
            const relative = app.getRelativeInterval(app.swaras[key], reference, flute);
            cases.push({ thaat, key, reference: app.roots[reference].pc, flute: app.roots[flute].pc,
              flats, alternate, name: app.swaras[key].name, subtitle: app.swaras[key].sub,
              token: app.displaySwar(key), pitch: pitch.note, midi: pitch.midi,
              frequency: pitch.frequency, relative, relativeText: app.relativeDescription(relative),
              pattern: get('fingeringCode').textContent, title: get('techniqueTitle').textContent,
              hint: get('techniqueText').textContent, canAlternate: !get('paToggleWrap').hidden });
          }
        }
fs.writeFileSync(process.argv[3], JSON.stringify({ thaats: app.thaats, cases }));
console.log(`Generated ${cases.length} reference cases from the original HTML.`);
