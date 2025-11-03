import { describe, it, expect } from 'vitest';
import { calculateMaxCirclesForAll } from '../src/utils/circle-fitting';

describe('First Placement Debug', () => {
  it('should debug what happens with just one circle type in the sequence', () => {
    const width = 250;
    const height = 250;
    const gapSize = 5;

    console.log('\n=== DEBUGGING FIRST PLACEMENT ATTEMPT ===');

    // Test with just 1 circle type to see if first placement works
    const result1 = calculateMaxCirclesForAll({
      width,
      height,
      circlesToFit: [{ diameter: 10, color: '#ff6b6b' }],
      gapSize,
      options: { attempts: 1, timeoutMs: 1000 },
    });

    console.log('Single 10cm circle result:', result1.totalCount);

    // Test with 2 circle types
    const result2 = calculateMaxCirclesForAll({
      width,
      height,
      circlesToFit: [
        { diameter: 10, color: '#ff6b6b' },
        { diameter: 40, color: '#96ceb4' }
      ],
      gapSize,
      options: { attempts: 1, timeoutMs: 1000 },
    });

    console.log('Mixed 10cm+40cm result:', result2.totalCount);

    // Test the specific case from the original bug report
    const originalBugCase = calculateMaxCirclesForAll({
      width,
      height,
      circlesToFit: [
        { diameter: 10, color: '#ff6b6b' },
        { diameter: 60, color: '#4ecdc4' },
        { diameter: 50, color: '#45b7d1' },
        { diameter: 40, color: '#96ceb4' }
      ],
      gapSize,
      options: { attempts: 1, timeoutMs: 1000 },
    });

    console.log('Original bug case result:', originalBugCase.totalCount);

    // The single circle case should definitely work
    expect(result1.totalCount).toBeGreaterThan(0);
  });
});