document.addEventListener('DOMContentLoaded', () => {
    new SpreadSheet(50, 50);
});

class SpreadSheet {
    constructor(rows, cols) {
        this.exportBtnEl = document.getElementById('export-btn');
        this.focusedCellNameEl = document.getElementById('focused-cell-name');
        this.spreadsheetEl = document.getElementById('spreadsheet');
        this.rows = rows;
        this.cols = cols;

        this.exportBtnEl.addEventListener('click', () => {
            this.export();
        });

        this.initSheet();
    }

    initSheet() {
        const headerRowEl = this.createRowEl();

        const cornerHeaderCell = new HeaderCell();
        this.columnHeaderCells = this.createColumnHeaderCells();

        headerRowEl.append(
            cornerHeaderCell.element,
            ...this.columnHeaderCells.map(cell => cell.element),
        );

        this.spreadsheetEl.append(headerRowEl);

        this.rowHeaderCells = [];
        this.textCells = [];

        for (let i = 0; i < this.rows; ++i) {
            const rowEl = this.createRowEl();

            const rowHeaderCell = new HeaderCell(this.getRowName(i));
            this.rowHeaderCells.push(rowHeaderCell);
            rowEl.append(rowHeaderCell.element);

            const textCellsRow = [];

            for (let j = 0; j < this.cols; ++j) {
                const textCell = new TextCell(i, j);
                textCellsRow.push(textCell);
                rowEl.append(textCell.element);

                textCell.element.addEventListener('focus', () => {
                    const rowHeaderCell = this.rowHeaderCells[textCell.row];
                    const columnHeaderCell = this.columnHeaderCells[textCell.col];

                    rowHeaderCell.element.classList.add('active');
                    columnHeaderCell.element.classList.add('active');
                    this.focusedCellNameEl.textContent = columnHeaderCell.name + rowHeaderCell.name;
                });
                textCell.element.addEventListener('focusout', () => {
                    this.rowHeaderCells[textCell.row].element.classList.remove('active');
                    this.columnHeaderCells[textCell.col].element.classList.remove('active');
                    this.focusedCellNameEl.textContent = '';
                });
            }

            this.textCells.push(textCellsRow);
            this.spreadsheetEl.append(rowEl);
        }
    }

    createRowEl() {
        const rowEl = document.createElement('div');
        rowEl.classList.add('row');
        return rowEl;
    }

    createColumnHeaderCells() {
        const cells = [];
        for (let i = 0; i < this.cols; ++i) {
            const cell = new HeaderCell(this.getColumnName(i));
            cells.push(cell);
        }
        return cells;
    }

    getRowName(rowNum) {
        return String(rowNum + 1);
    }
  
    getColumnName(columnNum) {
        const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const base = alphabets.length;

        let name = alphabets.charAt(columnNum % base);
        columnNum = Math.floor(columnNum / base);

        while (columnNum > base) {
            let divider = base;
            if (Math.floor(columnNum / (base + 1)) <= base) {
               divider = base + 1;
            }

            name = alphabets.charAt(columnNum % divider) + name;
            columnNum = Math.floor(columnNum / divider);
        }

        if (columnNum >= 1) {
            name = alphabets.charAt(columnNum - 1) + name;
        }
        return name;
    }

    export() {
        const csv = this.textCells.reduce((csv, textCellsRow) => {
            return csv += 
                    textCellsRow
                    .map(cell => cell.content)
                    .join(',') + "\r\n";
        }, '');

        const csvObj = new Blob([csv]);
        console.log('csvObj', csvObj);

        const csvUrl = URL.createObjectURL(csvObj);
        console.log('csvUrl', csvUrl);

        const a = document.createElement("a");
        a.href = csvUrl;
        a.download = `spreadsheet_${Date.now()}.csv`;
        a.click();
    }
}

class HeaderCell {
    constructor(name) {
        this.name = name;
        this.element = this.createCellEl();

    }

    createCellEl() {
        const headerCellEl = document.createElement('div');
        headerCellEl.classList.add('cell', 'header-cell');
        headerCellEl.textContent = this.name ?? '';
        return headerCellEl;
    }
}

class TextCell {
    constructor(rowNum, columnNum) {
        this.row = rowNum;
        this.col = columnNum;
        this.content = '';
        
        this.element = this.createCellEl();
    }

    createCellEl() {
        const cellEl = document.createElement('input');
        cellEl.classList.add('cell', 'text-cell');
        cellEl.type = 'text';
        cellEl.addEventListener('input', () => {
            this.content = cellEl.value;
        })
        return cellEl;
    }

}