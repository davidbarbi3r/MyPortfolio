import type { AnchorName, SlotName } from '../types';
import { registerEyes } from './eyes';
import { registerIrises } from './irises';
import { registerBrows } from './brows';
import { registerNose } from './nose';
import { registerMouth } from './mouth';
import { registerEars } from './ears';
import { registerHair } from './hair';
import { registerFacialHair } from './facial-hair';
import { registerGlasses } from './glasses';
import { registerHeadwear } from './headwear';
import { registerWrinkles } from './wrinkles';
import { registerFreckles } from './freckles';
import { registerNeck } from './neck';

/** Which anchors a slot is drawn on. Slots listing one anchor but needing more
 *  (wrinkles, glasses, freckles) reach the rest through FeatureEnv.frameAt. */
export const SLOT_ANCHORS: Record<SlotName, AnchorName[]> = {
  eyes: ['eyeL', 'eyeR'],
  irises: ['eyeL', 'eyeR'],
  brows: ['browL', 'browR'],
  nose: ['noseTip'],
  mouth: ['mouth'],
  ears: ['earL', 'earR'],
  hair: ['hairline'],
  facialHair: ['mouth'],
  glasses: ['noseRoot'],
  headwear: ['hairline'],
  wrinkles: ['foreheadL'],
  freckles: ['cheekL'],
  neck: ['neck'],
};

/** Generation order. Fixed, because tag coherence flows forward through it. */
export const PICK_ORDER: SlotName[] = [
  'hair',
  'eyes',
  'irises',
  'brows',
  'nose',
  'mouth',
  'ears',
  'facialHair',
  'wrinkles',
  'freckles',
  'glasses',
  'headwear',
  'neck',
];

/** Draw order. Layers still dominate; this only breaks ties within a layer. */
export const DRAW_ORDER: SlotName[] = [
  'neck',
  'ears',
  'eyes',
  'irises',
  'brows',
  'nose',
  'mouth',
  'wrinkles',
  'freckles',
  'facialHair',
  'hair',
  'headwear',
  'glasses',
];

let registered = false;

export function registerAllFeatures(): void {
  if (registered) return;
  registerEyes();
  registerIrises();
  registerBrows();
  registerNose();
  registerMouth();
  registerEars();
  registerHair();
  registerFacialHair();
  registerGlasses();
  registerHeadwear();
  registerWrinkles();
  registerFreckles();
  registerNeck();
  registered = true;
}

export * from './registry';
