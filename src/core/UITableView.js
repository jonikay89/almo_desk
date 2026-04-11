import UIScrollView from './UIScrollView.js';
import UIColor from './UIColor.js';

class UITableView extends UIScrollView {
    constructor(style = 'plain') {
        super();
        this.style = style;
        this.delegate = null;
        this.dataSource = null;
        this.rowHeight = 44;
        this.sectionHeaderHeight = 30;
        this.sectionFooterHeight = 0;
        this.separatorStyle = 'singleLine';
        this.separatorColor = UIColor.lightGray();
        this.separatorInset = { top: 0, right: 0, bottom: 0, left: 0 };
        this.allowsSelection = true;
        this.allowsMultipleSelection = false;
        this.editing = false;
        this._data = [];
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-tableview';
        this.element.style.position = 'relative';
        this.element.style.overflow = 'auto';

        this.contentElement = document.createElement('div');
        this.contentElement.style.position = 'relative';
        this.contentElement.style.minWidth = '100%';
        this.contentElement.style.minHeight = '100%';

        this.element.appendChild(this.contentElement);

        this.#setupEventListeners();

        return this;
    }

    #setupEventListeners() {
        this.element.addEventListener('click', (e) => {
            const row = e.target.closest('.ui-tableview-cell');
            if (row && this.delegate && !this.editing) {
                const index = parseInt(row.dataset.index, 10);
                const section = parseInt(row.dataset.section, 10) || 0;
                
                if (this.delegate && typeof this.delegate.tableViewDidSelectRowAt === 'function') {
                    this.delegate.tableViewDidSelectRowAt(this, index, section);
                }
            }
        });
    }

    reloadData() {
        if (!this.dataSource) return;

        this.contentElement.innerHTML = '';

        const numberOfSections = this.dataSource.numberOfSectionsInTableView ? 
            this.dataSource.numberOfSectionsInTableView(this) : 1;

        let currentY = 0;

        for (let section = 0; section < numberOfSections; section++) {
            const numberOfRows = this.dataSource.tableView_numberOfRowsInSection(this, section);

            if (this.delegate && typeof this.delegate.tableView_titleForHeaderInSection === 'function') {
                const headerTitle = this.delegate.tableView_titleForHeaderInSection(this, section);
                if (headerTitle) {
                    const header = this.#createSectionHeader(headerTitle);
                    header.style.top = `${currentY}px`;
                    this.contentElement.appendChild(header);
                    currentY += this.sectionHeaderHeight;
                }
            }

            for (let row = 0; row < numberOfRows; row++) {
                const cell = this.dataSource.tableView_cellForRowAt(this, row, section);
                cell.init();
                cell.setFrame(0, currentY, this.frame.width, this.rowHeight);
                cell.element.dataset.index = row;
                cell.element.dataset.section = section;
                cell.element.classList.add('ui-tableview-cell');
                this.contentElement.appendChild(cell.element);
                currentY += this.rowHeight;
            }

            if (this.delegate && typeof this.delegate.tableView_titleForFooterInSection === 'function') {
                const footerTitle = this.delegate.tableView_titleForFooterInSection(this, section);
                if (footerTitle) {
                    const footer = this.#createSectionFooter(footerTitle);
                    footer.style.top = `${currentY}px`;
                    this.contentElement.appendChild(footer);
                    currentY += this.sectionFooterHeight;
                }
            }
        }

        this.setContentSize(this.frame.width, currentY);
    }

    #createSectionHeader(title) {
        const header = document.createElement('div');
        header.className = 'ui-tableview-section-header';
        header.style.position = 'absolute';
        header.style.left = '0';
        header.style.right = '0';
        header.style.height = `${this.sectionHeaderHeight}px`;
        header.style.backgroundColor = UIColor.colorWithWhiteAlpha(0.95, 1).css;
        header.style.borderBottom = '1px solid #ddd';
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.paddingLeft = '16px';
        header.style.fontSize = '13px';
        header.style.fontWeight = '600';
        header.style.color = '#666';
        header.textContent = title;
        return header;
    }

    #createSectionFooter(title) {
        const footer = document.createElement('div');
        footer.className = 'ui-tableview-section-footer';
        footer.style.position = 'absolute';
        footer.style.left = '0';
        footer.style.right = '0';
        footer.style.height = `${this.sectionFooterHeight}px`;
        footer.style.backgroundColor = UIColor.colorWithWhiteAlpha(0.95, 1).css;
        footer.style.borderTop = '1px solid #ddd';
        footer.style.display = 'flex';
        footer.style.alignItems = 'center';
        footer.style.paddingLeft = '16px';
        footer.style.fontSize = '12px';
        footer.style.color = '#888';
        footer.textContent = title;
        return footer;
    }

    dequeueReusableCellWithIdentifier(identifier) {
        const cached = this.reusableCells?.[identifier];
        if (cached) {
            return cached;
        }
        return null;
    }

    selectRowAtIndexPath(index, animated, scrollPosition) {
        const cells = this.contentElement.querySelectorAll('.ui-tableview-cell');
        const targetCell = cells[index];
        if (targetCell) {
            targetCell.classList.add('selected');
            if (scrollPosition === 'middle') {
                targetCell.scrollIntoView({ block: 'center', behavior: animated ? 'smooth' : 'auto' });
            }
        }
    }

    deselectRowAtIndexPath(index, animated) {
        const cells = this.contentElement.querySelectorAll('.ui-tableview-cell');
        const targetCell = cells[index];
        if (targetCell) {
            targetCell.classList.remove('selected');
        }
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.contentElement) {
            this.contentElement.style.width = `${this.frame.width}px`;
        }
    }
}

export default UITableView;