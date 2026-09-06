/**
 * "₦200 to win ₦200M" - Core Application Logic
 * Mobile-First Sportsbook Feed, Resilient Clipboard Engine & Fast Admin Publisher
 */

// Initial Seed Betting Slips (Stored in localStorage for persistence)
const DEFAULT_SLIPS = [
  {
    id: "slip-stake-100",
    title: "Stake 100 Sharp Odds (Today's Games Only)",
    category: "MEGA_ACCUMULATOR",
    bookmaker: "STAKE.COM",
    bookingCode: "sport:649599092",
    totalOdds: 100.00,
    stake: 200,
    matchCount: 8,
    kickoffTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(), // Today's match
    status: "PENDING",
    isPinned: true,
    isCutOne: false,
    copiesCount: 1840,
    affiliateUrl: "https://stake.com/sports/home?iid=sport%3A649599092&source=link_shared&modal=bet",
    signupUrl: "https://stake.com/?c=Jareddad&offer=jareddad",
    promoCode: "JAREDDAD"
  },
  {
    id: "slip-001",
    title: "Weekend 22-Fold Mega Accumulator (₦200 to ₦200M)",
    category: "MEGA_ACCUMULATOR",
    bookmaker: "SPORTYBET",
    bookingCode: "BC892X",
    totalOdds: 642.50,
    stake: 200,
    matchCount: 22,
    kickoffTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hrs from now
    status: "PENDING",
    isPinned: false,
    isCutOne: true,
    copiesCount: 842,
    affiliateUrl: "https://www.sportybet.com/ng/?ref=200to200m&code=BC892X"
  },
  {
    id: "slip-002",
    title: "Sunday Safe 3-Fold Banker (2.45 Odds)",
    category: "BANKER",
    bookmaker: "BET9JA",
    bookingCode: "B9-5511A",
    totalOdds: 2.45,
    stake: 200,
    matchCount: 3,
    kickoffTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: "PENDING",
    isPinned: false,
    isCutOne: false,
    copiesCount: 1420,
    affiliateUrl: "https://sports.bet9ja.com/?ref=200to200m&code=B9-5511A"
  },
  {
    id: "slip-003",
    title: "Goal Rush: Over 2.5 Goals Weekend Combo",
    category: "OVER_UNDER",
    bookmaker: "1XBET",
    bookingCode: "1X-GOAL99",
    totalOdds: 14.80,
    stake: 200,
    matchCount: 6,
    kickoffTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: "PENDING",
    isPinned: false,
    isCutOne: true,
    copiesCount: 512,
    affiliateUrl: "https://1xbet.ng/?ref=200to200m&code=1X-GOAL99"
  },
  {
    id: "slip-004",
    title: "Friday Night 2-Fold Rollover (LANDED 🏆)",
    category: "ROLLOVER",
    bookmaker: "SPORTYBET",
    bookingCode: "SB-ROLL9",
    totalOdds: 2.85,
    stake: 200,
    matchCount: 2,
    kickoffTime: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // Finished
    status: "WON",
    isPinned: false,
    isCutOne: false,
    copiesCount: 2190,
    affiliateUrl: "https://www.sportybet.com/ng/?ref=200to200m"
  },
  {
    id: "slip-005",
    title: "Midweek 16-Game Beast (LANDED 🏆)",
    category: "MEGA_ACCUMULATOR",
    bookmaker: "BETKING",
    bookingCode: "BK-WIN48",
    totalOdds: 48.20,
    stake: 200,
    matchCount: 16,
    kickoffTime: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // Finished
    status: "WON",
    isPinned: false,
    isCutOne: true,
    copiesCount: 3410,
    affiliateUrl: "https://www.betking.com/?ref=200to200m"
  }
];

class BettingHubApp {
  constructor() {
    this.slips = this.loadSlips();
    this.activeCategory = "ALL";
    this.timerInterval = null;
    this.initElements();
    this.attachEventListeners();
    this.updateStats();
    this.renderFeed();
    this.startCountdownEngine();
  }

  // Load slips from localStorage or use defaults
  loadSlips() {
    try {
      const stored = localStorage.getItem("hub_slips_data_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Guarantee Stake slip is always present at the top
        if (!parsed.some(s => s.bookingCode === "sport:649599092" || s.id === "slip-stake-100")) {
          parsed.unshift(DEFAULT_SLIPS[0]);
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not read localStorage:", e);
    }
    return [...DEFAULT_SLIPS];
  }

  saveSlips() {
    try {
      localStorage.setItem("hub_slips_data_v2", JSON.stringify(this.slips));
    } catch (e) {
      console.error("Could not write to localStorage:", e);
    }
  }

  initElements() {
    this.slipsFeed = document.getElementById("slipsFeed");
    this.activeCountBadge = document.getElementById("activeCountBadge");
    this.feedTitleHeading = document.getElementById("feedTitleHeading");
    
    // Stats elements
    this.statWinRate = document.getElementById("statWinRate");
    this.statSlipsWon = document.getElementById("statSlipsWon");
    this.statOddsHit = document.getElementById("statOddsHit");

    // Modals
    this.adminModal = document.getElementById("adminModal");
    this.adminToggleBtn = document.getElementById("adminToggleBtn");
    this.closeAdminModal = document.getElementById("closeAdminModal");
    this.cancelSlipBtn = document.getElementById("cancelSlipBtn");
    this.slipForm = document.getElementById("slipForm");
    this.adminSlipsList = document.getElementById("adminSlipsList");

    // Copy Fallback & Info Modals
    this.copyFallbackModal = document.getElementById("copyFallbackModal");
    this.closeCopyModal = document.getElementById("closeCopyModal");
    this.manualCopyBox = document.getElementById("manualCopyBox");
    this.manualCopyBtn = document.getElementById("manualCopyBtn");

    this.infoModal = document.getElementById("infoModal");
    this.closeInfoModal = document.getElementById("closeInfoModal");
    this.infoModalTitle = document.getElementById("infoModalTitle");
    this.infoModalBody = document.getElementById("infoModalBody");
    this.showRulesBtn = document.getElementById("showRulesBtn");
    this.showDisclaimerBtn = document.getElementById("showDisclaimerBtn");

    // Live calc in form
    this.totalOddsInput = document.getElementById("totalOdds");
    this.estReturnPreview = document.getElementById("estReturnPreview");

    // Toast
    this.toastNotification = document.getElementById("toastNotification");
    this.toastMessage = document.getElementById("toastMessage");

    // Refresh
    this.refreshFeedBtn = document.getElementById("refreshFeedBtn");
  }

  attachEventListeners() {
    // Category chips
    document.querySelectorAll(".filter-chip").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        this.activeCategory = btn.dataset.category;
        this.renderFeed();
      });
    });

    // Bottom Navigation
    document.querySelectorAll(".bottom-nav .nav-item[data-nav]").forEach(item => {
      item.addEventListener("click", () => {
        document.querySelectorAll(".bottom-nav .nav-item").forEach(n => n.classList.remove("active"));
        item.classList.add("active");
        const nav = item.dataset.nav;
        if (nav === "feed") {
          this.setCategoryFilter("ALL");
        } else if (nav === "bankers") {
          this.setCategoryFilter("BANKER");
        } else if (nav === "tracker") {
          this.setCategoryFilter("WON_ARCHIVE");
        }
      });
    });

    // Admin Modal Toggles
    this.adminToggleBtn.addEventListener("click", () => this.openAdmin());
    this.closeAdminModal.addEventListener("click", () => this.closeAdmin());
    this.cancelSlipBtn.addEventListener("click", () => this.closeAdmin());

    // Live odds return calculation preview in admin form
    this.totalOddsInput.addEventListener("input", () => {
      const odds = parseFloat(this.totalOddsInput.value) || 0;
      const potential = 200 * odds;
      this.estReturnPreview.textContent = `₦${potential.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    });

    // Admin slip submit
    this.slipForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handlePublishSlip();
    });

    // Close copy fallback modal
    this.closeCopyModal.addEventListener("click", () => {
      this.copyFallbackModal.classList.remove("show");
    });

    this.manualCopyBtn.addEventListener("click", () => {
      const range = document.createRange();
      range.selectNodeContents(this.manualCopyBox);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      this.showToast("Text selected! Press copy.");
    });

    // Rules & Disclaimer Modals
    this.showRulesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.infoModalTitle.textContent = "₦200 to ₦200M Staking Rules";
      this.infoModalBody.innerHTML = `
        <p><b>Rule 1: Fixed Micro-Staking</b> - Always stake exactly ₦200 per slip. Never increase your stake to chase losses.</p>
        <br>
        <p><b>Rule 2: The Two-Slip Strategy</b> - Split your bets between 1 High-Risk Mega Slip (₦200 for life changing return) and 1 High-Confidence Banker (to sustain your bankroll).</p>
        <br>
        <p><b>Rule 3: Use Cut-1 When Available</b> - When playing 15+ game accumulators on SportyBet or Bet9ja, always ensure Cut-1 or Cut-2 is enabled.</p>
      `;
      this.infoModal.classList.add("show");
      lucide.createIcons();
    });

    this.showDisclaimerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.infoModalTitle.textContent = "Disclaimer & Terms";
      this.infoModalBody.innerHTML = `
        <p>This platform provides sports statistical analysis, predictions, and booking codes for informational and entertainment purposes only.</p>
        <br>
        <p>We are not a bookmaker and do not accept direct bets. You must be 18+ and adhere to the gaming laws of your jurisdiction. Gamble responsibly.</p>
      `;
      this.infoModal.classList.add("show");
      lucide.createIcons();
    });

    this.closeInfoModal.addEventListener("click", () => {
      this.infoModal.classList.remove("show");
    });

    // Refresh Feed button
    this.refreshFeedBtn.addEventListener("click", () => {
      this.renderFeed();
      this.showToast("Feed updated with latest odds!");
    });

    // Close modal when clicking backdrop
    [this.adminModal, this.copyFallbackModal, this.infoModal].forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("show");
        }
      });
    });
  }

  setCategoryFilter(category) {
    this.activeCategory = category;
    document.querySelectorAll(".filter-chip").forEach(c => {
      c.classList.toggle("active", c.dataset.category === category);
    });
    this.renderFeed();
  }

  // Calculate platform aggregate stats
  updateStats() {
    const totalSlips = this.slips.length;
    const wonSlips = this.slips.filter(s => s.status === "WON").length;
    const completedSlips = this.slips.filter(s => s.status === "WON" || s.status === "LOST").length;
    
    // Win rate based on completed slips or baseline
    const winRate = completedSlips > 0 ? ((wonSlips / completedSlips) * 100).toFixed(1) : "79.2";
    
    // Sum of odds of won slips
    const totalOddsLanded = this.slips
      .filter(s => s.status === "WON")
      .reduce((sum, s) => sum + s.totalOdds, 0)
      .toFixed(1);

    this.statWinRate.textContent = `${winRate}%`;
    this.statSlipsWon.textContent = `${wonSlips}/${completedSlips || totalSlips}`;
    this.statOddsHit.textContent = `${totalOddsLanded > 0 ? totalOddsLanded + 'x' : '18,420x'}`;
  }

  // Filter slips according to category
  getFilteredSlips() {
    if (this.activeCategory === "ALL") {
      return this.slips.filter(s => s.status !== "WON_ARCHIVE");
    }
    if (this.activeCategory === "WON_ARCHIVE") {
      return this.slips.filter(s => s.status === "WON");
    }
    return this.slips.filter(s => s.category === this.activeCategory);
  }

  // Render the slips into the feed
  renderFeed() {
    const filtered = this.getFilteredSlips();
    const activeCount = this.slips.filter(s => s.status === "PENDING").length;
    this.activeCountBadge.textContent = `${activeCount} Active`;

    if (this.activeCategory === "WON_ARCHIVE") {
      this.feedTitleHeading.textContent = "Verified Winning Archive";
    } else {
      this.feedTitleHeading.textContent = "Active Booking Codes";
    }

    if (filtered.length === 0) {
      this.slipsFeed.innerHTML = `
        <div class="stat-card" style="padding: 40px 20px;">
          <i data-lucide="inbox" style="width: 36px; height: 36px; color: var(--text-muted); margin-bottom: 8px;"></i>
          <p class="font-bold">No slips found in this category.</p>
          <p class="text-muted" style="font-size: 0.8rem; margin-top: 4px;">New codes drop 30-45 mins before major match kickoffs.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    this.slipsFeed.innerHTML = filtered.map(slip => this.buildSlipCardHTML(slip)).join("");
    
    // Attach dynamic click events to card buttons
    this.attachCardEventListeners();

    // Re-initialize Lucide Icons for dynamic content
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  buildSlipCardHTML(slip) {
    const potentialWin = (slip.stake * slip.totalOdds).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const isFeatured = slip.isPinned;
    const isWon = slip.status === "WON";
    const isLost = slip.status === "LOST";

    // Bookmaker class styling
    const bmClass = `bm-${slip.bookmaker.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    // Category label
    let catClass = "cat-mega";
    let catLabel = "₦200M MEGA";
    if (slip.category === "BANKER") {
      catClass = "cat-banker";
      catLabel = "DAILY BANKER";
    } else if (slip.category === "OVER_UNDER") {
      catClass = "cat-overunder";
      catLabel = "OVER / UNDER";
    } else if (slip.category === "ROLLOVER") {
      catClass = "cat-rollover";
      catLabel = "ROLLOVER";
    }

    const cardClasses = [
      "slip-card",
      isFeatured ? "featured" : "",
      isWon ? "status-won" : ""
    ].filter(Boolean).join(" ");

    return `
      <article class="${cardClasses}" data-slip-id="${slip.id}">
        ${isFeatured ? `<div class="featured-ribbon">★ FEATURED SLIP</div>` : ""}

        <!-- Card Header -->
        <div class="card-top-row">
          <span class="category-tag ${catClass}">${catLabel}</span>
          <span class="bookmaker-badge ${bmClass}">${slip.bookmaker}</span>
        </div>

        <!-- Slip Title -->
        <h3 class="card-title">${slip.title}</h3>

        <!-- Odds & Return Matrix -->
        <div class="odds-matrix">
          <div class="odds-col">
            <span class="odds-col-label">Total Odds</span>
            <span class="odds-number ${slip.totalOdds > 50 ? 'text-gold' : 'text-accent'}">
              ${slip.totalOdds.toFixed(2)}x
            </span>
          </div>
          <div class="odds-col" style="text-align: right;">
            <span class="odds-col-label">Potential Win (₦200)</span>
            <span class="payout-number">₦${potentialWin}</span>
          </div>
        </div>

        <!-- Booking Code Box -->
        <div class="booking-code-box">
          <div class="code-info">
            <span class="code-label">${slip.bookmaker} CODE</span>
            <span class="code-text">${slip.bookingCode}</span>
          </div>
          <button class="btn-copy-code" data-code="${slip.bookingCode}" data-bookmaker="${slip.bookmaker}" data-id="${slip.id}">
            <i data-lucide="copy"></i>
            <span>COPY CODE</span>
          </button>
        </div>

        ${slip.promoCode ? `
          <!-- Stake Partner In-Card Promo Bar -->
          <div class="stake-card-addon">
            <span>🎁 Stake Promo Code: <strong class="stake-promo-copy" data-promo="${slip.promoCode}" style="color: #00E701; cursor: pointer; padding: 2px 6px; border-radius: 4px; background: rgba(0, 231, 1, 0.15);" title="Click to copy promo code">${slip.promoCode}</strong></span>
            <a href="${slip.signupUrl || 'https://stake.com/?c=Jareddad&offer=jareddad'}" target="_blank" rel="noopener noreferrer">
              <span>Sign Up Account</span>
              <i data-lucide="arrow-up-right" style="width: 13px; height: 13px;"></i>
            </a>
          </div>
        ` : ""}

        <!-- Card Meta Row -->
        <div class="card-meta-row">
          <div class="meta-item">
            <i data-lucide="list-ordered"></i>
            <span>${slip.matchCount} Matches</span>
          </div>
          
          ${isWon ? `
            <div class="won-stamp-badge">
              <i data-lucide="trophy"></i> WON 🏆
            </div>
          ` : isLost ? `
            <div class="meta-item text-red font-bold">
              <i data-lucide="x-circle"></i> LOST
            </div>
          ` : `
            <div class="meta-item">
              <i data-lucide="clock"></i>
              <span class="countdown-timer" data-kickoff="${slip.kickoffTime}">Calculating...</span>
            </div>
          `}

          ${slip.isCutOne ? `<span class="cut-bonus-pill">Cut-1 Active</span>` : ""}
        </div>

        <!-- Secondary Actions (Deeplink + Share) -->
        <div class="card-actions-row">
          <a href="${slip.affiliateUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn-open-bookmaker">
            <span>Load in ${slip.bookmaker}</span>
            <i data-lucide="external-link"></i>
          </a>
          <button class="btn-share-slip" data-title="${slip.title}" data-code="${slip.bookingCode}" title="Share Slip">
            <i data-lucide="share-2"></i>
          </button>
        </div>
      </article>
    `;
  }

  attachCardEventListeners() {
    // Copy Code Buttons
    document.querySelectorAll(".btn-copy-code").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const code = btn.dataset.code;
        const bookmaker = btn.dataset.bookmaker;
        const slipId = btn.dataset.id;
        
        await this.copyToClipboard(code, bookmaker, btn);
        this.incrementCopyCount(slipId);
      });
    });

    // Promo Code Copy Buttons
    document.querySelectorAll(".stake-promo-copy, .stake-promo-code-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const promo = btn.dataset.promo || "JAREDDAD";
        await this.copyToClipboard(promo, "Stake Promo");
        this.showToast(`Stake Promo Code "${promo}" copied to clipboard! 🎁`);
      });
    });

    // Share Slip Buttons
    document.querySelectorAll(".btn-share-slip").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const title = btn.dataset.title;
        const code = btn.dataset.code;
        this.shareSlip(title, code);
      });
    });
  }

  // Resilient 3-Tier Clipboard Engine
  async copyToClipboard(code, bookmaker, triggerBtn) {
    let copySuccessful = false;

    // Tier 1: Modern navigator.clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(code);
        copySuccessful = true;
      } catch (err) {
        console.warn("Navigator clipboard failed, attempting fallback:", err);
      }
    }

    // Tier 2: Hidden textarea execCommand fallback (works in older WebViews & Opera Mini)
    if (!copySuccessful) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copySuccessful = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.warn("execCommand fallback failed:", fallbackErr);
      }
    }

    // Tier 3: Display manual copy modal if system completely blocked clipboard
    if (!copySuccessful) {
      this.manualCopyBox.textContent = code;
      this.copyFallbackModal.classList.add("show");
      return;
    }

    // Haptic Vibration feedback on supported mobile devices
    if (navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch (vErr) {
        // ignore vibration permissions
      }
    }

    // Visual button feedback
    if (triggerBtn) {
      const originalHtml = triggerBtn.innerHTML;
      triggerBtn.classList.add("copied");
      triggerBtn.innerHTML = `<i data-lucide="check"></i> <span>COPIED!</span>`;
      lucide.createIcons();

      setTimeout(() => {
        triggerBtn.classList.remove("copied");
        triggerBtn.innerHTML = originalHtml;
        lucide.createIcons();
      }, 2500);
    }

    // Toast notification
    this.showToast(`${bookmaker} Code "${code}" copied to clipboard! 📋`);
  }

  // Native share or copy link
  shareSlip(title, code) {
    const tgLink = "https://t.me/+GYo8-GqoBzlmNDA0";
    const text = `🔥 Check out today's "${title}" booking code: [ ${code} ] on the ₦200 to ₦200M Platform!\n📲 Join our VIP Telegram for daily banker alerts: ${tgLink}`;
    if (navigator.share) {
      navigator.share({
        title: "₦200 to ₦200M Slip",
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      this.copyToClipboard(text, "Slip Details");
    }
  }

  incrementCopyCount(slipId) {
    const slip = this.slips.find(s => s.id === slipId);
    if (slip) {
      slip.copiesCount = (slip.copiesCount || 0) + 1;
      this.saveSlips();
    }
  }

  // Toast Notification
  showToast(message) {
    this.toastMessage.textContent = message;
    this.toastNotification.classList.add("show");
    
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastNotification.classList.remove("show");
    }, 3200);
  }

  // Live countdown engine
  startCountdownEngine() {
    const updateTimers = () => {
      document.querySelectorAll(".countdown-timer[data-kickoff]").forEach(el => {
        const kickoff = new Date(el.dataset.kickoff).getTime();
        const now = Date.now();
        const diff = kickoff - now;

        if (diff <= 0) {
          el.textContent = "IN-PLAY";
          el.style.color = "var(--accent-red)";
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);

          if (hours > 0) {
            el.textContent = `${hours}h ${mins}m left`;
          } else {
            el.textContent = `${mins}m ${secs}s left`;
          }
        }
      });
    };

    updateTimers();
    this.timerInterval = setInterval(updateTimers, 1000);
  }

  // Admin Modal Methods
  openAdmin() {
    this.renderAdminSlipsList();
    this.adminModal.classList.add("show");
    lucide.createIcons();
  }

  closeAdmin() {
    this.adminModal.classList.remove("show");
  }

  handlePublishSlip() {
    const title = document.getElementById("slipTitle").value.trim();
    const category = document.getElementById("slipCategory").value;
    const bookmaker = document.getElementById("slipBookmaker").value;
    const bookingCode = document.getElementById("bookingCode").value.trim().toUpperCase();
    const totalOdds = parseFloat(document.getElementById("totalOdds").value) || 1.0;
    const matchCount = parseInt(document.getElementById("matchCount").value) || 1;
    const kickoffHours = parseFloat(document.getElementById("kickoffHours").value) || 2;
    const isPinned = document.getElementById("isPinned").checked;
    const isCutOne = document.getElementById("isCutOne").checked;

    const newSlip = {
      id: `slip-${Date.now()}`,
      title,
      category,
      bookmaker,
      bookingCode,
      totalOdds,
      stake: 200,
      matchCount,
      kickoffTime: new Date(Date.now() + kickoffHours * 60 * 60 * 1000).toISOString(),
      status: "PENDING",
      isPinned,
      isCutOne,
      copiesCount: 0,
      affiliateUrl: bookmaker === "STAKE.COM"
        ? (bookingCode.toLowerCase().startsWith("sport:")
            ? `https://stake.com/sports/home?iid=${encodeURIComponent(bookingCode)}&source=link_shared&modal=bet`
            : `https://stake.com/?c=Jareddad&offer=jareddad`)
        : `https://${bookmaker.toLowerCase()}.com/ng/?ref=200to200m&code=${bookingCode}`
    };

    // If new slip is pinned, unpin older slips
    if (isPinned) {
      this.slips.forEach(s => s.isPinned = false);
    }

    this.slips.unshift(newSlip);
    this.saveSlips();
    this.updateStats();
    this.renderFeed();
    this.closeAdmin();
    this.slipForm.reset();
    this.estReturnPreview.textContent = "₦0.00";

    this.showToast(`🚀 "${bookingCode}" Published live to 5,000+ members!`);
  }

  renderAdminSlipsList() {
    this.adminSlipsList.innerHTML = this.slips.map(slip => `
      <div class="admin-slip-item" data-id="${slip.id}">
        <div>
          <b style="color: white;">[${slip.bookmaker}] ${slip.bookingCode}</b> (${slip.totalOdds}x)
          <div style="font-size: 0.68rem; color: var(--text-muted);">${slip.title.substring(0, 32)}...</div>
        </div>
        <div class="admin-slip-actions">
          <button class="btn-status-toggle btn-status-won" data-action="WON" data-id="${slip.id}">Won 🏆</button>
          <button class="btn-status-toggle btn-status-lost" data-action="LOST" data-id="${slip.id}">Lost ❌</button>
          <button class="btn-status-toggle btn-status-delete" data-action="DELETE" data-id="${slip.id}">🗑️</button>
        </div>
      </div>
    `).join("");

    this.adminSlipsList.querySelectorAll(".btn-status-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        this.handleSlipStatusUpdate(id, action);
      });
    });
  }

  handleSlipStatusUpdate(slipId, action) {
    if (action === "DELETE") {
      this.slips = this.slips.filter(s => s.id !== slipId);
    } else {
      const slip = this.slips.find(s => s.id === slipId);
      if (slip) {
        slip.status = action;
      }
    }
    this.saveSlips();
    this.updateStats();
    this.renderFeed();
    this.renderAdminSlipsList();
    this.showToast(`Slip updated to ${action}`);
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.bettingHub = new BettingHubApp();
});
