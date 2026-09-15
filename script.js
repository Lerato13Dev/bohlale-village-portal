/* =========================================================================
   BOHLALE VILLAGE RESIDENCE PORTAL — script.js
   -------------------------------------------------------------------------
   Architecture (front-end prototype, backend-ready):
     DATA      — static + seed data. In production this comes from an API.
     STORE     — localStorage-backed persistence for user-generated content.
                 Prototype persistence — replace with API/database in production.
     UTIL      — small formatting / validation helpers.
     RENDER    — one render function per view. Pure-ish: reads DATA/STORE,
                 returns/injects HTML into #main.
     EVENTS    — delegated event handling + form logic.
     ROUTER    — hash-based navigation between views.
   No secrets, tokens or credentials live here. Client-side validation below
   is for UX only — a real backend must re-validate and authenticate every
   request server-side.
   ========================================================================= */

(function () {
  "use strict";

  /* =========================================================
     DATA — residence leadership (source: supplied House Committee
     2025/26 roster + individually supplied leadership photos).
     Do not invent names, positions or numbers here — only use what
     was supplied.
     ========================================================= */
  const LEADERSHIP = [
    {
      id: "thomas-tsokolibane",
      name: "Thomas Tsokolibane",
      position: "Primarius & SID Officer",
      top: true,
      bio: "Head of the residence house committee — oversees overall operations and Student-in-Discipline (SID) matters for Bohlale Village.",
      email: "44920490@mynwu.ac.za",
      phone: "065 986 3208",
      image: "assets/leadership/thomas-tsokolibane.jpg",
    },
    {
      id: "latoya-mabena",
      name: "Latoya Mabena",
      position: "Vice Primaria & Legal Officer",
      bio: "Deputises for the Primarius and manages residence legal and constitutional matters.",
      email: "44914962@mynwu.ac.za",
      phone: "060 789 3872",
      image: "assets/leadership/latoya-mabena.jpg",
    },
    {
      id: "karabo-tloti",
      name: "Karabo Tloti",
      position: "Secretary",
      bio: "Keeps house committee records, minutes and official residence correspondence.",
      email: "45744955@mynwu.ac.za",
      phone: "068 539 0777",
      image: "assets/leadership/karabo-tloti.jpg",
    },
    {
      id: "teboho-khabele",
      name: "Teboho Khabele",
      position: "Treasurer, Fundraising & RAG Officer",
      bio: "Manages residence finances and leads fundraising and RAG initiatives.",
      email: "46428399@mynwu.ac.za",
      phone: "063 337 3151",
      image: "assets/leadership/teboho-khabele.jpg",
    },
    {
      id: "kamohelo-senokoane",
      name: 'Kamohelo Senokoane',
      position: "Academic Officer",
      bio: "Champions academic support programmes and study initiatives for residents.",
      email: "44273622@mynwu.ac.za",
      phone: "068 280 6760",
      image: "assets/leadership/kamohelo-senokoane.jpg",
    },
    {
      id: "tshepo-kgosipelo",
      name: "Tshepo Kgosipelo",
      position: "TAD with Current Affairs Officer",
      bio: "Coordinates transport-and-departure logistics and keeps residents informed on current affairs.",
      email: "42336074@mynwu.ac.za",
      phone: "083 397 7114",
      image: "assets/leadership/tshepo-kgosipelo.jpg",
    },
    {
      id: "siyabonga-kunene",
      name: "Siyabonga Kunene",
      position: "CSE & Maintenance Officer",
      bio: "Handles community service engagement and coordinates residence maintenance reporting.",
      email: "53042654@mynwu.ac.za",
      phone: "071 964 8763",
      image: "assets/leadership/siyabonga-kunene.jpg",
    },
    {
      id: "sakhile-magwaza",
      name: "Sakhile Magwaza",
      position: "Arts & Culture and First Years Liaison Officer",
      bio: "Drives arts, culture and heritage programming and supports first-year integration.",
      email: "52279162@mynwu.ac.za",
      phone: "072 987 0604",
      image: "assets/leadership/sakhile-magwaza.jpg",
    },
    {
      id: "slindile-nkosi",
      name: "Slindile Nkosi",
      position: "Marketing & Recruitment Officer",
      bio: "Runs residence marketing, brand presence and recruitment campaigns.",
      email: "46432892@mynwu.ac.za",
      phone: "076 186 1616",
      image: "assets/leadership/slindile-nkosi.jpg",
    },
    {
      id: "lethukuthula-vilakazi",
      name: "Lethukuthula Vilakazi",
      position: "Sports Officer",
      bio: "Organises residence sports fixtures, training and inter-residence competition.",
      email: "45450668@mynwu.ac.za",
      phone: "068 264 3109",
      image: "assets/leadership/lethukuthula-vilakazi.jpg",
    },
  ];

  // Subcommittees — grouped from the same real house-committee portfolios.
  // (No separate subcommittee membership was supplied, so groupings reflect
  // each officer's own stated portfolio rather than invented committees.)
  const COMMITTEES = [
    {
      name: "Governance & Legal",
      icon: "gavel",
      blurb: "Residence leadership, constitution and disciplinary matters.",
      members: ["thomas-tsokolibane", "latoya-mabena", "karabo-tloti"],
    },
    {
      name: "Finance & RAG",
      icon: "wallet",
      blurb: "Budgeting, fundraising and RAG fundraising events.",
      members: ["teboho-khabele"],
    },
    {
      name: "Academic Affairs",
      icon: "graduation-cap",
      blurb: "Study support and academic programming for residents.",
      members: ["kamohelo-senokoane"],
    },
    {
      name: "Current Affairs & Transport",
      icon: "radio",
      blurb: "Resident communication, transport and departure logistics.",
      members: ["tshepo-kgosipelo"],
    },
    {
      name: "Maintenance & Community Service",
      icon: "wrench",
      blurb: "Facility upkeep, issue escalation and community service engagement.",
      members: ["siyabonga-kunene"],
    },
    {
      name: "Arts, Culture & First Years",
      icon: "palette",
      blurb: "Heritage, arts programming and first-year integration.",
      members: ["sakhile-magwaza"],
    },
    {
      name: "Marketing & Recruitment",
      icon: "megaphone",
      blurb: "Residence branding, socials and recruitment drives.",
      members: ["slindile-nkosi"],
    },
    {
      name: "Sports",
      icon: "trophy",
      blurb: "Fixtures, training schedules and inter-residence competition.",
      members: ["lethukuthula-vilakazi"],
    },
  ];

  // No emerging/future-leader submissions were supplied — kept genuinely
  // empty rather than inventing students. Shown as a respectful empty state.
  const EMERGING_LEADERS = [];

  // Official Bohlale Village bus timetable — transcribed exactly from the
  // supplied schedule photo (Monday–Friday / Saturday / Sunday). Every time
  // below, including the two separate 19:45 From Campus departures, matches
  // the source image precisely — nothing added, removed or rounded.
  const BUS_SCHEDULE = {
    isDemoData: false,
    weekdays: {
      toCampus: [
        "06:50", "07:00", "07:10", "07:20", "07:45", "08:00", "08:30", "08:50",
        "09:00", "09:30", "10:00", "10:30", "10:45", "11:30", "12:00", "12:15",
        "12:30", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30",
        "15:00", "15:30", "15:45", "16:00", "16:30", "17:00", "17:30", "17:45",
        "18:00", "19:00", "19:30",
      ],
      fromCampus: [
        "07:00", "07:10", "07:20", "07:30", "08:00", "08:30", "08:45", "09:10",
        "09:30", "09:45", "10:15", "10:45", "11:00", "11:45", "12:15", "12:30",
        "12:45", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45",
        "15:15", "15:45", "16:00", "16:15", "16:45", "17:15", "17:45", "18:00",
        "18:15", "19:15", "19:45", "19:45", "20:30", "21:30",
      ],
    },
    saturday: {
      toCampus: ["08:00", "13:00"],
      fromCampus: ["12:00", "16:00"],
    },
    sunday: {
      toCampus: ["09:00"],
      fromCampus: ["13:00"],
    },
  };

  const ANNOUNCEMENTS = [
    {
      id: "a1",
      title: "Bohlale Village — 2026 Carnival Winners",
      category: "Events",
      date: "2026-08-01",
      demo: false,
      body: "Bohlale Village was announced as a 2026 Residence Carnival winner, following on from the 2024 title — as shared on the residence TikTok page.",
    },
    {
      id: "a2",
      title: "Demo announcement: House committee meeting this week",
      category: "Residence",
      date: "2026-09-10",
      demo: true,
      body: "Sample content — residence meetings would be posted here by the house committee, replacing this placeholder.",
    },
    {
      id: "a3",
      title: "Demo announcement: Exam-season study groups",
      category: "Academic",
      date: "2026-09-08",
      demo: true,
      body: "Sample content — the Academic Officer would post real study-group schedules here ahead of assessments.",
    },
    {
      id: "a4",
      title: "Demo announcement: Please check the bus schedule before travelling",
      category: "Residence",
      date: "2026-09-05",
      demo: true,
      body: "Sample content — service updates and schedule changes would be posted here in place of this placeholder.",
    },
  ];

  const ISSUE_CATEGORIES = [
    { id: "shower", label: "Shower", icon: "shower-head" },
    { id: "stove", label: "Stove", icon: "flame" },
    { id: "electricity", label: "Electricity", icon: "zap" },
    { id: "bulb", label: "Light bulb", icon: "lightbulb" },
    { id: "lamp", label: "Study lamp", icon: "lamp-desk" },
    { id: "water", label: "Water", icon: "droplets" },
    { id: "toilet", label: "Toilet", icon: "toilet" },
    { id: "door", label: "Door / Lock", icon: "door-closed" },
    { id: "furniture", label: "Furniture", icon: "armchair" },
    { id: "wifi", label: "Wi-Fi", icon: "wifi" },
    { id: "cleaning", label: "Cleaning", icon: "sparkles" },
    { id: "other", label: "Other", icon: "circle-ellipsis" },
  ];

  const PETITION_CATEGORIES = ["Events", "Residence Facilities", "Student Welfare", "Academic", "Sports", "Entertainment", "Other"];

  const SEED_ISSUES = [
    { ref: "BV-2026-001", unit: "B12", category: "shower", description: "Shower head leaking constantly.", status: "progress", date: "2026-09-05" },
    { ref: "BV-2026-002", unit: "B12", category: "lamp", description: "Study lamp not switching on.", status: "resolved", date: "2026-09-01" },
    { ref: "BV-2026-003", unit: "B12", category: "electricity", description: "Plug socket sparks when used.", status: "acknowledged", date: "2026-09-10" },
  ];

  const SEED_PETITIONS = [
    {
      id: "p1",
      title: "Goaumba 2026 — request for an official date",
      category: "Events",
      reason: "Students want clarity so we can plan around the residence's biggest social event of the year.",
      description: "Many residents have asked when Goaumba 2026 will take place and what the residence committee has confirmed so far. This petition asks the house committee to publish a firm date and programme.",
      creatorMasked: "44***490",
      supporters: 87,
      date: "2026-08-20",
      demo: true,
      status: "Open",
    },
  ];

  /* =========================================================
     STORE — prototype persistence via localStorage.
     Replace with API/database calls in production; keep the same
     function signatures so callers don't need to change.
     ========================================================= */
  const STORE = {
    _get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        console.error("Storage read failed", e);
        return fallback;
      }
    },
    _set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error("Storage write failed", e);
      }
    },
    getIssues() {
      const stored = this._get("bv_issues", null);
      if (stored === null) {
        this._set("bv_issues", SEED_ISSUES);
        return SEED_ISSUES.slice();
      }
      return stored;
    },
    addIssue(issue) {
      const issues = this.getIssues();
      issues.unshift(issue);
      this._set("bv_issues", issues);
    },
    getPetitions() {
      const stored = this._get("bv_petitions", null);
      if (stored === null) {
        this._set("bv_petitions", SEED_PETITIONS);
        return SEED_PETITIONS.slice();
      }
      return stored;
    },
    addPetition(p) {
      const petitions = this.getPetitions();
      petitions.unshift(p);
      this._set("bv_petitions", petitions);
    },
    updatePetition(id, updater) {
      const petitions = this.getPetitions();
      const idx = petitions.findIndex((p) => p.id === id);
      if (idx > -1) {
        petitions[idx] = updater(petitions[idx]);
        this._set("bv_petitions", petitions);
      }
    },
    hasSigned(petitionId, studentNumber) {
      const signatures = this._get("bv_signatures", {});
      return !!(signatures[petitionId] && signatures[petitionId].includes(studentNumber));
    },
    recordSignature(petitionId, studentNumber) {
      const signatures = this._get("bv_signatures", {});
      if (!signatures[petitionId]) signatures[petitionId] = [];
      signatures[petitionId].push(studentNumber);
      this._set("bv_signatures", signatures);
    },
  };

  /* =========================================================
     UTIL
     ========================================================= */
  const UTIL = {
    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str == null ? "" : String(str);
      return div.innerHTML;
    },
    formatDate(iso) {
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
    },
    maskStudentNumber(num) {
      const s = String(num);
      if (s.length <= 4) return s[0] + "***";
      return s.slice(0, 2) + "*".repeat(Math.max(2, s.length - 4)) + s.slice(-2);
    },
    phoneDigits(phone) {
      // Normalise a South African local number to international digits for tel/WhatsApp links.
      let digits = phone.replace(/\D/g, "");
      if (digits.startsWith("0")) digits = "27" + digits.slice(1);
      return digits;
    },
    telHref(phone) {
      return "tel:+" + this.phoneDigits(phone);
    },
    waHref(phone) {
      return "https://wa.me/" + this.phoneDigits(phone);
    },
    statusMeta(status) {
      const map = {
        submitted: { label: "Submitted", cls: "status--submitted" },
        acknowledged: { label: "Acknowledged", cls: "status--acknowledged" },
        progress: { label: "In Progress", cls: "status--progress" },
        resolved: { label: "Resolved", cls: "status--resolved" },
      };
      return map[status] || map.submitted;
    },
    genReference() {
      const year = new Date().getFullYear();
      const n = Math.floor(1000 + Math.random() * 9000);
      return `BV-${year}-${n}`;
    },
    leaderById(id) {
      return LEADERSHIP.find((l) => l.id === id);
    },
    qs(sel, ctx) {
      return (ctx || document).querySelector(sel);
    },
    qsa(sel, ctx) {
      return Array.from((ctx || document).querySelectorAll(sel));
    },
  };

  /* Expose namespaces for the rest of the file (loaded below) */
  window.BV = { LEADERSHIP, COMMITTEES, EMERGING_LEADERS, BUS_SCHEDULE, ANNOUNCEMENTS, ISSUE_CATEGORIES, PETITION_CATEGORIES, STORE, UTIL };
})();


/* =========================================================================
   PART 2 — RENDER, EVENTS, ROUTER
   ========================================================================= */
(function () {
  "use strict";
  const { LEADERSHIP, COMMITTEES, EMERGING_LEADERS, BUS_SCHEDULE, ANNOUNCEMENTS, ISSUE_CATEGORIES, PETITION_CATEGORIES, STORE, UTIL } = window.BV;

  const main = document.getElementById("main");

  // Real Bohlale Village TikTok videos supplied for embedding via the
  // official TikTok embed script (no scraping, no API key — this is
  // TikTok's own public oEmbed embed, same as pasting a link into any CMS).
  const TIKTOK_VIDEOS = [
    "https://www.tiktok.com/@nwubohlalevillage/video/7637090832813690133",
    "https://www.tiktok.com/@nwubohlalevillage/video/7639751683945352468",
  ];

  function tiktokVideoId(url) {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  }

  // TikTok's embed.js only converts <blockquote class="tiktok-embed"> markup
  // present in the DOM at the moment it runs. Because this is a client-side
  // router that swaps #main's innerHTML, we inject a fresh copy of the
  // script after every render that contains embeds, so newly-inserted
  // blockquotes actually get converted into playable embeds.
  function loadTikTokEmbeds() {
    if (!UTIL.qs(".tiktok-embed")) return;
    const old = document.getElementById("tiktokEmbedScript");
    if (old) old.remove();
    const script = document.createElement("script");
    script.id = "tiktokEmbedScript";
    script.async = true;
    script.src = "https://www.tiktok.com/embed.js";
    document.body.appendChild(script);
  }

  /* ---------------------------------------------------------
     TOAST
     --------------------------------------------------------- */
  function toast(message, icon) {
    const stack = document.getElementById("toastStack");
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<i data-lucide="${icon || "check-circle"}"></i><span>${UTIL.escapeHtml(message)}</span>`;
    stack.appendChild(el);
    renderIcons(el);
    setTimeout(() => {
      el.style.transition = "opacity .25s, transform .25s";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(() => el.remove(), 250);
    }, 2600);
  }

  function renderIcons(ctx) {
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons({ context: ctx }); } catch (e) { /* noop */ }
    }
  }

  /* ---------------------------------------------------------
     MODAL
     --------------------------------------------------------- */
  function openModal(innerHtml, onMount) {
    const scrim = document.createElement("div");
    scrim.className = "modal-scrim";
    scrim.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${innerHtml}</div>`;
    document.body.appendChild(scrim);
    renderIcons(scrim);
    scrim.addEventListener("click", (e) => { if (e.target === scrim) closeModal(scrim); });
    document.addEventListener("keydown", escHandler);
    function escHandler(e) { if (e.key === "Escape") { closeModal(scrim); } }
    scrim._escHandler = escHandler;
    if (onMount) onMount(scrim);
    return scrim;
  }
  function closeModal(scrim) {
    document.removeEventListener("keydown", scrim._escHandler);
    scrim.remove();
  }

  /* ---------------------------------------------------------
     LEADER CARD PARTIALS
     --------------------------------------------------------- */
  const SVG_PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>';
  const SVG_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';

  function contactButtons(leader, compact) {
    if (!leader.phone) {
      return `<span class="${compact ? "unavailable" : "badge badge--demo"}">Contact details unavailable</span>`;
    }
    return `
      <a href="${UTIL.telHref(leader.phone)}" aria-label="Call ${UTIL.escapeHtml(leader.name)}">${SVG_PHONE}Call</a>
      <a href="${UTIL.waHref(leader.phone)}" target="_blank" rel="noopener" aria-label="WhatsApp ${UTIL.escapeHtml(leader.name)}">${SVG_CHAT}Chat</a>
    `;
  }

  function leaderCard(leader) {
    return `
      <article class="card leader-card">
        <a href="#/leadership/${leader.id}" data-route="/leadership/${leader.id}">
          <img class="leader-card__photo" src="${leader.image}" alt="Portrait of ${UTIL.escapeHtml(leader.name)}" loading="lazy"
               onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27400%27><rect width=%27400%27 height=%27400%27 fill=%27%23F1EADC%27/></svg>'">
        </a>
        <div class="leader-card__body">
          <h3><a href="#/leadership/${leader.id}" data-route="/leadership/${leader.id}">${UTIL.escapeHtml(leader.name)}</a></h3>
          <span class="role">${UTIL.escapeHtml(leader.position)}</span>
          <div class="leader-card__actions">${contactButtons(leader, true)}</div>
        </div>
      </article>`;
  }

  /* ---------------------------------------------------------
     VIEW: HOME
     --------------------------------------------------------- */
  function viewHome() {
    const featured = LEADERSHIP.filter((l) => l.top).concat(LEADERSHIP.filter((l) => !l.top)).slice(0, 4);
    const latestAnnouncements = ANNOUNCEMENTS.slice(0, 3);
    return `
    <section class="hero">
      <div class="hero__inner">
        <div class="hero__eyebrow"><img src="assets/logo/bohlale-logo.png" alt="">Bohlale Village Residence Portal</div>
        <h1>Your residence.<br>Your community.<br><span class="accent">Your voice.</span></h1>
        <p class="lede">Everything you need for day-to-day residence life in one place — report issues, catch the next bus, know your leadership, and have your say — without digging through WhatsApp.</p>
        <div class="hero__actions">
          <a href="#/report" class="btn btn--gold" data-route="/report"><i data-lucide="megaphone"></i>Report an Issue</a>
          <a href="#/bus" class="btn btn--outline" data-route="/bus"><i data-lucide="bus"></i>View Bus Schedule</a>
        </div>
      </div>
    </section>

    <div class="quick-grid">
      <a class="quick-card" href="#/report" data-route="/report"><i data-lucide="megaphone"></i><strong>Report an Issue</strong><span>Broken shower, stove, lights &amp; more</span></a>
      <a class="quick-card" href="#/bus" data-route="/bus"><i data-lucide="bus"></i><strong>Bus Schedule</strong><span>Weekday, Saturday &amp; Sunday times</span></a>
      <a class="quick-card" href="#/leadership" data-route="/leadership"><i data-lucide="users"></i><strong>Leadership</strong><span>Meet your house committee</span></a>
      <a class="quick-card" href="#/petitions" data-route="/petitions"><i data-lucide="scroll-text"></i><strong>Petitions</strong><span>Raise and support residence issues</span></a>
    </div>

    <section class="section">
      <div class="wrap">
        <div class="section__head">
          <div><h2>Latest announcements</h2><p>What's happening around the residence right now.</p></div>
          <a class="section__link" href="#/announcements" data-route="/announcements">See all <i data-lucide="arrow-right"></i></a>
        </div>
        <div class="announce-scroll">
          ${latestAnnouncements.map(announcementCard).join("")}
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="wrap">
        <div class="section__head">
          <div><h2>Residence leadership</h2><p>The 2025/26 house committee — real students, real portfolios.</p></div>
          <a class="section__link" href="#/leadership" data-route="/leadership">Meet everyone <i data-lucide="arrow-right"></i></a>
        </div>
        <div class="leader-grid">${featured.map(leaderCard).join("")}</div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section__head">
          <div><h2>Bohlale Village on TikTok</h2><p>Follow residence life, events and the Bahlali Podcast.</p></div>
          <a class="section__link" href="#/community" data-route="/community">Open <i data-lucide="arrow-right"></i></a>
        </div>
        ${tiktokPanel(true)}
      </div>
    </section>

    <section class="section section--alt">
      <div class="wrap">
        <div class="section__head">
          <div><h2>Important contacts</h2><p>Reach your leadership directly.</p></div>
          <a class="section__link" href="#/contacts" data-route="/contacts">All contacts <i data-lucide="arrow-right"></i></a>
        </div>
        <div class="contact-grid">${LEADERSHIP.slice(0, 4).map(contactCard).join("")}</div>
      </div>
    </section>
    `;
  }

  function announcementCard(a) {
    return `
      <article class="card announce-card">
        <div class="announce-card__top">
          <span class="badge ${a.demo ? "badge--demo" : ""}">${UTIL.escapeHtml(a.category)}</span>
          <time>${UTIL.formatDate(a.date)}</time>
        </div>
        <h3>${UTIL.escapeHtml(a.title)}</h3>
        <p>${UTIL.escapeHtml(a.body)}</p>
      </article>`;
  }

  function tiktokPanel(compact) {
    const profileCard = `
      <div class="tiktok-panel">
        <img src="assets/logo/bohlale-logo.png" alt="" class="tiktok-panel__logo">
        <span class="badge" style="margin-bottom:14px;">Official residence account</span>
        <h2>@nwubohlalevillage</h2>
        <p>Vanderbijlpark · NWU student residence · 2024 &amp; 2026 Carnival Winners</p>
        <div class="tiktok-stats">
          <div><strong>479</strong><span>Followers</span></div>
          <div><strong>21.4K</strong><span>Likes</span></div>
          <div><strong>5</strong><span>Following</span></div>
        </div>
        <a class="btn btn--gold" href="https://www.tiktok.com/@nwubohlalevillage?_r=1&_t=ZS-99jgZEcHglk" target="_blank" rel="noopener">
          <i data-lucide="external-link"></i>Follow @nwubohlalevillage on TikTok
        </a>
      </div>`;
    if (compact) return profileCard;
    const embeds = `
      <div class="tiktok-embed-grid">
        ${TIKTOK_VIDEOS.map((url) => {
          const id = tiktokVideoId(url);
          return `
          <blockquote class="tiktok-embed" cite="${url}" data-video-id="${id}" style="max-width: 605px;min-width: 325px;">
            <section></section>
          </blockquote>`;
        }).join("")}
      </div>`;
    return profileCard + embeds;
  }

  function contactCard(l) {
    return `
      <div class="card contact-card">
        <img class="contact-card__avatar" src="${l.image}" alt="">
        <div class="contact-card__body">
          <strong>${UTIL.escapeHtml(l.name)}</strong>
          <span>${UTIL.escapeHtml(l.position)}</span>
        </div>
        <div class="contact-card__actions">
          ${l.phone ? `<a href="${UTIL.telHref(l.phone)}" aria-label="Call ${UTIL.escapeHtml(l.name)}">${SVG_PHONE}</a>
          <a href="${UTIL.waHref(l.phone)}" target="_blank" rel="noopener" aria-label="WhatsApp ${UTIL.escapeHtml(l.name)}">${SVG_CHAT}</a>` : ""}
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------
     VIEW: RESIDENCE
     --------------------------------------------------------- */
  function viewResidence() {
    return `
    <section class="section">
      <div class="wrap">
        <div class="section-title-wrap">
          <img src="assets/logo/bohlale-logo.png" alt="" style="width:64px;margin:0 auto 16px;">
          <h1 style="font-size:2rem;">About Bohlale Village</h1>
          <p style="color:var(--ink-soft);margin-top:10px;">A North-West University student residence in Vanderbijlpark — "A Home Where Lokshin Culture Is Embraced."</p>
        </div>
        <div class="leader-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="card" style="padding:22px;"><i data-lucide="users" style="color:var(--gold-deep);width:26px;height:26px;"></i><h3 style="margin-top:12px;font-size:1.05rem;">Community-led</h3><p style="color:var(--ink-soft);font-size:.9rem;margin-top:6px;">Run by a 10-member elected house committee representing residents' interests.</p></div>
          <div class="card" style="padding:22px;"><i data-lucide="trophy" style="color:var(--gold-deep);width:26px;height:26px;"></i><h3 style="margin-top:12px;font-size:1.05rem;">Carnival champions</h3><p style="color:var(--ink-soft);font-size:.9rem;margin-top:6px;">2024 &amp; 2026 Residence Carnival winners.</p></div>
          <div class="card" style="padding:22px;"><i data-lucide="mic-2" style="color:var(--gold-deep);width:26px;height:26px;"></i><h3 style="margin-top:12px;font-size:1.05rem;">Bahlali Podcast</h3><p style="color:var(--ink-soft);font-size:.9rem;margin-top:6px;">A residence-run talk show covering corridor-to-campus affairs.</p></div>
          <div class="card" style="padding:22px;"><i data-lucide="heart-handshake" style="color:var(--gold-deep);width:26px;height:26px;"></i><h3 style="margin-top:12px;font-size:1.05rem;">Lokshin culture</h3><p style="color:var(--ink-soft);font-size:.9rem;margin-top:6px;">A residence identity built around embracing Lokshin culture and community.</p></div>
        </div>
      </div>
    </section>`;
  }

  /* ---------------------------------------------------------
     VIEW: LEADERSHIP LIST + PROFILE
     --------------------------------------------------------- */
  function viewLeadershipList() {
    const primarius = LEADERSHIP.find((l) => l.top);
    const rest = LEADERSHIP.filter((l) => !l.top);
    return `
    <section class="section">
      <div class="wrap">
        <div class="section-title-wrap">
          <h1 style="font-size:2rem;">Residence Leadership</h1>
          <p style="color:var(--ink-soft);margin-top:8px;">The 2025/26 Bohlale Village house committee.</p>
        </div>

        <div class="leader-hero">
          <img class="leader-hero__photo" src="${primarius.image}" alt="Portrait of ${UTIL.escapeHtml(primarius.name)}">
          <div class="leader-hero__body">
            <span class="badge"><i data-lucide="star" style="width:12px;height:12px;"></i>&nbsp;Primarius</span>
            <h2>${UTIL.escapeHtml(primarius.name)}</h2>
            <p class="role">${UTIL.escapeHtml(primarius.position)}</p>
            <p class="bio">${UTIL.escapeHtml(primarius.bio)}</p>
            <div class="leader-hero__actions">
              <a class="btn btn--outline btn--sm" href="${UTIL.telHref(primarius.phone)}"><i data-lucide="phone"></i>Call</a>
              <a class="btn btn--dark btn--sm" href="${UTIL.waHref(primarius.phone)}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i>WhatsApp</a>
              <a class="btn btn--ghost btn--sm" href="mailto:${primarius.email}"><i data-lucide="mail"></i>Email</a>
            </div>
          </div>
        </div>

        <div class="leader-grid">${rest.map(leaderCard).join("")}</div>
      </div>
    </section>`;
  }

  function viewLeaderProfile(id) {
    const leader = UTIL.leaderById(id);
    if (!leader) return notFound("Leader not found");
    return `
    <section class="section">
      <div class="wrap" style="max-width:720px;">
        <a class="section__link" href="#/leadership" data-route="/leadership" style="margin-bottom:20px;display:inline-flex;"><i data-lucide="arrow-left"></i>All leadership</a>
        <div class="leader-hero">
          <img class="leader-hero__photo" src="${leader.image}" alt="Portrait of ${UTIL.escapeHtml(leader.name)}">
          <div class="leader-hero__body">
            <span class="badge">${leader.top ? "Primarius" : "House Committee"}</span>
            <h2>${UTIL.escapeHtml(leader.name)}</h2>
            <p class="role">${UTIL.escapeHtml(leader.position)}</p>
            <p class="bio">${UTIL.escapeHtml(leader.bio)}</p>
            <div class="leader-hero__actions">
              ${leader.phone ? `
                <a class="btn btn--outline btn--sm" href="${UTIL.telHref(leader.phone)}"><i data-lucide="phone"></i>Call</a>
                <a class="btn btn--dark btn--sm" href="${UTIL.waHref(leader.phone)}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i>WhatsApp</a>` : `<span class="badge badge--demo">Contact details unavailable</span>`}
              <a class="btn btn--ghost btn--sm" href="mailto:${leader.email}"><i data-lucide="mail"></i>Email</a>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ---------------------------------------------------------
     VIEW: COMMITTEES
     --------------------------------------------------------- */
  function viewCommittees() {
    return `
    <section class="section">
      <div class="wrap">
        <div class="section-title-wrap">
          <h1 style="font-size:2rem;">Subcommittees</h1>
          <p style="color:var(--ink-soft);margin-top:8px;">Portfolios within the Bohlale Village house committee.</p>
        </div>
        ${COMMITTEES.map((c) => `
          <div class="committee-group">
            <div class="committee-group__head">
              <i data-lucide="${c.icon}"></i>
              <div><h3>${UTIL.escapeHtml(c.name)}</h3><p>${UTIL.escapeHtml(c.blurb)}</p></div>
            </div>
            <div class="leader-grid">${c.members.map((id) => leaderCard(UTIL.leaderById(id))).join("")}</div>
          </div>`).join("")}
      </div>
    </section>`;
  }

  /* ---------------------------------------------------------
     VIEW: EMERGING LEADERS
     --------------------------------------------------------- */
  function viewEmerging() {
    return `
    <section class="section">
      <div class="wrap" style="max-width:720px;">
        <div class="section-title-wrap">
          <h1 style="font-size:2rem;">Emerging Leaders</h1>
          <p style="color:var(--ink-soft);margin-top:8px;">Students contributing to the residence community and developing leadership experience.</p>
        </div>
        <div class="empty-state">
          <i data-lucide="sprout"></i>
          <h3>No emerging leaders listed yet</h3>
          <p>Nobody has been submitted to this section yet. Once the residence shares its emerging-leader photos and names, they'll be featured here — respectfully, and never as though they hold an official position.</p>
        </div>
      </div>
    </section>`;
  }

  /* ---------------------------------------------------------
     VIEW: REPORT ISSUE (multi-step form)
     --------------------------------------------------------- */
  let reportState = { step: 1, unit: "", category: "", description: "", studentNumber: "", photoName: "" };

  function resetReportState() {
    reportState = { step: 1, unit: "", category: "", description: "", studentNumber: "", photoName: "" };
  }

  function viewReport() {
    if (reportState.step === "done") return viewReportConfirm();
    const totalSteps = 5;
    const step = reportState.step;
    return `
    <section class="section">
      <div class="wrap form-shell">
        <h1 style="font-size:1.7rem;margin-bottom:20px;">Report an Issue</h1>
        <div class="stepper-head" aria-hidden="true">
          ${Array.from({ length: totalSteps }).map((_, i) => `<div class="stepper-dot ${i + 1 < step ? "done" : ""} ${i + 1 === step ? "current" : ""}"></div>`).join("")}
        </div>
        <form id="reportForm" novalidate>
          ${reportStepMarkup(step)}
        </form>
      </div>
    </section>`;
  }

  function reportStepMarkup(step) {
    if (step === 1) {
      return `
        <div class="form-step">
          <h2>Where is the issue?</h2>
          <p class="hint">Tell us your unit or room number.</p>
          <div class="field" id="field-unit">
            <label for="unit">Unit / Room number <span class="req">*</span></label>
            <input type="text" id="unit" placeholder="e.g. B12" value="${UTIL.escapeHtml(reportState.unit)}" autocomplete="off">
            <small class="error">Please enter your unit or room number.</small>
          </div>
          <div class="form-actions"><span></span><button type="button" class="btn btn--gold" data-next="1">Continue</button></div>
        </div>`;
    }
    if (step === 2) {
      return `
        <div class="form-step">
          <h2>What's the issue?</h2>
          <p class="hint">Choose the category that best matches the problem.</p>
          <div class="field" id="field-category">
            <div class="chip-grid">
              ${ISSUE_CATEGORIES.map((c) => `
                <label class="chip ${reportState.category === c.id ? "selected" : ""}" data-chip="${c.id}">
                  <input type="radio" name="category" value="${c.id}" ${reportState.category === c.id ? "checked" : ""}>
                  <i data-lucide="${c.icon}"></i>${c.label}
                </label>`).join("")}
            </div>
            <small class="error">Please choose an issue category.</small>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn--ghost" data-back="1">Back</button>
            <button type="button" class="btn btn--gold" data-next="2">Continue</button>
          </div>
        </div>`;
    }
    if (step === 3) {
      return `
        <div class="form-step">
          <h2>Describe the problem</h2>
          <p class="hint">A few sentences helps maintenance fix it faster. You can also attach a photo.</p>
          <div class="field" id="field-description">
            <label for="description">Description <span class="req">*</span></label>
            <textarea id="description" placeholder="Describe the problem...">${UTIL.escapeHtml(reportState.description)}</textarea>
            <small class="error">Please describe the problem.</small>
          </div>
          <div class="field">
            <label for="photo">Photo (optional)</label>
            <input type="file" id="photo" accept="image/*">
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn--ghost" data-back="2">Back</button>
            <button type="button" class="btn btn--gold" data-next="3">Continue</button>
          </div>
        </div>`;
    }
    if (step === 4) {
      return `
        <div class="form-step">
          <h2>Your details</h2>
          <p class="hint">So we can follow up with you about this report.</p>
          <div class="field" id="field-student">
            <label for="studentNumber">Student number <span class="req">*</span></label>
            <input type="text" id="studentNumber" placeholder="e.g. 44920490" value="${UTIL.escapeHtml(reportState.studentNumber)}" autocomplete="off" inputmode="numeric">
            <small class="error">Please enter your student number.</small>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn--ghost" data-back="3">Back</button>
            <button type="button" class="btn btn--gold" data-next="4">Review</button>
          </div>
        </div>`;
    }
    // step 5 — review
    const cat = ISSUE_CATEGORIES.find((c) => c.id === reportState.category);
    return `
      <div class="form-step">
        <h2>Review your report</h2>
        <p class="hint">Check the details below before submitting.</p>
        <div class="card" style="padding:6px 18px;">
          <dl class="review-list">
            <div class="review-row"><dt>Unit / Room</dt><dd>${UTIL.escapeHtml(reportState.unit)}</dd></div>
            <div class="review-row"><dt>Issue type</dt><dd>${UTIL.escapeHtml(cat ? cat.label : "")}</dd></div>
            <div class="review-row"><dt>Description</dt><dd>${UTIL.escapeHtml(reportState.description)}</dd></div>
            <div class="review-row"><dt>Photo</dt><dd>${reportState.photoName ? UTIL.escapeHtml(reportState.photoName) : "None attached"}</dd></div>
            <div class="review-row"><dt>Student number</dt><dd>${UTIL.escapeHtml(reportState.studentNumber)}</dd></div>
          </dl>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn--ghost" data-back="4">Back</button>
          <button type="button" class="btn btn--gold" id="submitReportBtn">Submit Report</button>
        </div>
      </div>`;
  }

  function viewReportConfirm() {
    const ref = reportState.lastRef;
    return `
    <section class="section">
      <div class="wrap form-shell">
        <div class="card confirm-panel">
          <i class="big" data-lucide="check-circle-2"></i>
          <h2>Issue submitted successfully.</h2>
          <p style="color:var(--ink-soft);">Your reference number:</p>
          <div class="confirm-ref">${ref}</div>
          <span class="status status--submitted">Submitted</span>
          <div class="form-actions" style="justify-content:center;margin-top:26px;">
            <a class="btn btn--outline" href="#/my-reports" data-route="/my-reports">View My Reports</a>
            <a class="btn btn--gold" href="#/home" data-route="/home">Back to Home</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ---------------------------------------------------------
     VIEW: MY REPORTS
     --------------------------------------------------------- */
  function viewMyReports() {
    const issues = STORE.getIssues();
    return `
    <section class="section">
      <div class="wrap" style="max-width:720px;">
        <div class="section__head">
          <div><h1 style="font-size:1.7rem;">My Reports</h1><p style="color:var(--ink-soft);">Prototype view — shows all sample reports stored on this device.</p></div>
          <a class="btn btn--gold btn--sm" href="#/report" data-route="/report"><i data-lucide="plus"></i>New report</a>
        </div>
        ${issues.length === 0 ? emptyState("clipboard-list", "No reports yet", "Submit your first issue and it will show up here.") : `
        <div class="card">
          ${issues.map((i) => {
            const cat = ISSUE_CATEGORIES.find((c) => c.id === i.category);
            const st = UTIL.statusMeta(i.status);
            return `
            <div class="list-row">
              <div class="list-row__icon"><i data-lucide="${cat ? cat.icon : "circle"}"></i></div>
              <div class="list-row__body">
                <strong>${UTIL.escapeHtml(cat ? cat.label : "Issue")} · Unit ${UTIL.escapeHtml(i.unit)}</strong>
                <span>${i.ref} · Submitted ${UTIL.formatDate(i.date)}</span>
              </div>
              <span class="status ${st.cls}">${st.label}</span>
            </div>`;
          }).join("")}
        </div>`}
      </div>
    </section>`;
  }

  function emptyState(icon, title, body) {
    return `<div class="empty-state"><i data-lucide="${icon}"></i><h3>${UTIL.escapeHtml(title)}</h3><p>${UTIL.escapeHtml(body)}</p></div>`;
  }

  /* ---------------------------------------------------------
     VIEW: BUS SCHEDULE
     --------------------------------------------------------- */
  let busActiveDay = "weekdays";
  let busActiveDirection = "toCampus";

  function getScheduleForNow() {
    const day = new Date().getDay(); // 0 sun .. 6 sat
    if (day === 0) return "sunday";
    if (day === 6) return "saturday";
    return "weekdays";
  }

  function computeNextBus() {
    const todayKey = getScheduleForNow();
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const dayLabelMap = { weekdays: "today (weekday)", saturday: "today (Saturday)", sunday: "today (Sunday)" };

    function toMinutes(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

    const directions = ["toCampus", "fromCampus"];
    let best = null;
    directions.forEach((dir) => {
      const times = BUS_SCHEDULE[todayKey][dir];
      const upcoming = times.find((t) => toMinutes(t) > nowMinutes);
      if (upcoming) {
        const diff = toMinutes(upcoming) - nowMinutes;
        if (!best || diff < best.diff) best = { dir, time: upcoming, diff, dayLabel: dayLabelMap[todayKey] };
      }
    });
    return best;
  }

  function viewBus() {
    const next = computeNextBus();
    return `
    <section class="section">
      <div class="wrap">
        <div class="section-title-wrap section-title-wrap--left">
          <h1 style="font-size:1.9rem;">Bus Schedule</h1>
          <p style="color:var(--ink-soft);margin-top:6px;">Digital timetable so you never have to squint at a screenshot again.</p>
        </div>

        <div class="demo-notice demo-notice--verified">
          <i data-lucide="badge-check"></i>
          <div>
            <strong>Official Bohlale Village timetable.</strong>
            <p>Reproduced exactly from the residence's Monday–Friday, Saturday and Sunday bus schedule, both directions.</p>
          </div>
        </div>

        <div class="next-bus">
          <div>
            <div class="next-bus__label">Next bus</div>
            ${next ? `
              <div class="next-bus__route">${next.dir === "toCampus" ? "To Campus" : "From Campus"}</div>
              <div class="next-bus__eta">Leaving ${next.dayLabel}</div>` : `<div class="next-bus__none">No more buses scheduled today.</div>`}
          </div>
          ${next ? `<div style="text-align:right;"><div class="next-bus__time">${next.time}</div><div class="next-bus__eta">in ${next.diff} min</div></div>` : ""}
        </div>

        <div class="bus-tabs" role="tablist" aria-label="Day">
          <button class="pill-tab ${busActiveDay === "weekdays" ? "active" : ""}" data-day="weekdays">Weekdays</button>
          <button class="pill-tab ${busActiveDay === "saturday" ? "active" : ""}" data-day="saturday">Saturday</button>
          <button class="pill-tab ${busActiveDay === "sunday" ? "active" : ""}" data-day="sunday">Sunday</button>
        </div>
        <div class="bus-direction-toggle" role="tablist" aria-label="Direction">
          <button class="pill-tab ${busActiveDirection === "toCampus" ? "active" : ""}" data-dir="toCampus">To Campus</button>
          <button class="pill-tab ${busActiveDirection === "fromCampus" ? "active" : ""}" data-dir="fromCampus">From Campus</button>
        </div>

        <div id="busTableWrap">${busTableMarkup()}</div>
      </div>
    </section>`;
  }

  function busTableMarkup() {
    const times = BUS_SCHEDULE[busActiveDay][busActiveDirection];
    const next = computeNextBus();
    const highlightTime = next && getScheduleForNow() === busActiveDay && next.dir === busActiveDirection ? next.time : null;
    if (!times || times.length === 0) {
      return emptyState("bus", "No services", "There are no scheduled buses for this selection.");
    }
    return `
      <table class="bus-table">
        <thead><tr><th>Departure</th><th>Direction</th></tr></thead>
        <tbody>
          ${times.map((t) => `<tr class="${t === highlightTime ? "bus-highlight" : ""}"><td>${t}</td><td>${busActiveDirection === "toCampus" ? "To Campus" : "From Campus"}</td></tr>`).join("")}
        </tbody>
      </table>
      <div class="bus-cards">
        ${times.map((t) => `<div class="card bus-card-row ${t === highlightTime ? "bus-highlight" : ""}"><strong>${t}</strong><span>${busActiveDirection === "toCampus" ? "To Campus" : "From Campus"}</span></div>`).join("")}
      </div>`;
  }

  /* ---------------------------------------------------------
     VIEW: PETITIONS
     --------------------------------------------------------- */
  let petitionFilter = "All";

  function viewPetitions() {
    const petitions = STORE.getPetitions();
    const filtered = petitionFilter === "All" ? petitions : petitions.filter((p) => p.category === petitionFilter);
    return `
    <section class="section">
      <div class="wrap">
        <div class="section__head">
          <div><h1 style="font-size:1.9rem;">Petitions</h1><p style="color:var(--ink-soft);">Raise your voice on things that matter to residence life.</p></div>
          <button class="btn btn--gold btn--sm" id="newPetitionBtn"><i data-lucide="plus"></i>New petition</button>
        </div>

        <div class="filter-row">
          ${["All", ...PETITION_CATEGORIES].map((c) => `<button class="pill-tab ${petitionFilter === c ? "active" : ""}" data-filter="${UTIL.escapeHtml(c)}">${UTIL.escapeHtml(c)}</button>`).join("")}
        </div>

        <div id="petitionGrid" class="petition-grid">
          ${filtered.length ? filtered.map(petitionCard).join("") : `<div style="grid-column:1/-1;">${emptyState("scroll-text", "No active petitions", "Nothing matches this filter yet. Be the first to start one.")}</div>`}
        </div>
      </div>
    </section>`;
  }

  function petitionCard(p) {
    const pct = Math.min(100, Math.round((p.supporters / 150) * 100));
    return `
    <article class="card petition-card">
      <div class="petition-card__top">
        <span class="badge ${p.demo ? "badge--demo" : ""}">${UTIL.escapeHtml(p.category)}</span>
        <span style="font-size:.78rem;color:var(--ink-soft);">${UTIL.formatDate(p.date)}</span>
      </div>
      <h3>${UTIL.escapeHtml(p.title)}</h3>
      <p class="desc">${UTIL.escapeHtml(p.description)}</p>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%;"></div></div>
      <div class="petition-card__meta">
        <span class="supporters">${p.supporters}</span> verified Bohlale students
      </div>
      <button class="btn btn--gold btn--block sign-btn" data-petition="${p.id}"><i data-lucide="pen-line"></i>Sign Petition</button>
    </article>`;
  }

  /* ---------------------------------------------------------
     VIEW: ANNOUNCEMENTS
     --------------------------------------------------------- */
  function viewAnnouncements() {
    return `
    <section class="section">
      <div class="wrap">
        <div class="section-title-wrap section-title-wrap--left">
          <h1 style="font-size:1.9rem;">Announcements &amp; Current Affairs</h1>
          <p style="color:var(--ink-soft);margin-top:6px;">Residence news, events and updates.</p>
        </div>
        <div class="leader-grid" style="grid-template-columns:1fr;">
          <div class="petition-grid">${ANNOUNCEMENTS.map(announcementCard).join("")}</div>
        </div>
      </div>
    </section>`;
  }

  /* ---------------------------------------------------------
     VIEW: COMMUNITY
     --------------------------------------------------------- */
  function viewCommunity() {
    return `
    <section class="section">
      <div class="wrap" style="max-width:640px;">
        ${tiktokPanel()}
      </div>
    </section>`;
  }

  /* ---------------------------------------------------------
     VIEW: CONTACTS
     --------------------------------------------------------- */
  function viewContacts() {
    return `
    <section class="section">
      <div class="wrap">
        <div class="section-title-wrap section-title-wrap--left">
          <h1 style="font-size:1.9rem;">Important Contacts</h1>
          <p style="color:var(--ink-soft);margin-top:6px;">Residence leadership contact details, from the official house committee list.</p>
        </div>
        <h3 style="margin-bottom:14px;">Residence leadership</h3>
        <div class="contact-grid">${LEADERSHIP.map(contactCard).join("")}</div>
        <div class="card" style="padding:20px;margin-top:24px;">
          <strong>Emergency &amp; campus security</strong>
          <p style="color:var(--ink-soft);font-size:.9rem;margin-top:6px;">Emergency and Protection Services numbers weren't supplied for this prototype — check your official NWU student handbook or campus signage for the current numbers rather than a number listed here.</p>
        </div>
      </div>
    </section>`;
  }

  /* ---------------------------------------------------------
     VIEW: MORE (mobile)
     --------------------------------------------------------- */
  function viewMore() {
    const items = [
      ["residence", "building-2", "Residence"],
      ["committees", "layout-grid", "Committees"],
      ["emerging", "sprout", "Emerging Leaders"],
      ["my-reports", "clipboard-list", "My Reports"],
      ["petitions", "scroll-text", "Petitions"],
      ["announcements", "bell", "Announcements"],
      ["community", "video", "Community / TikTok"],
      ["contacts", "phone", "Contacts"],
    ];
    return `
    <section class="section">
      <div class="wrap" style="max-width:520px;">
        <h1 style="font-size:1.6rem;margin-bottom:18px;">More</h1>
        <div class="card">
          ${items.map(([route, icon, label]) => `
            <a class="list-row" href="#/${route}" data-route="/${route}">
              <div class="list-row__icon"><i data-lucide="${icon}"></i></div>
              <div class="list-row__body"><strong>${label}</strong></div>
              <i data-lucide="chevron-right" style="width:18px;height:18px;color:var(--ink-soft);"></i>
            </a>`).join("")}
        </div>
      </div>
    </section>`;
  }

  function notFound(msg) {
    return `<section class="section"><div class="wrap">${emptyState("compass", msg || "Page not found", "Use the menu to find what you're looking for.")}</div></section>`;
  }

  /* ---------------------------------------------------------
     ROUTER
     --------------------------------------------------------- */
  const routes = {
    "/home": viewHome,
    "/residence": viewResidence,
    "/leadership": viewLeadershipList,
    "/committees": viewCommittees,
    "/emerging": viewEmerging,
    "/report": viewReport,
    "/my-reports": viewMyReports,
    "/bus": viewBus,
    "/petitions": viewPetitions,
    "/announcements": viewAnnouncements,
    "/community": viewCommunity,
    "/contacts": viewContacts,
    "/more": viewMore,
  };

  function render() {
    // Close any stray modals left open from before a navigation.
    UTIL.qsa(".modal-scrim").forEach((m) => m.remove());

    let hash = location.hash.replace(/^#/, "") || "/home";
    let html;

    if (hash.startsWith("/leadership/")) {
      const id = hash.split("/leadership/")[1];
      html = viewLeaderProfile(id);
    } else if (routes[hash]) {
      if (hash !== "/report") resetReportState();
      html = routes[hash]();
    } else {
      html = notFound();
    }

    main.innerHTML = `<div class="view">${html}</div>`;
    renderIcons(main);
    loadTikTokEmbeds();
    updateActiveNav(hash);
    closeDrawer();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    main.focus({ preventScroll: true });
  }

  function updateActiveNav(hash) {
    const base = "/" + hash.split("/")[1];
    UTIL.qsa("[data-route]").forEach((a) => {
      const r = a.getAttribute("data-route");
      a.classList.toggle("active", r === hash || r === base);
    });
  }

  window.addEventListener("hashchange", render);

  /* ---------------------------------------------------------
     DRAWER + SEARCH + GLOBAL NAV EVENTS
     --------------------------------------------------------- */
  const drawer = document.getElementById("mobileDrawer");
  const scrim = document.getElementById("drawerScrim");

  function openDrawer() {
    drawer.classList.add("open");
    drawer.removeAttribute("aria-hidden");
    scrim.hidden = false;
    document.getElementById("hamburgerBtn").setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    document.getElementById("hamburgerBtn").setAttribute("aria-expanded", "false");
  }
  document.getElementById("hamburgerBtn").addEventListener("click", openDrawer);
  document.getElementById("closeDrawerBtn").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);

  const searchOverlay = document.getElementById("searchOverlay");
  const searchInput = document.getElementById("searchInput");
  function openSearch() {
    searchOverlay.hidden = false;
    searchInput.value = "";
    document.getElementById("searchResults").innerHTML = "";
    setTimeout(() => searchInput.focus(), 30);
  }
  function closeSearch() { searchOverlay.hidden = true; }
  document.getElementById("searchBtn").addEventListener("click", openSearch);
  document.getElementById("closeSearchBtn").addEventListener("click", closeSearch);
  searchOverlay.addEventListener("click", (e) => { if (e.target === searchOverlay) closeSearch(); });

  function buildSearchIndex() {
    const idx = [];
    LEADERSHIP.forEach((l) => idx.push({ type: "Leadership", title: l.name, sub: l.position, route: "/leadership/" + l.id }));
    ANNOUNCEMENTS.forEach((a) => idx.push({ type: "Announcement", title: a.title, sub: a.category, route: "/announcements" }));
    STORE.getPetitions().forEach((p) => idx.push({ type: "Petition", title: p.title, sub: p.category, route: "/petitions" }));
    ISSUE_CATEGORIES.forEach((c) => idx.push({ type: "Report an issue", title: c.label, sub: "Report a " + c.label.toLowerCase() + " problem", route: "/report" }));
    idx.push({ type: "Bus", title: "Bus Schedule", sub: "Weekday, Saturday, Sunday times", route: "/bus" });
    idx.push({ type: "Contacts", title: "Important Contacts", sub: "Call or WhatsApp leadership", route: "/contacts" });
    COMMITTEES.forEach((c) => idx.push({ type: "Committee", title: c.name, sub: c.blurb, route: "/committees" }));
    return idx;
  }

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    const results = document.getElementById("searchResults");
    if (!q) { results.innerHTML = ""; return; }
    const hits = buildSearchIndex().filter((i) => (i.title + " " + i.sub).toLowerCase().includes(q)).slice(0, 8);
    results.innerHTML = hits.length ? hits.map((h) => `
      <a class="search-hit" href="#${h.route}" data-route="${h.route}">
        <small>${UTIL.escapeHtml(h.type)}</small>
        <strong>${UTIL.escapeHtml(h.title)}</strong>
        <div style="font-size:.85rem;color:var(--ink-soft);">${UTIL.escapeHtml(h.sub)}</div>
      </a>`).join("") : `<p class="search-empty">No matches for "${UTIL.escapeHtml(searchInput.value)}"</p>`;
  });

  // Global click delegation: nav links close drawer/search
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-route]");
    if (link) { closeDrawer(); closeSearch(); }
  });

  /* ---------------------------------------------------------
     DELEGATED EVENTS FOR DYNAMIC VIEWS (report form, bus tabs,
     petition filters/signing)
     --------------------------------------------------------- */
  main.addEventListener("click", (e) => {
    // Report form: chip select
    const chip = e.target.closest(".chip[data-chip]");
    if (chip) {
      reportState.category = chip.getAttribute("data-chip");
      UTIL.qsa(".chip", chip.parentElement).forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      return;
    }
    // Report form: next
    const nextBtn = e.target.closest("[data-next]");
    if (nextBtn) { handleReportNext(); return; }
    const backBtn = e.target.closest("[data-back]");
    if (backBtn) { reportState.step = Number(backBtn.getAttribute("data-back")); render(); return; }
    const submitBtn = e.target.closest("#submitReportBtn");
    if (submitBtn) { handleReportSubmit(); return; }

    // Bus tabs
    const dayBtn = e.target.closest("[data-day]");
    if (dayBtn) { busActiveDay = dayBtn.getAttribute("data-day"); refreshBusView(); return; }
    const dirBtn = e.target.closest("[data-dir]");
    if (dirBtn) { busActiveDirection = dirBtn.getAttribute("data-dir"); refreshBusView(); return; }

    // Petition filter
    const filterBtn = e.target.closest("[data-filter]");
    if (filterBtn) { petitionFilter = filterBtn.getAttribute("data-filter"); render(); return; }

    // New petition
    if (e.target.closest("#newPetitionBtn")) { openPetitionModal(); return; }

    // Sign petition
    const signBtn = e.target.closest(".sign-btn");
    if (signBtn) { openSignModal(signBtn.getAttribute("data-petition")); return; }
  });

  main.addEventListener("change", (e) => {
    if (e.target.id === "photo" && e.target.files[0]) {
      reportState.photoName = e.target.files[0].name;
    }
  });

  function refreshBusView() {
    document.getElementById("busTableWrap").innerHTML = busTableMarkup();
    UTIL.qsa(".pill-tab[data-day]").forEach((b) => b.classList.toggle("active", b.getAttribute("data-day") === busActiveDay));
    UTIL.qsa(".pill-tab[data-dir]").forEach((b) => b.classList.toggle("active", b.getAttribute("data-dir") === busActiveDirection));
    renderIcons(main);
  }

  /* ---------------------------------------------------------
     REPORT FORM LOGIC
     --------------------------------------------------------- */
  function clearFieldError(fieldEl) { if (fieldEl) fieldEl.classList.remove("invalid"); }
  function setFieldError(fieldEl) { if (fieldEl) fieldEl.classList.add("invalid"); }

  function handleReportNext() {
    const step = reportState.step;
    if (step === 1) {
      const input = document.getElementById("unit");
      const field = document.getElementById("field-unit");
      if (!input.value.trim()) { setFieldError(field); return; }
      clearFieldError(field);
      reportState.unit = input.value.trim();
      reportState.step = 2;
    } else if (step === 2) {
      const field = document.getElementById("field-category");
      if (!reportState.category) { setFieldError(field); return; }
      clearFieldError(field);
      reportState.step = 3;
    } else if (step === 3) {
      const textarea = document.getElementById("description");
      const field = document.getElementById("field-description");
      if (!textarea.value.trim()) { setFieldError(field); return; }
      clearFieldError(field);
      reportState.description = textarea.value.trim();
      reportState.step = 4;
    } else if (step === 4) {
      const input = document.getElementById("studentNumber");
      const field = document.getElementById("field-student");
      if (!input.value.trim()) { setFieldError(field); return; }
      clearFieldError(field);
      reportState.studentNumber = input.value.trim();
      reportState.step = 5;
    }
    render();
  }

  function handleReportSubmit() {
    const ref = UTIL.genReference();
    STORE.addIssue({
      ref,
      unit: reportState.unit,
      category: reportState.category,
      description: reportState.description,
      status: "submitted",
      date: new Date().toISOString().slice(0, 10),
    });
    reportState.step = "done";
    reportState.lastRef = ref;
    render();
    toast("Report submitted successfully.", "check-circle-2");
  }

  /* ---------------------------------------------------------
     PETITION MODALS
     --------------------------------------------------------- */
  function openPetitionModal() {
    openModal(`
      <h3>Create a petition</h3>
      <p>Your student number is stored only to prevent duplicate petitions — it's never shown publicly.</p>
      <form id="petitionForm">
        <div class="field" id="pf-title"><label>Petition title <span class="req">*</span></label><input type="text" id="pTitle" placeholder="e.g. Extend study room hours"><small class="error">Title is required.</small></div>
        <div class="field" id="pf-category"><label>Category <span class="req">*</span></label>
          <select id="pCategory" style="width:100%;padding:13px 14px;border-radius:8px;border:1.5px solid var(--paper-line);font-family:inherit;font-size:1rem;">
            ${PETITION_CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("")}
          </select>
        </div>
        <div class="field" id="pf-desc"><label>Description <span class="req">*</span></label><textarea id="pDesc" placeholder="Explain your concern..."></textarea><small class="error">Description is required.</small></div>
        <div class="field" id="pf-reason"><label>Reason it matters <span class="req">*</span></label><textarea id="pReason" placeholder="Why does this matter?"></textarea><small class="error">Reason is required.</small></div>
        <div class="field" id="pf-student"><label>Your student number <span class="req">*</span></label><input type="text" id="pStudent" inputmode="numeric" placeholder="e.g. 44920490"><small class="error">Student number is required.</small></div>
        <div class="form-actions"><button type="button" class="btn btn--ghost" id="cancelPetition">Cancel</button><button type="button" class="btn btn--gold" id="createPetitionBtn">Create Petition</button></div>
      </form>
    `, (scrim) => {
      scrim.querySelector("#cancelPetition").addEventListener("click", () => closeModal(scrim));
      scrim.querySelector("#createPetitionBtn").addEventListener("click", () => {
        const title = scrim.querySelector("#pTitle").value.trim();
        const desc = scrim.querySelector("#pDesc").value.trim();
        const reason = scrim.querySelector("#pReason").value.trim();
        const student = scrim.querySelector("#pStudent").value.trim();
        let valid = true;
        toggleInvalid(scrim.querySelector("#pf-title"), !title); if (!title) valid = false;
        toggleInvalid(scrim.querySelector("#pf-desc"), !desc); if (!desc) valid = false;
        toggleInvalid(scrim.querySelector("#pf-reason"), !reason); if (!reason) valid = false;
        toggleInvalid(scrim.querySelector("#pf-student"), !student); if (!student) valid = false;
        if (!valid) return;
        const category = scrim.querySelector("#pCategory").value;
        STORE.addPetition({
          id: "p" + Date.now(),
          title, category, reason, description: desc,
          creatorMasked: UTIL.maskStudentNumber(student),
          supporters: 0,
          date: new Date().toISOString().slice(0, 10),
          demo: false,
          status: "Open",
        });
        closeModal(scrim);
        toast("Petition created.", "scroll-text");
        render();
      });
    });
  }

  function toggleInvalid(fieldEl, isInvalid) { fieldEl.classList.toggle("invalid", isInvalid); }

  function openSignModal(petitionId) {
    const petitions = STORE.getPetitions();
    const petition = petitions.find((p) => p.id === petitionId);
    if (!petition) return;
    openModal(`
      <h3>Sign this petition</h3>
      <p>"${UTIL.escapeHtml(petition.title)}" — your student number confirms one signature per student and is never shown publicly.</p>
      <div class="field" id="sf-student"><label>Student number <span class="req">*</span></label><input type="text" id="sStudent" inputmode="numeric" placeholder="e.g. 44920490"><small class="error">Student number is required.</small></div>
      <div class="form-actions"><button type="button" class="btn btn--ghost" id="cancelSign">Cancel</button><button type="button" class="btn btn--gold" id="confirmSignBtn">Sign Petition</button></div>
    `, (scrim) => {
      scrim.querySelector("#cancelSign").addEventListener("click", () => closeModal(scrim));
      scrim.querySelector("#confirmSignBtn").addEventListener("click", () => {
        const student = scrim.querySelector("#sStudent").value.trim();
        const field = scrim.querySelector("#sf-student");
        if (!student) { toggleInvalid(field, true); return; }
        if (STORE.hasSigned(petitionId, student)) {
          toggleInvalid(field, true);
          field.querySelector(".error").textContent = "This student number has already signed.";
          return;
        }
        STORE.recordSignature(petitionId, student);
        STORE.updatePetition(petitionId, (p) => { p.supporters += 1; return p; });
        closeModal(scrim);
        toast("You have signed this petition.", "pen-line");
        render();
      });
    });
  }

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  render();
})();
