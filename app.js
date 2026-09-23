(function () {
  'use strict';

  /* ================= פרטי העסק - קבועים, לא ניתנים לעריכה באפליקציה ================= */

  var BUSINESS = {
    businessName: "Spicy Social Media",
    managerName: "שחר תורג'מן",
    email: 'spicysocial.content@gmail.com',
    phone: '050-3338265',
    location: '',
    tagline: 'ניהול סושיאל · יצירת תוכן · אסטרטגיה דיגיטלית',
    logo: 'assets/spicy-logo.png',
  };

  var VAT_RATE = 0.18;

  var PRICING_UNITS = [
    { value: 'month', label: 'לחודש' },
    { value: 'hour', label: 'לשעה' },
    { value: 'day', label: 'ליום עבודה' },
    { value: 'none', label: 'ללא יחידה' },
  ];

  function unitLabel(unit) {
    if (unit === 'none') return '';
    var found = PRICING_UNITS.filter(function (u) { return u.value === unit; })[0];
    return found ? found.label : '';
  }

  var SERVICE_PRESETS = {
    full: {
      label: 'חבילה מלאה',
      hint: 'ברירת המחדל - רוב ההצעות',
      services: [
        'כתיבת תסריטים ובניית רעיונות תוכן',
        'כתיבת קופי מותאם לכל תוכן',
        'יום צילום חודשי מרוכז (עד 4 שעות נטו)',
        'צילום התוכן במהלך יום הצילום',
        'עריכה מקצועית של 8 סרטונים',
        'תמלול וכתוביות לסרטונים',
        'התאמת התכנים לפלטפורמות (אינסטגרם / טיקטוק / פייסבוק)',
        'עד 2 סבבי תיקונים לכל סרטון',
        'העלאת תכנים לכל הפלטפורמות',
        'חיבור מלא לעמוד העסקי - ניהול story שוטף, מענה לתגובות והודעות פרטיות',
        'בוסט (ממומן) - בתיאום מראש',
      ],
    },
    filmEdit: {
      label: 'צילום ועריכה בלבד',
      hint: 'הלקוח מעלה בעצמו',
      services: [
        'כתיבת תסריטים ובניית רעיונות תוכן',
        'כתיבת קופי מותאם לכל תוכן',
        'יום צילום חודשי מרוכז (עד 4 שעות נטו)',
        'צילום התוכן במהלך יום הצילום',
        'עריכה מקצועית של 8 סרטונים',
        'תמלול וכתוביות לסרטונים',
        'עד 2 סבבי תיקונים לכל סרטון',
      ],
    },
    copyManage: {
      label: 'קופי וניהול בלבד',
      hint: 'ללקוח עם צוות הפקה משלו',
      services: [
        'כתיבת תסריטים ובניית רעיונות תוכן',
        'כתיבת קופי מותאם לכל תוכן',
        'התאמת התכנים לפלטפורמות (אינסטגרם / טיקטוק / פייסבוק)',
        'העלאת תכנים לכל הפלטפורמות',
        'חיבור מלא לעמוד העסקי - ניהול story שוטף, מענה לתגובות והודעות פרטיות',
        'בוסט (ממומן) - בתיאום מראש',
      ],
    },
  };

  var DEFAULT_PAYMENT_TERMS = [
    {
      title: 'שיטת תשלום',
      text: 'ריטיינר חודשי קבוע. תשלום בתחילת כל חודש עבור השירות שבוצע בחודש הקודם.',
    },
    {
      title: 'מועד תשלום',
      text: 'לא יאוחר מיום ה-10 לכל חודש, בהעברה בנקאית / אפליקציית תשלום.',
    },
    {
      title: 'מע"מ',
      text: 'כל המחירים כוללים מע"מ כחוק, כפי שמצוין בהצעה זו.',
    },
    {
      title: 'חיובים נוספים',
      text: 'כל תוספת שתוסכם בכתב תתווסף לחשבונית חודש העבודה הרלוונטי.',
    },
  ];

  var DEFAULT_NOT_INCLUDED = [
    'תקציב ממומן (בוסט) - בחיוב ישיר ללקוח',
    'שעות צילום נוספות מעבר לחבילה',
    'סבבי עריכה מעבר ל-2 לכל סרטון',
    'שכירת ציוד, סטודיו או לוקיישן',
    'תוכן מחוץ ליום הצילום המוסכם',
  ].join('\n');

  var DEFAULT_GENERAL_NOTES = [
    'הצעת מחיר זו תקפה ל-14 יום ממועד הוצאתה. לאחר מכן, התמחור כפוף לאישור מחדש.',
    'הצעה זו אינה מהווה חוזה מחייב. חוזה שירות מפורט ייחתם בין הצדדים בנפרד עם אישור ההצעה.',
    'כל שינוי בהיקף השירות יוסכם בכתב מראש (כולל WhatsApp / דוא"ל) ויחויב בהתאם.',
    'סיום ההתקשרות בהודעה מוקדמת של 30 יום בכתב. בחודש ההודעה ימשיכו השירותים בתשלום מלא.',
    'הגעה נוספת לצילומים מעבר לחבילה תחויב בהתאם להיקף השעות והמרחק, ותאושר מראש בכתב.',
    'הלקוח מתחייב לאשר תכנים ולהגיש הערות בתוך 48 שעות ממועד קבלתם לצורך שמירה על לוח הזמנים.',
    'כל זכויות היוצרים בתוצרים הסופיים הן של הלקוח בכפוף לתשלום מלא. הספק רשאי לעשות שימוש בתוצרים לשיווק עצמי בלבד.',
  ].join('\n');

  var STEP_LABELS = ['פרטי הלקוח', 'שירותים ומחיר', 'תנאים וסיום'];

  /* ================= עזרים ================= */

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatPrice(value) {
    return (
      Number(value || 0).toLocaleString('he-IL', { maximumFractionDigits: 2 }) + ' ₪'
    );
  }

  function deepCopy(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function servicesFromPreset(key) {
    return SERVICE_PRESETS[key].services.map(function (label, i) {
      return { id: 'p-' + key + '-' + i, label: label, price: '', checked: true };
    });
  }

  // true אם המשתמשת ערכה/מחקה/הוסיפה שירותים מאז שנבחרה החבילה הנוכחית -
  // כדי לא לאבד עריכות בטעות אם לוחצים על חבילה אחרת בהיסח הדעת.
  function isServicesDirty() {
    var original = SERVICE_PRESETS[state.preset].services;
    if (state.services.length !== original.length) return true;
    for (var i = 0; i < original.length; i++) {
      if (state.services[i].label !== original[i] || !state.services[i].checked) return true;
    }
    return false;
  }

  /* ================= state ================= */

  function freshState() {
    return {
      step: 0,
      error: null,
      clientName: '',
      contactName: '',
      preset: 'full',
      services: servicesFromPreset('full'),
      customLabel: '',
      pricingMode: 'package',
      packagePrice: '',
      priceUnit: 'month',
      vatEnabled: true,
      notes: '',
      validityDays: '14',
      noValidity: false,
      includeTermsPage: true,
      termsOpen: false,
      paymentTerms: deepCopy(DEFAULT_PAYMENT_TERMS),
      notIncluded: DEFAULT_NOT_INCLUDED,
      generalNotes: DEFAULT_GENERAL_NOTES,
    };
  }

  var state = freshState();

  function selectedServices() {
    return state.services.filter(function (s) {
      return s.checked && s.label.trim();
    });
  }

  function computeTotals() {
    var selected = selectedServices();
    var subtotal =
      state.pricingMode === 'package'
        ? Math.max(0, Number(state.packagePrice) || 0)
        : selected.reduce(function (sum, s) { return sum + Math.max(0, Number(s.price) || 0); }, 0);
    var vatAmount = state.vatEnabled ? Math.round(subtotal * VAT_RATE * 100) / 100 : 0;
    var total = subtotal + vatAmount;
    return { selected: selected, subtotal: subtotal, vatAmount: vatAmount, total: total };
  }

  /* ================= DOM refs ================= */

  var stepIndicatorEl = document.getElementById('step-indicator');
  var stepBodyEl = document.getElementById('step-body');
  var errorEl = document.getElementById('step-error');
  var backBtn = document.getElementById('back-btn');
  var nextBtn = document.getElementById('next-btn');
  var previewOverlay = document.getElementById('preview-overlay');
  var closePreviewBtn = document.getElementById('close-preview-btn');
  var downloadBtn = document.getElementById('download-btn');
  var newQuoteBtn = document.getElementById('new-quote-btn');
  var page1El = document.getElementById('doc-page1');
  var page2El = document.getElementById('doc-page2');

  /* ================= ולידציה וניווט ================= */

  function validateStep() {
    if (state.step === 0) {
      if (!state.clientName.trim()) return 'חסר שם הלקוח או העסק שההצעה מיועדת לו';
    }
    if (state.step === 1) {
      var t = computeTotals();
      if (t.selected.length === 0) return 'צריך לבחור לפחות שירות אחד';
      if (state.pricingMode === 'package' && t.subtotal <= 0) return 'חסר מחיר החבילה';
    }
    return null;
  }

  function goNext() {
    var problem = validateStep();
    if (problem) {
      state.error = problem;
      renderStep();
      return;
    }
    state.error = null;
    if (state.step === STEP_LABELS.length - 1) {
      openPreview();
    } else {
      state.step += 1;
      renderStep();
    }
  }

  function goBack() {
    state.error = null;
    if (state.step > 0) {
      state.step -= 1;
      renderStep();
    }
  }

  /* ================= בניית שלב 1: פרטי הלקוח ================= */

  function buildStepClient() {
    var wrap = document.createElement('div');

    var clientNameInput = input('text', state.clientName, 'למי מיועדת ההצעה', function (v) {
      state.clientName = v;
    });
    wrap.appendChild(field('שם הלקוח או העסק', clientNameInput));
    // פוקוס אוטומטי על השדה הראשון - זה תמיד תחילת הצעה חדשה, נוח שהסמן כבר שם
    if (!state.clientName) {
      setTimeout(function () {
        clientNameInput.focus();
      }, 0);
    }
    wrap.appendChild(
      field('שם איש הקשר (אופציונלי)', input('text', state.contactName, 'למשל: דנה כהן', function (v) {
        state.contactName = v;
      }))
    );
    return wrap;
  }

  /* ================= בניית שלב 2: שירותים ומחיר ================= */

  function buildStepServices() {
    var wrap = document.createElement('div');

    // בורר חבילת שירות
    var presetRow = document.createElement('div');
    presetRow.className = 'preset-row';
    Object.keys(SERVICE_PRESETS).forEach(function (key) {
      var preset = SERVICE_PRESETS[key];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-btn' + (state.preset === key ? ' active' : '');
      btn.innerHTML = '<div>' + esc(preset.label) + '</div>';
      btn.addEventListener('click', function () {
        if (state.preset === key) return;
        if (isServicesDirty() && !confirm('החלפת החבילה תמחק את השינויים שעשית ברשימת השירותים. להמשיך?')) {
          return;
        }
        state.preset = key;
        state.services = servicesFromPreset(key);
        renderStep();
      });
      presetRow.appendChild(btn);
    });
    wrap.appendChild(presetRow);

    // מצב תמחור
    var modeBox = document.createElement('div');
    modeBox.className = 'mode-row';
    modeBox.innerHTML = '<span class="title">איך לתמחר?</span>';
    var modeOptions = document.createElement('div');
    modeOptions.className = 'mode-options';
    [
      { value: 'package', label: 'מחיר כולל לחבילה', hint: 'השירותים מוצגים כרשימה ומחיר אחד לכולם' },
      { value: 'perService', label: 'מחיר לכל שירות', hint: 'כל שירות מתומחר בנפרד והסכום מחושב' },
    ].forEach(function (opt) {
      var label = document.createElement('label');
      label.className = 'mode-option' + (state.pricingMode === opt.value ? ' selected' : '');
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'pricingMode';
      radio.checked = state.pricingMode === opt.value;
      radio.addEventListener('change', function () {
        state.pricingMode = opt.value;
        renderStep();
      });
      label.appendChild(radio);
      var span = document.createElement('span');
      span.innerHTML =
        '<span class="opt-label">' + esc(opt.label) + '</span><span class="opt-hint">' + esc(opt.hint) + '</span>';
      label.appendChild(span);
      modeOptions.appendChild(label);
    });
    modeBox.appendChild(modeOptions);
    wrap.appendChild(modeBox);

    var hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.style.marginBottom = '10px';
    hint.textContent = 'אפשר לערוך את הטקסט של כל שירות ישירות בשורה שלו';
    wrap.appendChild(hint);

    // רשימת שירותים
    var list = document.createElement('div');
    list.className = 'service-list';
    state.services.forEach(function (service) {
      list.appendChild(buildServiceRow(service));
    });
    wrap.appendChild(list);

    // הוספת שירות מותאם
    var addRow = document.createElement('div');
    addRow.className = 'add-service-row';
    var addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.placeholder = 'שירות מותאם אישית, למשל: ניהול קמפיין ממומן';
    addInput.value = state.customLabel;
    addInput.addEventListener('input', function (e) {
      state.customLabel = e.target.value;
      addBtn.disabled = !state.customLabel.trim();
    });
    addInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomService();
      }
    });
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ הוספה';
    addBtn.disabled = !state.customLabel.trim();
    addBtn.addEventListener('click', addCustomService);
    function addCustomService() {
      var label = state.customLabel.trim();
      if (!label) return;
      state.services.push({ id: 'custom-' + Date.now(), label: label, price: '', checked: true });
      state.customLabel = '';
      renderStep();
    }
    addRow.appendChild(addInput);
    addRow.appendChild(addBtn);
    wrap.appendChild(addRow);

    // מחיר חבילה / יחידת תמחור
    if (state.pricingMode === 'package') {
      var priceBox = document.createElement('div');
      priceBox.className = 'price-box';
      priceBox.innerHTML = '<span class="title">מחיר החבילה:</span>';
      var priceInput = document.createElement('input');
      priceInput.type = 'number';
      priceInput.min = '0';
      priceInput.dir = 'ltr';
      priceInput.placeholder = 'מחיר';
      priceInput.value = state.packagePrice;
      priceInput.addEventListener('input', function (e) {
        state.packagePrice = e.target.value;
        updateSummary();
      });
      priceBox.appendChild(priceInput);
      var shekel = document.createElement('span');
      shekel.textContent = '₪';
      shekel.style.fontSize = '13px';
      shekel.style.color = 'var(--muted)';
      priceBox.appendChild(shekel);
      priceBox.appendChild(unitSelect());
      wrap.appendChild(priceBox);
    } else {
      var unitBox = document.createElement('div');
      unitBox.className = 'price-box';
      unitBox.innerHTML = '<span class="title">יחידת התמחור של הסה״כ:</span>';
      unitBox.appendChild(unitSelect());
      wrap.appendChild(unitBox);
    }

    // מע"מ
    var vatLabel = document.createElement('label');
    vatLabel.className = 'vat-toggle';
    var vatInput = document.createElement('input');
    vatInput.type = 'checkbox';
    vatInput.checked = state.vatEnabled;
    vatInput.addEventListener('change', function (e) {
      state.vatEnabled = e.target.checked;
      updateSummary();
    });
    vatLabel.appendChild(vatInput);
    var vatText = document.createElement('span');
    vatText.innerHTML =
      '<span class="opt-label">להוסיף מע״מ (18%) להצעה</span><span class="opt-hint">כברירת מחדל מופעל, בהתאם לעסק המורשה של שחר</span>';
    vatLabel.appendChild(vatText);
    wrap.appendChild(vatLabel);

    var summary = document.createElement('p');
    summary.className = 'summary-line';
    summary.id = 'services-summary';
    wrap.appendChild(summary);
    updateSummary();

    return wrap;

    function unitSelect() {
      var select = document.createElement('select');
      PRICING_UNITS.forEach(function (u) {
        var opt = document.createElement('option');
        opt.value = u.value;
        opt.textContent = u.label;
        if (state.priceUnit === u.value) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', function (e) {
        state.priceUnit = e.target.value;
      });
      return select;
    }
  }

  function buildServiceRow(service) {
    var row = document.createElement('div');
    row.className = 'service-row' + (service.checked ? ' checked' : '');

    var checkbox = document.createElement('button');
    checkbox.type = 'button';
    checkbox.className = 'service-checkbox';
    checkbox.textContent = service.checked ? '✓' : '';
    checkbox.setAttribute('aria-label', service.checked ? 'הסרת השירות מהבחירה' : 'בחירת השירות');
    checkbox.addEventListener('click', function () {
      service.checked = !service.checked;
      renderStep();
    });
    row.appendChild(checkbox);

    var labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'service-label-input';
    labelInput.value = service.label;
    labelInput.addEventListener('input', function (e) {
      service.label = e.target.value;
    });
    row.appendChild(labelInput);

    if (service.checked && state.pricingMode === 'perService') {
      var priceInput = document.createElement('input');
      priceInput.type = 'number';
      priceInput.min = '0';
      priceInput.dir = 'ltr';
      priceInput.className = 'service-price-input';
      priceInput.placeholder = 'מחיר';
      priceInput.value = service.price;
      priceInput.addEventListener('input', function (e) {
        service.price = e.target.value;
        updateSummary();
      });
      row.appendChild(priceInput);
    }

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'service-remove';
    removeBtn.textContent = '✕';
    removeBtn.title = 'הסרת שורה';
    removeBtn.setAttribute('aria-label', 'הסרת שירות: ' + service.label);
    removeBtn.addEventListener('click', function () {
      var idx = state.services.indexOf(service);
      if (idx > -1) state.services.splice(idx, 1);
      renderStep();
    });
    row.appendChild(removeBtn);

    return row;
  }

  function updateSummary() {
    var el = document.getElementById('services-summary');
    if (!el) return;
    var t = computeTotals();
    if (t.selected.length > 0 && t.subtotal > 0) {
      var html = t.selected.length + ' שירותים · ';
      if (state.vatEnabled) {
        html += formatPrice(t.subtotal) + ' + מע"מ ' + formatPrice(t.vatAmount) + ' = ';
      }
      html += '<strong>' + formatPrice(t.total) + '</strong>';
      el.innerHTML = html;
    } else {
      el.innerHTML = '';
    }
  }

  /* ================= בניית שלב 3: תנאים וסיום ================= */

  function buildStepTerms() {
    var wrap = document.createElement('div');

    var notesField = field(
      'הערות חופשיות (יופיעו בעמוד הראשון)',
      textarea(state.notes, 'כל דבר שחשוב שהלקוח יידע כבר בעמוד הראשון', 3, function (v) {
        state.notes = v;
      })
    );
    wrap.appendChild(notesField);

    var validityWrap = document.createElement('div');
    validityWrap.className = 'field';
    var validityLabel = document.createElement('span');
    validityLabel.className = 'label';
    validityLabel.textContent = 'תוקף ההצעה בימים';
    validityWrap.appendChild(validityLabel);
    var validityRow = document.createElement('div');
    validityRow.className = 'validity-row';
    if (!state.noValidity) {
      var daysInput = document.createElement('input');
      daysInput.type = 'number';
      daysInput.min = '1';
      daysInput.dir = 'ltr';
      daysInput.value = state.validityDays;
      daysInput.addEventListener('input', function (e) {
        state.validityDays = e.target.value;
      });
      validityRow.appendChild(daysInput);
    }
    var noValidityLabel = document.createElement('label');
    noValidityLabel.className = 'inline';
    var noValidityInput = document.createElement('input');
    noValidityInput.type = 'checkbox';
    noValidityInput.checked = state.noValidity;
    noValidityInput.addEventListener('change', function (e) {
      state.noValidity = e.target.checked;
      renderStep();
    });
    noValidityLabel.appendChild(noValidityInput);
    noValidityLabel.appendChild(document.createTextNode('ללא תוקף'));
    validityRow.appendChild(noValidityLabel);
    validityWrap.appendChild(validityRow);
    wrap.appendChild(validityWrap);

    var termsCheck = document.createElement('label');
    termsCheck.className = 'checkbox-card';
    var termsInput = document.createElement('input');
    termsInput.type = 'checkbox';
    termsInput.checked = state.includeTermsPage;
    termsInput.addEventListener('change', function (e) {
      state.includeTermsPage = e.target.checked;
      renderStep();
    });
    termsCheck.appendChild(termsInput);
    var termsSpan = document.createElement('span');
    termsSpan.innerHTML =
      '<span class="opt-label">לצרף עמוד תנאים מפורט להצעה</span><span class="opt-hint">עמוד שני עם תנאי תשלום, מה לא כלול בחבילה והערות כלליות</span>';
    termsCheck.appendChild(termsSpan);
    wrap.appendChild(termsCheck);

    if (state.includeTermsPage) {
      var advWrap = document.createElement('div');

      var toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'terms-toggle' + (state.termsOpen ? ' open' : '');
      toggleBtn.innerHTML = 'עריכת הטקסטים של עמוד התנאים <span class="chev">▾</span>';
      toggleBtn.addEventListener('click', function () {
        state.termsOpen = !state.termsOpen;
        renderStep();
      });
      advWrap.appendChild(toggleBtn);

      var panel = document.createElement('div');
      panel.className = 'terms-panel' + (state.termsOpen ? ' open' : '');

      var payHead = document.createElement('p');
      payHead.className = 'subhead';
      payHead.textContent = 'תנאי תשלום';
      panel.appendChild(payHead);

      state.paymentTerms.forEach(function (term, index) {
        var item = document.createElement('div');
        item.className = 'term-item';
        var titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = term.title;
        titleInput.addEventListener('input', function (e) {
          state.paymentTerms[index].title = e.target.value;
        });
        var textArea = document.createElement('textarea');
        textArea.rows = 2;
        textArea.value = term.text;
        textArea.addEventListener('input', function (e) {
          state.paymentTerms[index].text = e.target.value;
        });
        item.appendChild(titleInput);
        item.appendChild(textArea);
        panel.appendChild(item);
      });

      panel.appendChild(
        field(
          'מה לא כלול בחבילה (שורה לכל פריט)',
          textarea(state.notIncluded, '', 5, function (v) {
            state.notIncluded = v;
          })
        )
      );

      panel.appendChild(
        field(
          'הערות ותנאים כלליים (שורה לכל סעיף, הממוספר אוטומטית)',
          textarea(state.generalNotes, '', 8, function (v) {
            state.generalNotes = v;
          })
        )
      );

      advWrap.appendChild(panel);
      wrap.appendChild(advWrap);
    }

    var t = computeTotals();
    var summaryBox = document.createElement('div');
    summaryBox.className = 'summary-box';
    summaryBox.innerHTML =
      '<p><strong>רגע לפני שמסיימים</strong></p>' +
      '<p class="muted">הצעה עבור <strong>' +
      esc(state.clientName || '—') +
      '</strong> · ' +
      t.selected.length +
      ' שירותים · סה״כ לתשלום <strong>' +
      formatPrice(t.total) +
      '</strong>' +
      (state.vatEnabled ? ' (כולל מע״מ)' : '') +
      '</p>';
    wrap.appendChild(summaryBox);

    return wrap;
  }

  /* ================= form helpers ================= */

  function field(labelText, control) {
    var wrap = document.createElement('label');
    wrap.className = 'field';
    var span = document.createElement('span');
    span.className = 'label';
    span.textContent = labelText;
    wrap.appendChild(span);
    wrap.appendChild(control);
    return wrap;
  }

  function input(type, value, placeholder, onInput) {
    var el = document.createElement('input');
    el.type = type;
    el.value = value;
    el.placeholder = placeholder || '';
    el.addEventListener('input', function (e) {
      onInput(e.target.value);
    });
    return el;
  }

  function textarea(value, placeholder, rows, onInput) {
    var el = document.createElement('textarea');
    el.rows = rows;
    el.value = value;
    el.placeholder = placeholder || '';
    el.addEventListener('input', function (e) {
      onInput(e.target.value);
    });
    return el;
  }

  /* ================= render שלב נוכחי ================= */

  function renderStepIndicator() {
    stepIndicatorEl.innerHTML = '';
    STEP_LABELS.forEach(function (label, index) {
      var li = document.createElement('li');
      var done = index < state.step;
      var active = index === state.step;
      if (done) li.className = 'done';
      if (active) li.className = 'active';
      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.textContent = done ? '✓' : String(index + 1);
      var labelSpan = document.createElement('span');
      labelSpan.className = 'label';
      labelSpan.textContent = label;
      li.appendChild(dot);
      li.appendChild(labelSpan);
      stepIndicatorEl.appendChild(li);
    });
  }

  function renderStep() {
    renderStepIndicator();
    stepBodyEl.innerHTML = '';
    if (state.step === 0) stepBodyEl.appendChild(buildStepClient());
    if (state.step === 1) stepBodyEl.appendChild(buildStepServices());
    if (state.step === 2) stepBodyEl.appendChild(buildStepTerms());

    if (state.error) {
      errorEl.textContent = state.error;
      errorEl.style.display = 'block';
    } else {
      errorEl.style.display = 'none';
    }

    backBtn.disabled = state.step === 0;
    nextBtn.textContent = state.step === STEP_LABELS.length - 1 ? 'צור הצעת מחיר' : 'הבא';
  }

  /* ================= בניית עמודי ההצעה (לתצוגה ול-PDF) ================= */

  // הכל כאן נכתב כ-style="..." ישירות על כל אלמנט (לא class מגיליון חיצוני).
  // הסיבה: html2canvas לא תמיד קורא בעקביות CSS שמגיע מ-styles.css חיצוני
  // (תופעה ידועה) - כשהעיצוב חי ב-style inline הוא תמיד נלכד נכון, בדיוק
  // כמו בקוד המקור של page.tsx שמשתמש אך ורק ב-inline styles לעמודי ההצעה.

  function dateFormatter() {
    return new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' });
  }

  function styleStr(props) {
    var out = '';
    for (var key in props) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
      var value = props[key];
      if (value === undefined || value === null || value === '') continue;
      var cssKey = key.replace(/[A-Z]/g, function (m) {
        return '-' + m.toLowerCase();
      });
      out += cssKey + ':' + value + ';';
    }
    return out;
  }

  function tag(name, props, styleProps, inner) {
    var attrs = '';
    for (var key in props || {}) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
      attrs += ' ' + key + '="' + esc(props[key]) + '"';
    }
    var styleAttr = styleProps ? ' style="' + styleStr(styleProps) + '"' : '';
    return '<' + name + attrs + styleAttr + '>' + (inner || '') + '</' + name + '>';
  }

  var RED = '#c32a2a';
  var REDSOFT = 'rgba(195, 42, 42, 0.09)';

  function buildDocHeader(title, small) {
    var contactLines = '';
    if (!small) {
      contactLines =
        tag('div', null, { fontWeight: 600 }, esc(BUSINESS.businessName)) +
        tag('div', null, null, esc(BUSINESS.managerName)) +
        (BUSINESS.phone ? tag('div', null, { direction: 'ltr' }, esc(BUSINESS.phone)) : '') +
        (BUSINESS.email ? tag('div', null, { direction: 'ltr' }, esc(BUSINESS.email)) : '') +
        (BUSINESS.location ? tag('div', null, null, esc(BUSINESS.location)) : '');
    }
    return tag(
      'div',
      null,
      {
        background: REDSOFT,
        borderBottom: '3px solid ' + RED,
        padding: (small ? '28px' : '40px') + ' 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
      },
      tag(
        'div',
        null,
        null,
        tag('div', null, { fontSize: '12px', fontWeight: 700, letterSpacing: '3px', color: RED, opacity: 0.75 }, 'הצעת מחיר · PRICE QUOTE') +
          tag('div', null, { fontSize: (small ? 30 : 44) + 'px', fontWeight: 800, color: RED, lineHeight: 1.25 }, esc(title)) +
          (!small && BUSINESS.tagline.trim()
            ? tag('div', null, { fontSize: '15px', color: '#5c6270', marginTop: '4px' }, esc(BUSINESS.tagline))
            : '')
      ) +
        tag(
          'div',
          null,
          { textAlign: 'left' },
          tag('img', { src: BUSINESS.logo, alt: '' }, {
            height: (small ? 48 : 72) + 'px',
            maxWidth: '220px',
            objectFit: 'contain',
            marginBottom: (small ? 6 : 12) + 'px',
            marginRight: 'auto',
            display: 'block',
          }) + tag('div', null, { fontSize: '13px', color: '#3c4250', lineHeight: 1.8 }, contactLines)
        )
    );
  }

  function buildDocFooter() {
    return tag(
      'div',
      null,
      {
        borderTop: '3px solid ' + RED,
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        color: '#5c6270',
      },
      tag('div', null, null, esc(BUSINESS.managerName) + ' · ' + esc(BUSINESS.businessName)) +
        tag(
          'div',
          null,
          { display: 'flex', gap: '16px', direction: 'ltr' },
          (BUSINESS.email ? tag('span', null, null, esc(BUSINESS.email)) : '') +
            (BUSINESS.phone ? tag('span', null, null, esc(BUSINESS.phone)) : '')
        )
    );
  }

  function buildPage1Html() {
    var t = computeTotals();
    var isPackage = state.pricingMode === 'package';
    var today = new Date();
    var validityDays = state.noValidity ? null : Number(state.validityDays) || 14;
    var validUntil = validityDays === null ? null : new Date(today.getTime() + validityDays * 86400000);
    var df = dateFormatter();

    var servicesHtml;
    if (isPackage) {
      servicesHtml =
        tag(
          'div',
          null,
          { background: RED, color: '#ffffff', borderRadius: '10px', padding: '11px 16px', fontSize: '15px', fontWeight: 700, marginTop: '30px' },
          state.priceUnit === 'month' ? 'מה כוללת החבילה החודשית' : 'מה כוללת החבילה'
        ) +
        tag(
          'div',
          null,
          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 22px', marginTop: '14px' },
          t.selected
            .map(function (s) {
              return tag(
                'div',
                null,
                { display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '13.5px', lineHeight: 1.5, padding: '5px 0' },
                tag('span', null, { color: RED, fontWeight: 800, fontSize: '14px', lineHeight: 1.4 }, '✓') + tag('span', null, null, esc(s.label))
              );
            })
            .join('')
        );
    } else {
      var thStyle = { padding: '12px 16px', background: RED, color: '#ffffff', fontWeight: 700 };
      servicesHtml =
        tag(
          'table',
          null,
          { width: '100%', marginTop: '30px', borderCollapse: 'collapse', fontSize: '14px' },
          tag(
            'thead',
            null,
            null,
            tag(
              'tr',
              null,
              null,
              tag('th', null, Object.assign({ textAlign: 'right', borderRadius: '0 10px 10px 0' }, thStyle), 'השירות') +
                tag('th', null, Object.assign({ textAlign: 'left', borderRadius: '10px 0 0 10px', width: '150px' }, thStyle), 'מחיר')
            )
          ) +
            tag(
              'tbody',
              null,
              null,
              t.selected
                .map(function (s, index) {
                  var rowBg = index % 2 === 1 ? '#f9fafb' : '#ffffff';
                  var tdBase = { padding: '11px 16px', borderBottom: '1px solid #eceef2', background: rowBg };
                  return tag(
                    'tr',
                    null,
                    null,
                    tag('td', null, Object.assign({ fontWeight: 600 }, tdBase), esc(s.label)) +
                      tag('td', null, Object.assign({ textAlign: 'left', whiteSpace: 'nowrap' }, tdBase), formatPrice(Number(s.price) || 0))
                  );
                })
                .join('')
            )
        );
    }

    var summaryHtml = '';
    if (state.vatEnabled) {
      var rowBase = { display: 'flex', justifyContent: 'space-between', padding: '8px 16px', color: '#3c4250' };
      summaryHtml +=
        tag('div', null, rowBase, tag('span', null, null, isPackage ? 'מחיר החבילה' : 'סה״כ ביניים') + tag('span', null, null, formatPrice(t.subtotal))) +
        tag(
          'div',
          null,
          Object.assign({ borderBottom: '1px solid #eceef2' }, rowBase),
          tag('span', null, null, 'מע״מ (18%)') + tag('span', null, null, formatPrice(t.vatAmount))
        );
    }
    summaryHtml += tag(
      'div',
      null,
      {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: REDSOFT,
        borderRadius: '12px',
        marginTop: state.vatEnabled ? '8px' : '0',
        fontSize: '17px',
        fontWeight: 800,
      },
      tag('span', null, null, 'סה״כ לתשלום' + (unitLabel(state.priceUnit) ? ' (' + unitLabel(state.priceUnit) + ')' : '')) +
        tag('span', null, { color: RED, whiteSpace: 'nowrap' }, formatPrice(t.total))
    );
    summaryHtml = tag('div', null, { marginTop: '26px', marginRight: 'auto', marginLeft: '0', width: '300px', fontSize: '14px' }, summaryHtml);

    var notesHtml = '';
    if (state.notes.trim()) {
      notesHtml =
        tag('div', null, { fontSize: '13px', fontWeight: 700, color: '#8a8f9c', marginTop: '26px' }, 'הערות') +
        tag(
          'div',
          null,
          { marginTop: '8px', background: '#f6f7f9', borderRadius: '12px', padding: '14px 18px', fontSize: '13.5px', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#3c4250' },
          esc(state.notes)
        );
    }

    var topRow = tag(
      'div',
      null,
      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' },
      tag(
        'div',
        null,
        null,
        tag('div', null, { fontSize: '12px', fontWeight: 700, color: '#8a8f9c', letterSpacing: '0.5px' }, 'לכבוד') +
          tag('div', null, { fontSize: '20px', fontWeight: 700, marginTop: '4px' }, esc(state.clientName)) +
          (state.contactName ? tag('div', null, { fontSize: '14px', color: '#5c6270', marginTop: '2px' }, 'לידי ' + esc(state.contactName)) : '')
      ) +
        tag(
          'div',
          null,
          { textAlign: 'left', fontSize: '13px', color: '#5c6270' },
          tag('div', null, null, esc(df.format(today))) +
            (validUntil
              ? tag('div', null, { marginTop: '6px', background: '#f6f7f9', borderRadius: '10px', padding: '8px 14px' }, 'ההצעה בתוקף עד ' + esc(df.format(validUntil)))
              : '')
        )
    );

    return (
      buildDocHeader('הצעת מחיר', false) +
      tag('div', null, { padding: '32px 48px', flex: 1 }, topRow + servicesHtml + summaryHtml + notesHtml) +
      buildDocFooter()
    );
  }

  function sectionTitle(icon, label) {
    return tag(
      'div',
      null,
      { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
      tag(
        'span',
        null,
        { width: '34px', height: '34px', borderRadius: '9px', background: RED, color: '#ffffff', fontSize: '17px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
        icon
      ) + tag('span', null, { fontSize: '21px', fontWeight: 800 }, label)
    );
  }

  function buildPage2Html() {
    var notIncludedItems = state.notIncluded
      .split('\n')
      .map(function (l) { return l.trim(); })
      .filter(Boolean);
    var generalItems = state.generalNotes
      .split('\n')
      .map(function (l) { return l.trim(); })
      .filter(Boolean);
    var paymentTerms = state.paymentTerms.filter(function (t) {
      return t.title.trim() || t.text.trim();
    });

    var header = tag(
      'div',
      null,
      { borderBottom: '3px solid ' + RED, padding: '22px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
      tag('div', null, { fontSize: '22px', fontWeight: 800 }, 'תנאי ההצעה') + tag('div', null, { fontSize: '14px', fontWeight: 700, color: RED }, esc(BUSINESS.businessName))
    );

    var body = '';

    body +=
      sectionTitle('₪', 'תנאי תשלום') +
      tag(
        'div',
        null,
        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '34px' },
        paymentTerms
          .map(function (term) {
            return tag(
              'div',
              null,
              { background: '#f6f7f9', borderRight: '3px solid ' + RED, borderRadius: '10px', padding: '14px 18px' },
              tag('div', null, { fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#8a8f9c', marginBottom: '6px' }, esc(term.title)) +
                tag('div', null, { fontSize: '13.5px', lineHeight: 1.65, color: '#3c4250' }, esc(term.text))
            );
          })
          .join('')
      );

    if (notIncludedItems.length > 0) {
      body +=
        sectionTitle('✕', 'מה לא כלול בחבילה') +
        tag(
          'div',
          null,
          { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '34px' },
          notIncludedItems
            .map(function (item) {
              return tag(
                'span',
                null,
                { display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #e3e6ec', background: '#fafbfc', borderRadius: '10px', padding: '9px 14px', fontSize: '13px', color: '#3c4250' },
                tag('span', null, { color: '#8a8f9c' }, '—') + esc(item)
              );
            })
            .join('')
        );
    }

    if (generalItems.length > 0) {
      body +=
        sectionTitle('!', 'הערות ותנאים כלליים') +
        tag(
          'div',
          null,
          { display: 'flex', flexDirection: 'column', gap: '9px' },
          generalItems
            .map(function (item, index) {
              return tag(
                'div',
                null,
                { display: 'flex', gap: '10px', fontSize: '13px', lineHeight: 1.65, color: '#3c4250' },
                tag('span', null, { fontWeight: 800, color: RED }, index + 1 + '.') + tag('span', null, null, esc(item))
              );
            })
            .join('')
        );
    }

    return header + tag('div', null, { padding: '34px 48px', flex: 1 }, body) + buildDocFooter();
  }

  /* ================= preview + PDF ================= */

  var previewPagesEl = document.querySelector('.preview-pages');

  // עמוד ה-PDF רוחב קבוע 794px; על מסך צר (טלפון) מקטינים אותו ויזואלית
  // כדי שיוצג שלם בלי לחתוך בצדדים, בלי להשפיע על הרוחב האמיתי שנלכד ל-PDF.
  function fitDocPages() {
    if (!previewOverlay.classList.contains('open')) return;
    var available = previewPagesEl.clientWidth || window.innerWidth;
    var scale = Math.min(1, (available - 4) / 794);
    [page1El, page2El].forEach(function (page) {
      var wrap = page.parentElement;
      if (!wrap || wrap.style.display === 'none') return;
      page.style.transform = 'none';
      var naturalHeight = page.offsetHeight;
      if (scale < 1) {
        page.style.transformOrigin = 'top center';
        page.style.transform = 'scale(' + scale + ')';
        wrap.style.width = Math.round(794 * scale) + 'px';
        wrap.style.height = Math.round(naturalHeight * scale) + 'px';
      } else {
        page.style.transformOrigin = '';
        wrap.style.width = '';
        wrap.style.height = '';
      }
    });
  }

  function openPreview() {
    page1El.innerHTML = buildPage1Html();
    var page2Wrap = document.getElementById('doc-page2-wrap');
    if (state.includeTermsPage) {
      page2Wrap.style.display = '';
      page2El.innerHTML = buildPage2Html();
    } else {
      page2Wrap.style.display = 'none';
      page2El.innerHTML = '';
    }
    previewOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    fitDocPages();
    // מדידה חוזרת אחרי שהלוגו (תמונה) נטען, כדי שגובה העמוד המקטין יהיה מדויק
    var logoImgs = previewOverlay.querySelectorAll('img');
    logoImgs.forEach(function (img) {
      if (!img.complete) img.addEventListener('load', fitDocPages, { once: true });
    });
    requestAnimationFrame(fitDocPages);
    checkCanvasFont();
  }

  var FONT_WARNING_TEXT = (document.getElementById('font-warning') || {}).textContent || '';

  // בדיקה עצמית שרצה על המכשיר עצמו, ורלוונטית רק למסלול המקומי (בלי רשת):
  // אם ה-canvas לא מצליח להשתמש בפונט האמיתי, הטקסט ב-PDF ייצא עם מילים
  // דבוקות. כשיש רשת ה-PDF נוצר בשרת ולא יכול להישבר, אז אין מה להזהיר.
  function checkCanvasFont() {
    var warnEl = document.getElementById('font-warning');
    if (!warnEl) return;
    warnEl.textContent = FONT_WARNING_TEXT;
    if (navigator.onLine !== false) {
      warnEl.style.display = 'none';
      return;
    }
    try {
      var ctx = document.createElement('canvas').getContext('2d');
      var sample = 'ניהול סושיאל (עד 4 שעות) story';
      ctx.font = '400 13.5px Heebo, sans-serif';
      var withFont = ctx.measureText(sample).width;
      ctx.font = '400 13.5px sans-serif';
      var withoutFont = ctx.measureText(sample).width;
      warnEl.style.display = withFont === withoutFont ? 'block' : 'none';
    } catch (e) {
      warnEl.style.display = 'none';
    }
  }

  window.addEventListener('resize', fitDocPages);

  function closePreview() {
    previewOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetApp() {
    state = freshState();
    closePreview();
    renderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function quoteFileName() {
    return 'הצעת מחיר - ' + (state.clientName.trim() || 'לקוח');
  }

  function saveBlob(blob, fileName) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    if (typeof link.download === 'undefined') {
      window.open(url, '_blank');
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 20000);
      return;
    }
    link.href = url;
    link.download = fileName + '.pdf';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 20000);
  }

  // המסלול הראשי: שולחים לשרת בדיוק את ה-HTML שמוצג בתצוגה המקדימה, ושם כרום
  // אמיתי מרנדר אותו ל-PDF עם טקסט וקטורי.
  //
  // למה לא מרנדרים על המכשיר: html2canvas לא מצלם את המסך - הוא מיישם מחדש
  // בעצמו את פריסת הטקסט (מפרק למילים, מודד, ומצייר כל אחת ב-fillText). בעברית
  // עם אנגלית וסוגריים באמצע (bidi) המימוש הזה לא מתלכד עם מנוע הפריסה של
  // הדפדפן, ובאייפון התוצאה הייתה מילים דבוקות וסוגריים במקום הלא נכון. כשהפלט
  // נוצר בשרת, אותם בייטים בדיוק יוצאים בכל מכשיר - האייפון רק מוריד קובץ.
  async function requestServerPdf(pagesHtml, fileName) {
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller
      ? setTimeout(function () {
          controller.abort();
        }, 60000)
      : null;
    try {
      var res = await fetch('api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: pagesHtml, filename: fileName }),
        signal: controller ? controller.signal : undefined,
      });
      if (!res.ok) throw new Error('server responded ' + res.status);
      var blob = await res.blob();
      if (!blob || blob.size < 1000) throw new Error('empty pdf');
      return blob;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function downloadPdf() {
    var fileName = quoteFileName();
    var pagesHtml = [page1El.innerHTML];
    if (state.includeTermsPage) pagesHtml.push(page2El.innerHTML);

    downloadBtn.disabled = true;
    downloadBtn.textContent = 'מכין את הקובץ...';
    var warnEl = document.getElementById('font-warning');
    if (warnEl) warnEl.style.display = 'none';

    if (navigator.onLine !== false) {
      try {
        var blob = await requestServerPdf(pagesHtml, fileName);
        saveBlob(blob, fileName);
        return;
      } catch (err) {
        // בלי רשת (או אם השרת נפל) נופלים למסלול המקומי. הוא פחות מדויק
        // בעברית, אבל עדיף קובץ מקומי מאשר כלום.
        console.warn('server pdf failed, falling back to local rendering', err);
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'הורדת PDF';
      }
    }

    // חשוב שזה לא ייפול בשקט: אם הקובץ נוצר על המכשיר, ייתכן שהעברית בו לא
    // תיראה כמו בתצוגה. עדיף שזה ייאמר במפורש מאשר שיישלח ללקוח קובץ שבור.
    if (warnEl) {
      warnEl.textContent =
        'לא הצלחנו להגיע לשרת, אז הקובץ נוצר על המכשיר עצמו - ייתכן שהעברית בו לא תיראה בדיוק כמו בתצוגה. כדאי לבדוק את הקובץ לפני ששולחים, ולנסות שוב כשיש חיבור טוב.';
      warnEl.style.display = 'block';
    }
    await downloadPdfLocally();
  }

  async function downloadPdfLocally() {
    var pages = [page1El];
    if (state.includeTermsPage) pages.push(page2El);
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'מכין את הקובץ...';
    try {
      // html2canvas מודד את הטקסט מה-DOM אבל מצייר אותו על canvas עם
      // ctx.fillText - ושם הוא משתמש רק בפונט שה-canvas באמת מכיר. אם הפונט
      // לא "מומש" לכל משקל שבשימוש, ה-canvas נופל בשקט לפונט ברירת מחדל,
      // המדידה והציור לא תואמים, והמילים נדבקות זו לזו בלי רווח.
      // לכן: מאלצים מימוש מפורש של כל משקל לפני הצילום, ולא מסתפקים
      // ב-fonts.ready (ש-iOS מדווח עליו כמוכן גם כשה-canvas עוד לא מוכן).
      if (document.fonts) {
        try {
          if (document.fonts.load) {
            await Promise.all(
              [400, 600, 700, 800].map(function (w) {
                return document.fonts.load(w + ' 13.5px Heebo', 'אבג(1)abc');
              })
            );
          }
          if (document.fonts.ready) await document.fonts.ready;
        } catch (e) {}
      }
      var imgs = [];
      pages.forEach(function (p) {
        p.querySelectorAll('img').forEach(function (img) {
          imgs.push(img);
        });
      });
      await Promise.all(
        imgs.map(function (img) {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise(function (resolve) {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
            setTimeout(resolve, 4000);
          });
        })
      );

      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      var pageWidth = 210;
      var pageHeight = 297;
      var epsilon = 5;
      var firstPage = true;

      for (var i = 0; i < pages.length; i++) {
        // תופסים תמיד את העמוד בגודלו האמיתי (794px), גם אם כרגע הוא מוקטן ויזואלית לתצוגת מובייל
        var pageEl = pages[i];
        var wrapEl = pageEl.parentElement;
        var prevTransform = pageEl.style.transform;
        var prevWrapWidth = wrapEl.style.width;
        var prevWrapHeight = wrapEl.style.height;
        var prevWrapOverflow = wrapEl.style.overflow;
        pageEl.style.transform = 'none';
        wrapEl.style.width = '';
        wrapEl.style.height = '';
        wrapEl.style.overflow = 'visible';
        // letterRendering: true - בלי זה html2canvas לפעמים "בולע" רווחים
        // בין מילים בטקסט עברי (עם הפונט המשתנה Heebo), והתוצאה מילים
        // שדבוקות זו לזו ב-PDF.
        var canvas = await window.html2canvas(pageEl, { scale: 3, backgroundColor: '#ffffff', useCORS: true, letterRendering: true });
        pageEl.style.transform = prevTransform;
        wrapEl.style.width = prevWrapWidth;
        wrapEl.style.height = prevWrapHeight;
        wrapEl.style.overflow = prevWrapOverflow;
        var imageData = canvas.toDataURL('image/png');
        var imageHeight = (canvas.height * pageWidth) / canvas.width;
        var heightLeft = imageHeight;
        var position = 0;
        if (!firstPage) pdf.addPage();
        firstPage = false;
        pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
        heightLeft -= pageHeight;
        while (heightLeft > epsilon) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
          heightLeft -= pageHeight;
        }
      }
      pdf.save(quoteFileName() + '.pdf');
    } catch (err) {
      console.error(err);
      alert('יצירת ה-PDF נכשלה. כדאי לנסות שוב');
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = 'הורדת PDF';
    }
  }

  /* ================= אתחול ================= */

  backBtn.addEventListener('click', goBack);
  nextBtn.addEventListener('click', goNext);
  closePreviewBtn.addEventListener('click', closePreview);
  downloadBtn.addEventListener('click', downloadPdf);
  newQuoteBtn.addEventListener('click', function () {
    if (confirm('להתחיל הצעת מחיר חדשה? כל מה שמילאת בהצעה הנוכחית יימחק.')) {
      resetApp();
    }
  });

  renderStep();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
