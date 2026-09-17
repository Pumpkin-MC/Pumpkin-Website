(function () {
  "use strict";

  const REPO = "Pumpkin-MC/Pumpkin";
  const STATUS = {
    done: { label: "Implemented", icon: "fa-solid fa-circle-check" },
    partial: { label: "Partial", icon: "fa-solid fa-circle-half-stroke" },
    planned: { label: "Missing", icon: "fa-regular fa-circle" },
  };

  let data = null;
  const state = { category: null, status: "all", query: "", open: new Set() };

  const $ = (id) => document.getElementById(id);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  // Escapes, then turns `code` spans into <code>.
  function inline(s) {
    return escapeHtml(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function pct(n, total) {
    return total ? Math.round((n / total) * 100) : 0;
  }

  function entryKey(entry) {
    return `${entry.cat}:${entry.id}`;
  }

  function currentCategory() {
    if (state.category === "all") return data.all;
    return data.categories.find((c) => c.id === state.category) || data.all;
  }

  function counts(entries) {
    const c = { done: 0, partial: 0, planned: 0 };
    for (const e of entries) c[e.status] = (c[e.status] || 0) + 1;
    return c;
  }

  // ---------- Rendering ----------

  function renderTabs() {
    $("category-tabs").innerHTML = [data.all, ...data.categories]
      .map(
        (c) => `
        <button type="button" class="control-btn ${c.id === state.category ? "active" : ""}" role="tab" data-category="${c.id}" aria-selected="${c.id === state.category}">
          <i class="fa-solid ${c.icon}"></i> ${escapeHtml(c.label)}
          <span class="count">${c.entries.length}</span>
        </button>`,
      )
      .join("");
  }

  function renderKpis(cat) {
    const c = counts(cat.entries);
    const total = cat.entries.length;
    $("kpi-total").textContent = total;
    $("kpi-total-sub").textContent = cat.unit ? `${cat.unit} tracked` : "";
    $("kpi-done").textContent = c.done;
    $("kpi-done-sub").textContent = `${pct(c.done, total)}% of ${cat.unit || "entries"}`;
    $("kpi-partial").textContent = c.partial;
    $("kpi-partial-sub").textContent = `${pct(c.partial, total)}% with gaps listed`;
    $("kpi-planned").textContent = c.planned;
    $("kpi-planned-sub").textContent = `${pct(c.planned, total)}% not started`;

    document.querySelectorAll(".kpi-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.status === state.status);
    });
  }

  function miniBar(entries) {
    const c = counts(entries);
    const t = entries.length;
    return `
      <div class="overview-bar">
        <div class="progress-seg done" style="width: ${pct(c.done, t)}%"></div>
        <div class="progress-seg partial" style="width: ${pct(c.partial, t)}%"></div>
      </div>`;
  }

  function renderProgress(cat) {
    const c = counts(cat.entries);
    const t = cat.entries.length;
    $("progress-title").textContent = cat.id === "all" ? "Overall progress" : `${cat.label} progress`;
    $("progress-sub").textContent = cat.description || "";
    $("seg-done").style.width = `${pct(c.done, t)}%`;
    $("seg-partial").style.width = `${pct(c.partial, t)}%`;
    $("legend-done").textContent = `Implemented ${pct(c.done, t)}%`;
    $("legend-partial").textContent = `Partial ${pct(c.partial, t)}%`;
    $("legend-planned").textContent = `Missing ${pct(c.planned, t)}%`;

    $("progress-overview").innerHTML = data.categories
      .map((other) => {
        const oc = counts(other.entries);
        return `
        <button type="button" class="overview-item ${other.id === cat.id ? "active" : ""}" data-category="${other.id}">
          <div class="overview-label">
            <span>${escapeHtml(other.label)}</span>
            <strong>${pct(oc.done, other.entries.length)}%</strong>
          </div>
          ${miniBar(other.entries)}
        </button>`;
      })
      .join("");
  }

  function renderTrackingLink(cat) {
    const link = $("tracking-link");
    link.hidden = !cat.tracking;
    if (cat.tracking) link.href = `https://github.com/${REPO}/issues/${cat.tracking}`;
  }

  function entryMatchesQuery(entry, tokens) {
    if (!tokens.length) return true;
    const hay = [entry.name, entry.group || "", entry.note || "", ...(entry.items || []).map((i) => i.text), ...(entry.ids || [])]
      .join(" ")
      .toLowerCase();
    return tokens.every((t) => hay.includes(t));
  }

  function filteredEntries(cat) {
    const tokens = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    return cat.entries.filter((e) => (state.status === "all" || e.status === state.status) && entryMatchesQuery(e, tokens));
  }

  function bodyHtml(entry) {
    const items = (entry.items || [])
      .map((i) => `<li class="${i.done ? "ok" : "missing"}"><i class="fa-solid ${i.done ? "fa-check" : "fa-xmark"}"></i><span>${inline(i.text)}</span></li>`)
      .join("");

    const meta = [];
    if (entry.source) {
      meta.push(`<a href="https://github.com/${REPO}/blob/master/${escapeHtml(entry.source)}" target="_blank" rel="noopener"><i class="fa-solid fa-file-code"></i>${escapeHtml(entry.source.split("/").slice(-2).join("/"))}</a>`);
    }
    for (const n of entry.issues || []) {
      meta.push(`<a href="https://github.com/${REPO}/issues/${n}" target="_blank" rel="noopener"><i class="fa-solid fa-bug"></i>#${n}</a>`);
    }
    if (entry.ids && entry.ids.length) {
      meta.push(`<span>Registered: ${entry.ids.map((id) => `<code>${escapeHtml(id)}</code>`).join(" ")}</span>`);
    }

    return `
      ${entry.note ? `<p class="tr-note">${inline(entry.note)}</p>` : ""}
      ${items ? `<ul class="tr-items">${items}</ul>` : ""}
      ${meta.length ? `<div class="tr-meta">${meta.join("")}</div>` : ""}`;
  }

  function rowHtml(entry) {
    const key = entryKey(entry);
    const open = state.open.has(key);
    const s = STATUS[entry.status] || STATUS.planned;
    return `
      <div class="tr-row status-${entry.status} ${open ? "open" : ""}" data-key="${escapeHtml(key)}" id="row-${escapeHtml(entry.cat)}-${escapeHtml(entry.id)}">
        <button type="button" class="tr-row-head" aria-expanded="${open}">
          <span class="tr-dot"></span>
          <span class="tr-name">${escapeHtml(entry.name)}</span>
          ${entry.group ? `<span class="tr-group">${escapeHtml(entry.group)}</span>` : ""}
          <span class="tr-pill pill-${entry.status}"><i class="${s.icon}"></i>${s.label}</span>
          <i class="fa-solid fa-chevron-down tr-chevron"></i>
        </button>
        ${open ? `<div class="tr-row-body">${bodyHtml(entry)}</div>` : ""}
      </div>`;
  }

  function renderList(cat) {
    const list = $("tracker-list");
    const entries = filteredEntries(cat);
    $("list-count").textContent = `Showing ${entries.length} of ${cat.entries.length} ${cat.unit || "entries"}`;

    if (!entries.length) {
      list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-seedling"></i>Nothing matches these filters.</div>`;
      return;
    }

    let html = "";
    let lastGroup = null;
    for (const e of entries) {
      const group = `${e.cat}:${e.group || ""}`;
      if (group !== lastGroup) {
        const n = entries.filter((x) => `${x.cat}:${x.group || ""}` === group).length;
        const label = cat.id === "all" ? `${e.catLabel} · ${e.group || "Other"}` : e.group || "Other";
        html += `<div class="tr-group-head"><span>${escapeHtml(label)}</span><span class="count">${n}</span></div>`;
        lastGroup = group;
      }
      html += rowHtml(e);
    }
    list.innerHTML = html;
  }

  function anyVisibleOpen(cat) {
    return filteredEntries(cat).some((e) => state.open.has(entryKey(e)));
  }

  function renderToggle(cat) {
    $("expand-toggle").textContent = anyVisibleOpen(cat) ? "Collapse all" : "Expand all";
  }

  function setStatus(status) {
    state.status = status;
    $("status-filter").querySelectorAll(".control-btn").forEach((b) => {
      const on = b.dataset.status === status;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on);
    });
    render();
  }

  function render() {
    const cat = currentCategory();
    renderTabs();
    renderKpis(cat);
    renderProgress(cat);
    renderTrackingLink(cat);
    renderList(cat);
    renderToggle(cat);
  }

  function updateHash() {
    const cat = currentCategory();
    const openInCat = cat.id === "all" ? null : [...state.open].find((k) => k.startsWith(`${cat.id}:`));
    history.replaceState(null, "", openInCat ? `#${cat.id}/${openInCat.split(":")[1]}` : `#${cat.id}`);
  }

  function applyHash() {
    const raw = location.hash.replace(/^#/, "");
    if (!raw) return;
    const [catId, entryId] = raw.split("/");
    if (catId === "all" || data.categories.some((c) => c.id === catId)) state.category = catId;
    if (entryId) state.open.add(`${catId}:${entryId}`);
  }

  function scrollToHashRow() {
    if (!location.hash.includes("/")) return;
    const target = document.getElementById(`row-${location.hash.slice(1).replace("/", "-")}`);
    if (target) target.scrollIntoView({ block: "center" });
  }

  // ---------- Events ----------

  function bind() {
    $("category-tabs").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-category]");
      if (!btn) return;
      state.category = btn.dataset.category;
      render();
      updateHash();
      $("category-tabs").querySelector(".active")?.focus();
    });

    $("progress-overview").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-category]");
      if (!btn) return;
      state.category = btn.dataset.category;
      render();
      updateHash();
      $("category-tabs").scrollIntoView({ behavior: "smooth", block: "start" });
      $("category-tabs").querySelector(".active")?.focus();
    });

    $("status-filter").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-status]");
      if (btn) setStatus(btn.dataset.status);
    });

    document.querySelectorAll(".kpi-card").forEach((card) => {
      card.addEventListener("click", () => setStatus(card.dataset.status));
    });

    const search = $("search-input");
    search.addEventListener("input", () => {
      state.query = search.value.trim();
      search.parentElement.classList.toggle("has-value", Boolean(state.query));
      render();
    });
    $("search-clear").addEventListener("click", () => {
      search.value = "";
      state.query = "";
      search.parentElement.classList.remove("has-value");
      render();
      search.focus();
    });

    $("tracker-list").addEventListener("click", (e) => {
      const head = e.target.closest(".tr-row-head");
      if (!head) return;
      const key = head.closest(".tr-row").dataset.key;
      if (state.open.has(key)) state.open.delete(key);
      else state.open.add(key);
      const cat = currentCategory();
      renderList(cat);
      renderToggle(cat);
      updateHash();
    });

    $("expand-toggle").addEventListener("click", (e) => {
      e.preventDefault();
      const cat = currentCategory();
      const visible = filteredEntries(cat).map(entryKey);
      if (anyVisibleOpen(cat)) {
        for (const key of visible) state.open.delete(key);
      } else {
        for (const key of visible) state.open.add(key);
      }
      render();
      updateHash();
    });

    window.addEventListener("hashchange", () => {
      applyHash();
      render();
      scrollToHashRow();
    });
  }

  // ---------- Init ----------

  async function init() {
    try {
      const res = await fetch("data.json");
      if (!res.ok) throw new Error("data.json missing");
      data = await res.json();
    } catch (err) {
      $("tracker-list").innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Could not load tracker data.</div>`;
      $("list-count").textContent = "";
      console.error(err);
      return;
    }

    for (const c of data.categories) {
      for (const e of c.entries) {
        e.cat = c.id;
        e.catLabel = c.label;
      }
    }
    data.all = {
      id: "all",
      label: "All",
      icon: "fa-layer-group",
      unit: "entries",
      description: "Every tracked entry across all categories.",
      entries: data.categories.flatMap((c) => c.entries),
    };

    state.category = "all";
    applyHash();

    $("hero-version").textContent = data.version ? `· ${data.version}` : "";
    $("audit-text").textContent = [data.commit, data.updated].filter(Boolean).join(" · ") || "-";

    bind();
    render();
    scrollToHashRow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
