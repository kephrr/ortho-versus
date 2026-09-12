import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import type { ValidatedAudioSample } from '@app/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const OUTPUT_DIR = path.resolve(__dirname, '../../output');
export const CATALOG_PATH = path.join(OUTPUT_DIR, 'catalog.json');

export function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

export function loadCatalog(): ValidatedAudioSample[] {
  if (!fs.existsSync(CATALOG_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(CATALOG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveToCatalog(sample: ValidatedAudioSample) {
  ensureOutputDir();
  const catalog = loadCatalog();
  
  // Éviter les doublons exacts basés sur le transcript cible ET sur le même id
  const filtered = catalog.filter((s) => s.id !== sample.id && s.targetTranscript !== sample.targetTranscript);
  
  // Si le prompt veut éviter littéralement de garder plusieurs segments d'une sourceUrl
  // on pourrait filtrer '(s) => s.sourceUrl !== sample.sourceUrl', 
  // mais cela empêcherait le paramètre `-m 2` de marcher (le 2ème segment écraserait le 1er).
  // Donc la fusion sans doublon s'entend par la combinaison (source, contenu).

  filtered.push(sample);

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
  console.log(`[Catalog] Modifié/Ajouté l'échantillon ${sample.id} dans catalog.json`);
}
