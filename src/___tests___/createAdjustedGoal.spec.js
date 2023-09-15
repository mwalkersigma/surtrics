import {describe, test, expect} from "vitest";
import createAdjustedGoal from "../modules/utils/createAdjustedDailyGoal";





describe('some tests', () => {
    let tests = [
        {
            data: [
                {
                    "date": "2023-09-11",
                    "count": 550,
                },
                {
                    "date": "2023-09-12",
                    "count": 550,
                },
                {
                    "date": "2023-09-13",
                    "count": 550,
                },
                {
                    "date": "2023-09-14",
                    "count": 550,
                },
                {
                    "date": "2023-09-15",
                    "count": 550,
                },
                {
                    "date": "2023-09-16T10:00:00.000Z",
                    "count": 0
                },
                {"date": "2023-09-17T10:00:00.000Z",
                    "count": 0
                }],
            goal: 550,
            expected: 0
        },
        {
            data: [
                {
                    "date": "2023-09-11",
                    "count": 448,
                },
                {
                    "date": "2023-09-12",
                    "count": 505,
                },
                {
                    "date": "2023-09-13",
                    "count": 395,
                },
                {
                    "date": "2023-09-14",
                    "count": 528,
                },
                {
                    "date": "2023-09-15",
                    "count": 89,
                },
                {
                    "date": "2023-09-16T10:00:00.000Z",
                    "count": 0
                },
                {
                    "date": "2023-09-17T10:00:00.000Z",
                    "count": 0
                }],
            goal: 550,
            expected: 785
        },
        {
            data: [
                {
                    "date": "2023-09-11",
                    "count": 448,
                },
                {
                    "date": "2023-09-12",
                    "count": 505,
                },
                {
                    "date": "2023-09-13",
                    "count": 0,
                },
                {
                    "date": "2023-09-14",
                    "count": 528,
                },
                {
                    "date": "2023-09-15",
                    "count": 89,
                },
                {
                    "date": "2023-09-16T10:00:00.000Z",
                    "count": 0
                },
                {
                    "date": "2023-09-17T10:00:00.000Z",
                    "count": 0
                }],
            goal: 550,
            expected: 1180
        },
    ]
    test.each(tests)(`Should return $expected when given $goal`,
        ({data, goal, expected}) => {
            expect(createAdjustedGoal(data, goal)).toBe(expected);
        })
});