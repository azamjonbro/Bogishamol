/**
 * Yemxona ERP — Select & MultiSelect Utilities
 */

/**
 * Standardize an option into { value, label, disabled, icon, ...extra }
 */
export function normalizeOption(opt, valueKey = 'value', labelKey = 'label') {
  if (opt === null || opt === undefined) return { value: '', label: '' };
  if (typeof opt === 'string' || typeof opt === 'number') {
    return { value: opt, label: String(opt), raw: opt };
  }
  return {
    value: opt[valueKey] !== undefined ? opt[valueKey] : opt._id || opt.id,
    label: opt[labelKey] !== undefined ? opt[labelKey] : opt.name || String(opt.value),
    disabled: Boolean(opt.disabled),
    icon: opt.icon,
    badge: opt.badge,
    category: opt.category,
    raw: opt,
  };
}

/**
 * Filter an array of options by a search term across label and optional extra keys
 */
export function filterOptions(options = [], query = '', searchKeys = ['label', 'value']) {
  if (!query || !query.trim()) return options;
  const q = query.trim().toLowerCase();

  return options.filter((opt) => {
    const normalized = normalizeOption(opt);
    return searchKeys.some((key) => {
      const val = normalized[key] || (normalized.raw && normalized.raw[key]);
      return val && String(val).toLowerCase().includes(q);
    });
  });
}

/**
 * Toggle a value in a multi-select array (adds if missing, removes if present)
 */
export function toggleMultiSelect(currentValues = [], valueToToggle) {
  const arr = Array.isArray(currentValues) ? [...currentValues] : [];
  const idx = arr.findIndex((v) => v === valueToToggle);
  if (idx > -1) {
    arr.splice(idx, 1);
  } else {
    arr.push(valueToToggle);
  }
  return arr;
}

/**
 * Format human readable summary for MultiSelect trigger button
 */
export function formatMultiSelectSummary(selectedValues = [], options = [], placeholder = 'Tanlang...', maxLabels = 2) {
  if (!selectedValues || selectedValues.length === 0) {
    return placeholder;
  }

  const normalizedOptions = options.map((o) => normalizeOption(o));
  const selectedLabels = selectedValues
    .map((v) => {
      const found = normalizedOptions.find((opt) => opt.value === v);
      return found ? found.label : String(v);
    })
    .filter(Boolean);

  if (selectedLabels.length <= maxLabels) {
    return selectedLabels.join(', ');
  }

  return `${selectedLabels.slice(0, maxLabels).join(', ')} (+${selectedLabels.length - maxLabels} ta)`;
}

/**
 * Group flat options by a category key
 */
export function groupOptionsByCategory(options = [], categoryKey = 'category') {
  const groups = {};
  options.forEach((opt) => {
    const normalized = normalizeOption(opt);
    const cat = normalized[categoryKey] || (normalized.raw && normalized.raw[categoryKey]) || 'Boshqa';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(normalized);
  });
  return Object.entries(groups).map(([category, items]) => ({
    category,
    items,
  }));
}
