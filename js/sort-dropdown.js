
class SortDropdown {
  constructor(rootEl, config = {}) {
    if (!rootEl) throw new Error("SortDropdown: root element is required");

    this.root = rootEl;
    this.options = config.options || [];
    this.defaultLabel = config.defaultLabel || "Sắp xếp theo";
    this.onChange = typeof config.onChange === "function" ? config.onChange : null;
    this.selectedValue = config.defaultValue || null;

    this.trigger = rootEl.querySelector("[data-sort-trigger]");
    this.labelEl = rootEl.querySelector("[data-sort-label]");
    this.chevronEl = rootEl.querySelector("[data-sort-chevron]");
    this.menu = rootEl.querySelector("[data-sort-menu]");
    this.optionEls = Array.from(rootEl.querySelectorAll("[data-sort-option]"));

    this.isOpen = false;
    this._bindEvents();
    this._syncUI();
  }

  _bindEvents() {
    this.trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.optionEls.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.select(btn.getAttribute("data-value"));
        this.close();
      });
    });

    document.addEventListener("click", (e) => {
      if (!this.root.contains(e.target)) this.close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.trigger.setAttribute("aria-expanded", "true");
    this.menu.classList.add("is-open");
    this.chevronEl.classList.add("is-open");
  }

  close() {
    this.isOpen = false;
    this.trigger.setAttribute("aria-expanded", "false");
    this.menu.classList.remove("is-open");
    this.chevronEl.classList.remove("is-open");
  }

  select(value) {
    this.selectedValue = value;
    this._syncUI();
    if (this.onChange) this.onChange(value, this.getSelectedOption());
  }

  getSelectedOption() {
    return this.options.find((o) => o.value === this.selectedValue) || null;
  }

  _syncUI() {
    const selected = this.getSelectedOption();
    this.labelEl.textContent = selected ? selected.label : this.defaultLabel;

    this.optionEls.forEach((btn) => {
      const isSelected = btn.getAttribute("data-value") === this.selectedValue;
      const check = btn.querySelector("[data-sort-check]");

      btn.classList.toggle("is-selected", isSelected);
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");

      if (check) check.classList.toggle("is-visible", isSelected);
    });
  }
}

window.SortDropdown = SortDropdown;
