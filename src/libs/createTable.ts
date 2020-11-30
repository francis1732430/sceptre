import Promise from "thenfail";
const puppeteer = require('puppeteer');

const fs = require('fs');
const path = require('path');

const buildPaths = {
    buildPathHtml: path.resolve('./src/assets/build.html'),
    buildPathPdf: path.resolve('./src/assets/build.pdf')
 };

const createRow = (item, i) => `
  <tr>
    <td>${i + 1}. ${item.studentName} (${item.standardName} - ${item.sectionName}, ${item.subjectName})</td>
    <td>
    <img width="200" src=${item.barCodeUrl}>
    </td>
    <td>mark-</td>
  </tr>
`;

const createTable = (rows) => `
  <table>
    <tr>
        <th>Student Name</td>
        <th class="pl-38">Qr Code</td>
        <th class="pl-10">Mark</td>
    </tr>
    ${rows}
  </table>
`;

const createHtml = (table) => `
  <html>
    <head>
      <style>
        table {
          width: 100%;
        }
        tr {
          text-align: left;
          border: 1px solid black;
        }
        th, td {
          padding: 15px;
        }
        tr:nth-child(odd) {
          background: #CCC
        }
        tr:nth-child(even) {
          background: #FFF
        }
        .no-content {
          background-color: red;
        }
        .pl-38 {
            padding-left: 38px;
        }
        .pl-10 {
          padding-left: 10px;
        }
      </style>
    </head>
    <body>
      ${table}
    </body>
  </html>
`;

const doesFileExist = (filePath) => {
	try {
		fs.statSync(filePath); // get information of the specified file path.
		return true;
	} catch (error) {
		return false;
	}
};
export class GeneratePdf {
    constructor() {
    }
    public async createTable(data) {
      const vm = this;
        return new Promise(async function(resolve, reject) {
            try {
                console.log(buildPaths.buildPathHtml);
                /* Check if the file for `html` build exists in system or not */
                if (doesFileExist(buildPaths.buildPathHtml)) {
                    console.log('Deleting old build file');
                    /* If the file exists delete the file from system */
                    fs.unlinkSync(buildPaths.buildPathHtml);
                }
                /* generate rows */
                const rows = data.map(createRow).join('');
                /* generate table */
                const table = createTable(rows);
                /* generate html */
                const html = createHtml(table);
                /* write the generated html to file */
                await fs.writeFileSync(buildPaths.buildPathHtml, html);
                vm.generatepdf().then((pdf) => {
                    fs.writeFileSync(buildPaths.buildPathPdf, pdf);
                    resolve(true);
                });
                console.log('Succesfully created an HTML table');
            } catch (error) {
                console.log('Error generating table', error);
            }
         });
    }
    private generatepdf() {
        return new Promise(async function (resolve, reject) {
            console.log('Starting: Generating PDF Process, Kindly wait ..');
	/** Launch a headleass browser */
	const browser = await puppeteer.launch();
	/* 1- Ccreate a newPage() object. It is created in default browser context. */
	const page = await browser.newPage();
    /* 2- Will open our generated `.html` file in the new Page instance. */
	await page.goto(`file:${buildPaths.buildPathHtml}`, { waitUntil: 'networkidle0' });
	/* 3- Take a snapshot of the PDF */
	const pdf = await page.pdf({
		format: 'A4',
		margin: {
			top: '20px',
			right: '20px',
			bottom: '20px',
			left: '20px'
		}
	});
	/* 4- Cleanup: close browser. */
	await browser.close();
	console.log('Ending: Generating PDF Process');
	resolve(pdf);
        });
    }
}
export default new GeneratePdf();