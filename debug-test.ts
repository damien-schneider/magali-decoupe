import { calculateMaxCirclesForAll } from './src/utils/circle-fitting';
import type { Circle } from './src/types/circle-fitter';

// Test case that should work but currently outputs 0 circles
const width = 250;
const height = 250;
const gapSize = 5;

const circles: Circle[] = [
  { diameter: 10, color: '#ff6b6b' },    // Small circle - this might be the issue
  { diameter: 60, color: '#4ecdc4' },   
  { diameter: 50, color: '#45b7d1' },   
  { diameter: 40, color: '#96ceb4' },   
];

console.log('=== DEBUG TEST: Small Circle Issue ===');
console.log('Container:', width, '×', height, 'cm');
console.log('Gap size:', gapSize, 'cm');
console.log('Circles:', circles.map(c => `${c.diameter}cm`).join(', '));
console.log('Expected: Should fit multiple circles, not 0');

const result = calculateMaxCirclesForAll({
  width,
  height,
  circlesToFit: circles,
  gapSize,
  options: {
    attempts: 10, // Lower attempts for faster debugging
  },
});

console.log('\n=== RESULT ===');
console.log('Total count:', result.totalCount);
console.log('By type:', result.circlesByType.map(c => 
  `${c.diameter}cm: ${c.count} circles`
).join(', '));

if (result.totalCount === 0) {
  console.log('\n❌ PROBLEM CONFIRMED: Algorithm outputs 0 circles');
  console.log('This confirms the bug you reported.');
} else {
  console.log('\n✅ No issue found - algorithm works correctly');
}

// Let's also test with just the small circle to isolate the problem
console.log('\n=== ISOLATED TEST: Just 10cm circle ===');
const smallCircleResult = calculateMaxCirclesForAll({
  width,
  height,
  circlesToFit: [{ diameter: 10, color: '#ff6b6b' }],
  gapSize,
  options: { attempts: 5 },
});

console.log('10cm circle alone result:', smallCircleResult.totalCount);

// Test with slightly larger small circles
console.log('\n=== ISOLATED TEST: 12cm circle ===');
const twelveCircleResult = calculateMaxCirclesForAll({
  width,
  height,
  circlesToFit: [{ diameter: 12, color: '#ff6b6b' }],
  gapSize,
  options: { attempts: 5 },
});

console.log('12cm circle alone result:', twelveCircleResult.totalCount);

// Test theoretical maximum
console.log('\n=== THEORETICAL ANALYSIS ===');
const tenCmRadius = 10 / 2;
const areaPerTenCmCircle = Math.PI * tenCmRadius * tenCmRadius + (Math.PI * tenCmRadius * tenCmRadius * 0.1); // rough spacing
const theoreticalMax = Math.floor((width * height) / areaPerTenCmCircle);
console.log('Theoretical maximum 10cm circles:', theoreticalMax);