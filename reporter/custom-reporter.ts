import {
    Reporter,
    TestCase,
    TestResult,
    FullResult
} from '@playwright/test/reporter';

import * as fs from 'fs';
import * as path from 'path';

interface TestRecord {
    title: string;
    file: string;
    status: string;
    duration: number;
    error: string;
}

export default class CustomReporter implements Reporter {

    private tests: TestRecord[] = [];

    onTestEnd(
        test: TestCase,
        result: TestResult
    ) {
        let errorMessage = '';

        if (result.error) {
            errorMessage =
                result.error.message ||
                result.error.stack ||
                'Unknown error';
        }

        this.tests.push({
            title: test.title,
            file: path.relative(
                process.cwd(),
                test.location.file
            ),
            status: result.status,
            duration: result.duration,
            error: errorMessage
        });
    }

    async onEnd(
        result: FullResult
    ) {

        const reportDirectory =
            path.join(
                process.cwd(),
                'custom-report'
            );

        fs.mkdirSync(
            reportDirectory,
            {
                recursive: true
            }
        );

        const reportPath =
            path.join(
                reportDirectory,
                'index.html'
            );

        const passed =
            this.tests.filter(
                test =>
                    test.status === 'passed'
            ).length;

        const failed =
            this.tests.filter(
                test =>
                    test.status === 'failed'
            ).length;

        const skipped =
            this.tests.filter(
                test =>
                    test.status === 'skipped'
            ).length;

        const total =
            this.tests.length;

        const passPercentage =
            total === 0
                ? 0
                : Math.round(
                    (passed / total) * 100
                );

        const overallStatus =
            result.status === 'passed'
                ? 'PASSED'
                : 'FAILED';

        const statusClass =
            result.status === 'passed'
                ? 'passed'
                : 'failed';

        const generatedAt =
            new Date().toLocaleString();

        const testRows =
            this.tests
                .map(
                    test => {

                        const duration =
                            (
                                test.duration /
                                1000
                            ).toFixed(2);

                        const testStatus =
                            test.status
                                .toUpperCase();

                        const rowClass =
                            test.status === 'passed'
                                ? 'row-passed'
                                : test.status === 'failed'
                                    ? 'row-failed'
                                    : 'row-skipped';

                        const errorHtml =
                            test.error
                                ? `
                                    <details class="error-box">
                                        <summary>
                                            View error
                                        </summary>
                                        <pre>${this.escapeHtml(
                                            test.error
                                        )}</pre>
                                    </details>
                                  `
                                : '<span class="no-error">—</span>';

                        return `
                            <tr class="${rowClass}">

                                <td>
                                    <div class="test-name">
                                        ${this.escapeHtml(
                                            test.title
                                        )}
                                    </div>

                                    <div class="test-file">
                                        ${this.escapeHtml(
                                            test.file
                                        )}
                                    </div>
                                </td>

                                <td>
                                    <span class="status ${test.status}">
                                        ${testStatus}
                                    </span>
                                </td>

                                <td>
                                    ${duration}s
                                </td>

                                <td>
                                    ${errorHtml}
                                </td>

                            </tr>
                        `;
                    }
                )
                .join('');

        const html = `
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        ParaBank Automation Dashboard
    </title>

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;

            font-family:
                Inter,
                Segoe UI,
                Arial,
                sans-serif;

            color: #ffffff;

            background:
                radial-gradient(
                    circle at top left,
                    rgba(244, 128, 49, 0.20),
                    transparent 30%
                ),
                radial-gradient(
                    circle at bottom right,
                    rgba(244, 128, 49, 0.12),
                    transparent 35%
                ),
                #0b0f17;
        }

        .container {
            width: 92%;
            max-width: 1400px;

            margin:
                0 auto;

            padding:
                50px 0;
        }

        .header {
            display: flex;

            justify-content:
                space-between;

            align-items:
                center;

            margin-bottom:
                35px;
        }

        .brand h1 {
            margin: 0;

            font-size:
                34px;

            font-weight:
                700;
        }

        .brand h1 span {
            color:
                #F48031;
        }

        .brand p {
            margin-top:
                8px;

            color:
                #9ca3af;

            font-size:
                14px;
        }

        .overall-status {
            padding:
                12px 22px;

            border-radius:
                999px;

            font-weight:
                700;

            letter-spacing:
                0.5px;
        }

        .overall-status.passed {
            color:
                #F48031;

            border:
                1px solid #F48031;

            background:
                rgba(244, 128, 49, 0.12);

            box-shadow:
                0 0 20px
                rgba(244, 128, 49, 0.15);
        }

        .overall-status.failed {
            color:
                #ff6b6b;

            border:
                1px solid #ff6b6b;

            background:
                rgba(255, 107, 107, 0.10);
        }

        .cards {
            display:
                grid;

            grid-template-columns:
                repeat(4, 1fr);

            gap:
                20px;

            margin-bottom:
                30px;
        }

        .card {
            padding:
                24px;

            border:
                1px solid
                rgba(255, 255, 255, 0.10);

            border-radius:
                18px;

            background:
                rgba(255, 255, 255, 0.055);

            backdrop-filter:
                blur(18px);

            -webkit-backdrop-filter:
                blur(18px);

            box-shadow:
                0 15px 40px
                rgba(0, 0, 0, 0.25);
        }

        .card-label {
            color:
                #9ca3af;

            font-size:
                13px;

            text-transform:
                uppercase;

            letter-spacing:
                1px;
        }

        .card-value {
            margin-top:
                10px;

            font-size:
                32px;

            font-weight:
                700;
        }

        .card-value.pass {
            color:
                #F48031;
        }

        .card-value.fail {
            color:
                #ff6b6b;
        }

        .dashboard {
            padding:
                24px;

            border:
                1px solid
                rgba(255, 255, 255, 0.10);

            border-radius:
                20px;

            background:
                rgba(255, 255, 255, 0.045);

            backdrop-filter:
                blur(18px);

            -webkit-backdrop-filter:
                blur(18px);

            box-shadow:
                0 20px 60px
                rgba(0, 0, 0, 0.30);
        }

        .dashboard-header {
            display:
                flex;

            justify-content:
                space-between;

            align-items:
                center;

            margin-bottom:
                20px;
        }

        .dashboard-header h2 {
            margin: 0;

            font-size:
                20px;
        }

        .generated {
            color:
                #9ca3af;

            font-size:
                12px;
        }

        .table-wrapper {
            overflow-x:
                auto;
        }

        table {
            width:
                100%;

            border-collapse:
                collapse;
        }

        th {
            text-align:
                left;

            padding:
                16px;

            color:
                #F48031;

            font-size:
                12px;

            text-transform:
                uppercase;

            letter-spacing:
                1px;

            border-bottom:
                1px solid
                rgba(255, 255, 255, 0.10);
        }

        td {
            padding:
                18px 16px;

            border-bottom:
                1px solid
                rgba(255, 255, 255, 0.06);

            vertical-align:
                top;

            font-size:
                14px;
        }

        tr:last-child td {
            border-bottom:
                none;
        }

        .test-name {
            font-weight:
                600;

            margin-bottom:
                5px;
        }

        .test-file {
            color:
                #6b7280;

            font-size:
                12px;
        }

        .status {
            display:
                inline-block;

            padding:
                6px 11px;

            border-radius:
                999px;

            font-size:
                11px;

            font-weight:
                700;

            letter-spacing:
                0.5px;
        }

        .status.passed {
            color:
                #F48031;

            border:
                1px solid #F48031;

            background:
                rgba(244, 128, 49, 0.10);
        }

        .status.failed {
            color:
                #ff6b6b;

            border:
                1px solid
                rgba(255, 107, 107, 0.5);

            background:
                rgba(255, 107, 107, 0.08);
        }

        .status.skipped {
            color:
                #9ca3af;

            border:
                1px solid
                rgba(156, 163, 175, 0.4);

            background:
                rgba(156, 163, 175, 0.08);
        }

        .error-box {
            max-width:
                500px;
        }

        .error-box summary {
            cursor:
                pointer;

            color:
                #ff6b6b;

            font-size:
                12px;
        }

        .error-box pre {
            white-space:
                pre-wrap;

            word-break:
                break-word;

            margin-top:
                10px;

            padding:
                12px;

            border-radius:
                10px;

            background:
                rgba(0, 0, 0, 0.30);

            color:
                #d1d5db;

            font-size:
                11px;

            line-height:
                1.5;
        }

        .no-error {
            color:
                #6b7280;
        }

        .footer {
            margin-top:
                25px;

            text-align:
                center;

            color:
                #6b7280;

            font-size:
                12px;
        }

        @media (
            max-width: 900px
        ) {

            .cards {
                grid-template-columns:
                    repeat(2, 1fr);
            }

            .header {
                align-items:
                    flex-start;

                flex-direction:
                    column;

                gap:
                    20px;
            }
        }

        @media (
            max-width: 550px
        ) {

            .cards {
                grid-template-columns:
                    1fr;
            }

            .container {
                width:
                    94%;
            }
        }

    </style>

</head>

<body>

    <div class="container">

        <header class="header">

            <div class="brand">

                <h1>
                    ParaBank
                    <span>Automation</span>
                </h1>

                <p>
                    Playwright Test Execution Dashboard
                </p>

            </div>

            <div
                class="overall-status ${statusClass}"
            >
                ${overallStatus}
            </div>

        </header>


        <section class="cards">

            <div class="card">

                <div class="card-label">
                    Total Tests
                </div>

                <div class="card-value">
                    ${total}
                </div>

            </div>


            <div class="card">

                <div class="card-label">
                    Passed
                </div>

                <div class="card-value pass">
                    ${passed}
                </div>

            </div>


            <div class="card">

                <div class="card-label">
                    Failed
                </div>

                <div class="card-value fail">
                    ${failed}
                </div>

            </div>


            <div class="card">

                <div class="card-label">
                    Pass Rate
                </div>

                <div class="card-value pass">
                    ${passPercentage}%
                </div>

            </div>

        </section>


        <section class="dashboard">

            <div class="dashboard-header">

                <h2>
                    Test Execution Details
                </h2>

                <div class="generated">
                    Generated:
                    ${this.escapeHtml(generatedAt)}
                </div>

            </div>


            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Test
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Duration
                            </th>

                            <th>
                                Details
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${testRows}

                    </tbody>

                </table>

            </div>

        </section>


        <div class="footer">

            ParaBank QA Automation Framework
            • Playwright + TypeScript

        </div>

    </div>

</body>

</html>
`;

        fs.writeFileSync(
            reportPath,
            html,
            'utf-8'
        );

        console.log('');
        console.log(
            '========================================'
        );

        console.log(
            'Custom report generated successfully.'
        );

        console.log(
            `Report: ${reportPath}`
        );

        console.log(
            '========================================'
        );
    }

    private escapeHtml(
        value: string
    ): string {

        return value
            .replace(
                /&/g,
                '&amp;'
            )
            .replace(
                /</g,
                '&lt;'
            )
            .replace(
                />/g,
                '&gt;'
            )
            .replace(
                /"/g,
                '&quot;'
            )
            .replace(
                /'/g,
                '&#039;'
            );
    }
}