import {describe, expect,it} from "vitest";
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
            expected: [0, 0, 0, 0, 0]
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
            expected: [0, 0, 0, 558.5, 558.5]
        },
        {
            data: [
                {
                    "date": "2023-09-11",
                    "count": 550,
                },
                {
                    "date": "2023-09-12",
                    "count": 0,
                },
                {
                    "date": "2023-09-13",
                    "count": 0,
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
            expected: [0, 0, 0, 0, 0]
        },
        {
            data: [
                {
                    "date": "2023-09-11",
                    "count": 150,
                },
                {
                    "date": "2023-09-12",
                    "count": 0,
                },
                {
                    "date": "2023-09-13",
                    "count": 0,
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
            expected: [0, 100, 100, 100, 100]
        },
        {
            data: [
                {
                    "date": "2023-09-11",
                    "count": 404,
                },
                {
                    "date": "2023-09-12",
                    "count": 0,
                },
                {
                    "date": "2023-09-13",
                    "count": 0,
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
            goal: 500,
            expected: [0, 24, 24, 24, 24]
        },
    ]
    tests.forEach(({data,goal,expected}) => {
      it(`Given A goal of : ${goal} and the following data : ${data.map(item=>item.count)} expect ${expected}`, () => {
        expect(createAdjustedWeekArray(data, goal)).toEqual(expected);
      })
    })
})