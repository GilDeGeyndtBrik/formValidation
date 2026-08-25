(function(){
  var form = document.getElementById('kotForm');
  var summaryAlert = document.getElementById('summaryAlert');
  var successPanel = document.getElementById('successPanel');

  // Set minimum selectable dates to today (no past dates).
  var today = new Date();
  var todayStr = today.toISOString().slice(0,10);
  document.getElementById('startdatum').setAttribute('min', todayStr);

  // Reasonable birthdate bounds: must be at least 15 years old, not older than 100.
  var minBirth = new Date(today.getFullYear()-100, today.getMonth(), today.getDate()).toISOString().slice(0,10);
  var maxBirth = new Date(today.getFullYear()-15, today.getMonth(), today.getDate()).toISOString().slice(0,10);
  document.getElementById('geboortedatum').setAttribute('min', minBirth);
  document.getElementById('geboortedatum').setAttribute('max', maxBirth);

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phoneRe = /^(\+?\d[\d\s.\-]{7,14}\d)$/;
  var postcodeRe = /^\d{4}$/;

  // Belgische rijksregisternummer-validatie (modulo-97 controlegetal).
  function isValidRijksregisternummer(raw){
    var digits = String(raw).replace(/[^0-9]/g, '');
    if(digits.length !== 11) return false;

    var first9 = parseInt(digits.slice(0, 9), 10);
    var checkDigits = parseInt(digits.slice(9, 11), 10);

    var checkBefore2000 = 97 - (first9 % 97);
    var checkFrom2000 = 97 - ((2000000000 + first9) % 97);

    return checkDigits === checkBefore2000 || checkDigits === checkFrom2000;
  }

  function validators(){
    return {
      voornaam: function(v){ return v.trim().length > 0; },
      achternaam: function(v){ return v.trim().length > 0; },
      geboortedatum: function(v){
        if(!v) return false;
        return v >= minBirth && v <= maxBirth;
      },
      email: function(v){ return emailRe.test(v.trim()); },
      telefoon: function(v){ return phoneRe.test(v.trim()); },
      straat: function(v){ return v.trim().length > 2; },
      postcode: function(v){ return postcodeRe.test(v.trim()); },
      gemeente: function(v){ return v.trim().length > 0; },
      instelling: function(v){ return v !== ''; },
      studierichting: function(v){ return v.trim().length > 0; },
      jaar: function(v){ return v !== ''; },
      startdatum: function(v){ return !!v && v >= todayStr; },
      duur: function(v){ return v !== ''; },
      type: function(v){ return v !== ''; },
      budget: function(v){
        if(v === '') return false;
        var n = Number(v);
        return !isNaN(n) && n >= 50 && n <= 2000;
      },
      rijksregisternummer: function(v){
        v = v.trim();
        if(v === '') return true; // optioneel veld: enkel valideren indien ingevuld
        return isValidRijksregisternummer(v);
      },
      akkoord: function(v, el){ return el.checked; }
    };
  }

  var rules = validators();

  function fieldEl(name){ return form.elements[name]; }
  function errorEl(name){ return document.getElementById('err-' + name); }

  function setInvalid(name, invalid){
    var el = fieldEl(name);
    var err = errorEl(name);
    if(!el) return;
    if(invalid){
      el.setAttribute('aria-invalid', 'true');
      if(err) err.classList.add('show');
    } else {
      el.setAttribute('aria-invalid', 'false');
      if(err) err.classList.remove('show');
    }
  }

  function validateField(name){
    var el = fieldEl(name);
    if(!el || !rules[name]) return true;
    var value = el.type === 'checkbox' ? el.checked : el.value;
    var valid = el.type === 'checkbox' ? rules[name](value, el) : rules[name](value);
    setInvalid(name, !valid);
    return valid;
  }

  Object.keys(rules).forEach(function(name){
    var el = fieldEl(name);
    if(!el) return;
    var evt = (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'date') ? 'change' : 'blur';
    el.addEventListener(evt, function(){ validateField(name); });
    el.addEventListener('input', function(){
      if(el.getAttribute('aria-invalid') === 'true'){ validateField(name); }
    });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var allValid = true;
    var firstInvalidEl = null;

    Object.keys(rules).forEach(function(name){
      var ok = validateField(name);
      if(!ok){
        allValid = false;
        if(!firstInvalidEl){ firstInvalidEl = fieldEl(name); }
      }
    });

    if(!allValid){
      summaryAlert.classList.add('show');
      summaryAlert.focus();
      if(firstInvalidEl){ firstInvalidEl.focus(); }
      return;
    }

    summaryAlert.classList.remove('show');
    form.style.display = 'none';
    successPanel.classList.add('show');
    successPanel.focus();
  });

  document.getElementById('resetBtn').addEventListener('click', function(){
    form.reset();
    Object.keys(rules).forEach(function(name){ setInvalid(name, false); });
    successPanel.classList.remove('show');
    form.style.display = '';
    summaryAlert.classList.remove('show');
    window.scrollTo({top: form.offsetTop - 20, behavior:'smooth'});
  });
})();
