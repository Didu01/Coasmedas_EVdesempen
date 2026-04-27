
(function () {
  const FORM_URL = "https://forms.office.com/Pages/ShareFormPage.aspx?id=8MWdaZbFzEe2IL9URfDE3p9GYt_v-PpGm0agnT2Bf1FUNzVSNFU5U0JIMzJJTjk0M1RLVzlSMllRTC4u&sharetoken=NOTLbypf2KR2mwBdigPg";

  const REQUIRED_SOURCES = [
    { key: "HOJA1_DATA", name: "Hoja1" },
    { key: "HOJA1_2_DATA", name: "Hoja1 (2)" },
    { key: "HOJA2_DATA", name: "Hoja2" },
    { key: "HOJA3_DATA", name: "Hoja3" },
    { key: "APP_DATA", name: "APP_DATA" }
  ];

  const sourceSummary = REQUIRED_SOURCES.map(function (src) {
    const val = window[src.key];
    return {
      name: src.name,
      loaded: Array.isArray(val) || (src.key === "APP_DATA" && !!val),
      count: Array.isArray(val) ? Math.max(0, val.length - 1) : (val ? Object.keys(val).length : 0)
    };
  });

  const appData = window.APP_DATA || {};
  const elements = {
    modal: document.getElementById("startupModal"),
    documentInputModal: document.getElementById("documentInputModal"),
    searchBtnModal: document.getElementById("searchBtnModal"),
    documentInput: document.getElementById("documentInput"),
    searchBtn: document.getElementById("searchBtn"),
    clearBtn: document.getElementById("clearBtn"),
    status: document.getElementById("status"),
    nameValue: document.getElementById("nameValue"),
    areaValue: document.getElementById("areaValue"),
    roleValue: document.getElementById("roleValue"),
    completeContainer: document.getElementById("completeContainer"),
    generalContainer: document.getElementById("generalContainer"),
    completeCount: document.getElementById("completeCount"),
    generalCount: document.getElementById("generalCount"),
    totalRecords: document.getElementById("totalRecords"),
    sourceAudit: document.getElementById("sourceAudit")
  };

  if (elements.totalRecords) {
    elements.totalRecords.textContent = String(Object.keys(appData).length || 0);
  }

  if (elements.sourceAudit) {
    elements.sourceAudit.innerHTML = sourceSummary.map(function (s) {
      return '<span>' + s.name + ': <strong>' + (s.loaded ? 'OK' : 'No cargada') + '</strong>' +
             (s.loaded ? ' (' + s.count + ')' : '') + '</span>';
    }).join(' · ');
  }

  function sanitizeDocument(value) {
    return String(value || "").replace(/\D+/g, "");
  }

  function setStatus(message, type) {
    elements.status.className = "status show " + (type || "ok");
    elements.status.textContent = message;
  }

  function clearStatus() {
    elements.status.className = "status";
    elements.status.textContent = "";
  }

  function renderTable(container, rows, emptyMessage) {
    if (!rows || !rows.length) {
      container.innerHTML = '<div class="empty">' + emptyMessage + '</div>';
      return;
    }
    var table = [
      '<table>',
      '<thead><tr><th>Persona a evaluar</th><th>Relación</th></tr></thead>',
      '<tbody>'
    ];
    rows.forEach(function (item) {
      table.push(
        '<tr>' +
          '<td>' + escapeHtml(item.persona || "—") + '</td>' +
          '<td>' + escapeHtml(item.relacion || "—") + '</td>' +
        '</tr>'
      );
    });
    table.push('</tbody></table>');
    container.innerHTML = table.join('');
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function resetView(keepValue) {
    if (!keepValue) {
      elements.documentInput.value = "";
      elements.documentInputModal.value = "";
    }
    elements.nameValue.textContent = "—";
    elements.areaValue.textContent = "—";
    elements.roleValue.textContent = "—";
    elements.completeContainer.innerHTML = '<div class="empty">No hay evaluaciones completas cargadas.</div>';
    elements.generalContainer.innerHTML = '<div class="empty">No hay evaluaciones generales cargadas.</div>';
    elements.completeCount.textContent = "0 asignadas";
    elements.generalCount.textContent = "0 asignadas";
    clearStatus();
  }

  function consultByDocument(rawValue) {
    var doc = sanitizeDocument(rawValue);
    elements.documentInput.value = doc;
    elements.documentInputModal.value = doc;

    if (!doc) {
      setStatus("Ingrese un número de documento válido para continuar.", "error");
      return;
    }

    var user = appData[doc];
    if (!user) {
      setStatus("No se encontró información para el documento consultado.", "error");
      return;
    }

    elements.nameValue.textContent = user.nombre || "—";
    elements.areaValue.textContent = user.area || "—";
    elements.roleValue.textContent = user.cargo || "—";

    renderTable(
      elements.completeContainer,
      user.evaluacionesCompletas || [],
      "No tiene evaluaciones completas asignadas."
    );
    renderTable(
      elements.generalContainer,
      user.evaluacionesGenerales || [],
      "No tiene evaluaciones generales asignadas."
    );

    elements.completeCount.textContent = (user.evaluacionesCompletas || []).length + " asignadas";
    elements.generalCount.textContent = (user.evaluacionesGenerales || []).length + " asignadas";

    if (elements.modal) {
      elements.modal.style.display = "none";
    }
    setStatus("Consulta realizada correctamente.", "ok");
  }

  elements.searchBtnModal.addEventListener("click", function () {
    consultByDocument(elements.documentInputModal.value);
  });

  elements.searchBtn.addEventListener("click", function () {
    consultByDocument(elements.documentInput.value);
  });

  elements.clearBtn.addEventListener("click", function () {
    if (elements.modal) {
      elements.modal.style.display = "flex";
    }
    resetView(false);
    elements.documentInputModal.focus();
  });

  [elements.documentInput, elements.documentInputModal].forEach(function (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        consultByDocument(input.value);
      }
    });
  });

  resetView(true);
})();
