import { describe, it, expect } from 'vitest';
import { calculateMaxCirclesForAll } from '../src/utils/circle-fitting';
import type { Circle } from '../src/types/circle-fitter';

describe('Small Circle Debug Analysis', () => {
  it('should debug the exact failure point', () => {
    const width = 250;
    const height = 250;
    const gapSize = 5;

    // Step by step analysis
    const testCases = [
      {
        name: 'Only 10cm circles',
        circles: [{ diameter: 10, color: '#ff6b6b' }],
        expected: 'Should work'
      },
      {
        name: 'Only 40cm circles', 
        circles: [{ diameter: 40, color: '#96ceb4' }],
        expected: 'Should work'
      },
      {
        name: '10cm + 40cm (small difference)',
        circles: [
          { diameter: 10, color: '#ff6b6b' },
          { diameter: 40, color: '#96ceb4' }
        ],
        expected: 'May work'
      },
      {
        name: '10cm + 60cm (large difference)',
        circles: [
          { diameter: 10, color: '#ff6b6b' },
          { diameter: 60, color: '#4ecdc4' }
        ],
        expected: 'Might fail'
      },
      {
        name: '10cm + 50cm + 40cm',
        circles: [
          { diameter: 10, color: '#ff6b6b' },
          { diameter: 50, color: '#45b7d1' },
          { diameter: 40, color: '#96ceb4' }
        ],
        expected: 'Unknown'
      },
      {
        name: 'Full problem case: 10+60+50+40',
        circles: [
          { diameter: 10, color: '#ff6b6b' },
          { diameter: 60, color: '#4ecdc4' },
          { diameter: 50, color: '#45b7d1' },
          { diameter: 40, color: '#96ceb4' }
        ],
        expected: 'FAILS'
      }
    ];

    console.log('\n=== DEBUGGING SMALL CIRCLE FAILURE ===');

    for (const testCase of testCases) {
      const result = calculateMaxCirclesForAll({
        width,
        height,
        circlesToFit: testCase.circles,
        gapSize,
        options: { attempts: 3 }, // Quick test
      });

      const status = result.totalCount > 0 ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${testCase.name}: ${result.totalCount} circles`);
      
      if (result.circlesByType) {
        const breakdown = result.circlesByType
          .map(c => `${c.diameter}cm: ${c.count}`)
          .join(', ');
        console.log(`   Breakdown: ${breakdown}`);
      }

      // If this test case fails but shouldn't, we found the issue
      if (result.totalCount === 0 && testCase.expected !== 'FAILS') {
        console.log(`   🚨 ISSUE FOUND: ${testCase.name} failed but was expected to ${testCase.expected}`);
      }
    }

    // The main test case should still fail for now
    const mainResult = calculateMaxCirclesForAll({
      width,
      height,
      circlesToFit: [
        { diameter: 10, color: '#ff6b6b' },
        { diameter: 60, color: '#4ecdc4' },
        { diameter: 50, color: '#45b7d1' },
        { diameter: 40, color: '#96ceb4' }
      ],
      gapSize,
      options: { attempts: 3 },
    });

    expect(mainResult.totalCount).toBeGreaterThan(0); // This will fail, showing the specific issue
  });
});