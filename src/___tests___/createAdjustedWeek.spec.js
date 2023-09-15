import {describe, test, expect} from "vitest";
import createAdjustedWeekArray from "../modules/utils/createAdjustedWeekArray";

describe("Create Adjusted Week Array", () =>{

    const tests = [
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
            expected: [0, 0, 0, 0, 0]
        },
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
                    "count": 0,
                },
                {
                    "date": "2023-09-16T10:00:00.000Z",
                    "count": 0
                },
                {"date": "2023-09-17T10:00:00.000Z",
                    "count": 0
                }],
            goal: 550,
            expected: [0, 0, 0, 0, 550]
        },
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
                    "count": 0,
                },
                {
                    "date": "2023-09-15",
                    "count": 0,
                },
                {
                    "date": "2023-09-16T10:00:00.000Z",
                    "count": 0
                },
                {"date": "2023-09-17T10:00:00.000Z",
                    "count": 0
                }],
            goal: 550,
            expected: [0, 0, 0, 550, 550]
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
                {"date": "2023-09-17T10:00:00.000Z",
                    "count": 0
                }],
            goal: 550,
            expected: [0, 0, 0, 0, 785]
        },
        {
            data: [
                {
                    "date": "2023-09-11",
                    "count": 12,
                },
                {
                    "date": "2023-09-12",
                    "count": 505,
                },
                {
                    "date": "2023-09-13",
                    "count": 16,
                },
                {
                    "date": "2023-09-14",
                    "count": 0,
                },
                {
                    "date": "2023-09-15",
                    "count": 0,
                },
                {
                    "date": "2023-09-16T10:00:00.000Z",
                    "count": 0
                },
                {"date": "2023-09-17T10:00:00.000Z",
                    "count": 0
                }],
            goal: 550,
            expected: [0, 0, 0, 1108.5, 1108.5]
        },
    ]

    test.each(tests)("Given $goal expect $expected", ({data, goal, expected}) => {
        expect(createAdjustedWeekArray(data, goal)).toEqual(expected);
    })
})