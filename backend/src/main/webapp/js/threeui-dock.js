/**
 * ThreeUI Animated Top Dock Controller — Sable Variant
 * Faithful high-performance port from ThreeUI (Source revision: 5a736cd3c1f6f19802f61ebb10e1701b9f7aa26e)
 *
 * Implements:
 * - Euler spring-damping physics (spring: 0.19, damping: 0.70)
 * - Hermite smoothstep proximity wave interpolation
 * - Downward drop translation & dynamic width/height expansion
 * - Safe measurement engine without recursive parent reflow loops
 * - Keyboard Tab focus propagation & active route sync
 */

(function (window, document) {
  "use strict";

  const SABLE_DEFAULTS = {
    proximity: 170, // Tuned for standard 100-180px navbar buttons
    spring: 0.19,   // Exact ThreeUI Sable spring stiffness
    damping: 0.70,  // Exact ThreeUI Sable damping
    widthGrowth: 18,
    heightGrowth: 14,
    drop: 4.5,
    axis: "x",
    distribute: false,
    lockTrack: false,
  };

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function createTopDockController(root, userOptions) {
    if (!root) return null;

    const options = Object.assign({}, SABLE_DEFAULTS, typeof userOptions === "function" ? userOptions() : (userOptions || {}));

    const elements = Array.from(root.querySelectorAll("[data-dock-item]"));
    if (elements.length === 0) return null;

    const items = elements.map(function (element) {
      return {
        element: element,
        baseWidth: 0,
        baseHeight: 0,
        value: 0,
        velocity: 0,
        target: 0,
      };
    });

    let enabled = true;
    let pointerActive = false;
    let dirty = true;
    let frame = 0;
    let released = false;

    function applyLayout() {
      if (options.distribute && options.axis !== "y") {
        const weights = items.map(function (state) {
          return state.baseWidth + options.widthGrowth * clamp(state.value, 0, 1.15);
        });
        const total = weights.reduce(function (sum, weight) { return sum + weight; }, 0);
        const natural = items.reduce(function (sum, state) { return sum + state.baseWidth; }, 0);
        const track = root.clientWidth >= natural ? root.clientWidth : 0;
        items.forEach(function (state, index) {
          state.element.style.setProperty("width", track ? (track * weights[index] / total).toFixed(2) + "px" : "", "important");
          state.element.style.removeProperty("height");
          state.element.style.removeProperty("transform");
        });
        return;
      }

      for (let i = 0; i < items.length; i++) {
        const state = items[i];
        const value = clamp(state.value, 0, 1.15); // Allow natural Euler spring overshoot

        // Auto-heal base size if unmeasured
        if (state.baseWidth <= 0 || state.baseHeight <= 0) {
          const r = state.element.getBoundingClientRect();
          if (r.width > 0) state.baseWidth = r.width;
          if (r.height > 0) state.baseHeight = r.height;
        }

        if (options.axis === "y") {
          state.element.style.removeProperty("width");
          state.element.style.setProperty("height", (state.baseHeight + options.heightGrowth * value).toFixed(2) + "px", "important");
          state.element.style.setProperty("transform", "translateX(" + (value * options.drop).toFixed(2) + "px)", "important");
          continue;
        }

        const isLogo = state.element.classList.contains("threeui-dock-logo") || state.element.classList.contains("animated-top-dock__logo");
        const extraWidth = isLogo ? options.widthGrowth * (14 / 17) : options.widthGrowth;
        const extraHeight = isLogo ? options.heightGrowth * (14 / 16) : options.heightGrowth;

        const w = (state.baseWidth + extraWidth * value).toFixed(2);
        const h = (state.baseHeight + extraHeight * value).toFixed(2);
        const y = (value * options.drop).toFixed(2);

        state.element.style.setProperty("width", w + "px", "important");
        state.element.style.setProperty("height", h + "px", "important");
        state.element.style.setProperty("transform", "translateY(" + y + "px)", "important");
      }
    }

    function measure() {
      if (released) return;
      // CRITICAL: Never clear styles or reset in-flight physics while user is interacting!
      if (pointerActive) return;

      if (options.lockTrack) root.style.width = "";

      // Clear styles to record true rest dimensions
      for (let i = 0; i < items.length; i++) {
        const state = items[i];
        state.element.style.removeProperty("width");
        state.element.style.removeProperty("height");
        state.element.style.removeProperty("transform");
        state.element.dataset.dockNear = "false";
      }

      // Record natural dimensions
      for (let i = 0; i < items.length; i++) {
        const state = items[i];
        const rect = state.element.getBoundingClientRect();
        if (rect.width > 0) state.baseWidth = rect.width;
        if (rect.height > 0) state.baseHeight = rect.height;
        state.value = 0;
        state.velocity = 0;
        state.target = 0;
      }

      pointerActive = false;
      dirty = false;

      if (options.distribute) applyLayout();
      if (options.lockTrack) root.style.width = root.getBoundingClientRect().width.toFixed(2) + "px";

      root.dataset.dockState = "idle";
      root.dataset.dockMax = "0.00";
    }

    function setTargets(clientX, clientY) {
      if (released) return;

      const vertical = options.axis === "y";
      const pointer = vertical ? clientY : clientX;

      // Ensure base sizes are known
      for (let i = 0; i < items.length; i++) {
        if (items[i].baseWidth <= 0 || items[i].baseHeight <= 0) {
          const r = items[i].element.getBoundingClientRect();
          if (r.width > 0) items[i].baseWidth = r.width;
          if (r.height > 0) items[i].baseHeight = r.height;
        }
      }

      const rects = items.map(function (state) {
        return state.element.getBoundingClientRect();
      });

      for (let index = 0; index < items.length; index++) {
        const state = items[index];
        const rect = rects[index];
        const center = vertical ? (rect.top + rect.height * 0.5) : (rect.left + rect.width * 0.5);
        const dist = Math.abs(pointer - center);
        const proximity = clamp(1 - dist / Math.max(1, options.proximity), 0, 1);
        const influence = proximity * proximity * (3 - 2 * proximity); // Hermite smoothstep
        state.target = influence;
        state.element.dataset.dockNear = influence > 0.08 ? "true" : "false";
      }

      pointerActive = true;
      dirty = true;
      root.dataset.dockState = "active";
    }

    function focusItem(item) {
      if (released) return;
      const index = items.findIndex(function (state) { return state.element === item; });
      if (index < 0) return;

      items.forEach(function (state, itemIndex) {
        state.target = itemIndex === index ? 1 : Math.abs(itemIndex - index) === 1 ? 0.28 : 0;
        state.element.dataset.dockNear = state.target > 0.08 ? "true" : "false";
      });

      pointerActive = false;
      dirty = true;
      root.dataset.dockState = "focus";
    }

    function reset() {
      pointerActive = false;
      dirty = true;
      items.forEach(function (state) {
        state.target = 0;
        state.element.dataset.dockNear = "false";
      });
    }

    function draw() {
      if (dirty) {
        let moving = false;
        let maxValue = 0;

        for (let i = 0; i < items.length; i++) {
          const state = items[i];
          // ThreeUI Euler spring integration
          state.velocity += (state.target - state.value) * options.spring;
          state.velocity *= options.damping;
          state.value += state.velocity;

          if (Math.abs(state.target - state.value) < 0.001 && Math.abs(state.velocity) < 0.001) {
            state.value = state.target;
            state.velocity = 0;
          } else {
            moving = true;
          }
          maxValue = Math.max(maxValue, clamp(state.value, 0, 1.15));
        }

        applyLayout();
        root.dataset.dockMax = maxValue.toFixed(2);

        if (!moving) {
          dirty = false;
          if (items.every(function (state) { return state.target === 0; })) {
            root.dataset.dockState = "idle";
          }
        }
      }
      frame = requestAnimationFrame(draw);
    }

    function onPointerMove(event) {
      setTargets(event.clientX, event.clientY);
    }

    function onWindowPointerMove(event) {
      if (!pointerActive) return;
      const rootRect = root.getBoundingClientRect();
      const pad = 80;
      const outside = (
        event.clientX < rootRect.left - pad ||
        event.clientX > rootRect.right + pad ||
        event.clientY < rootRect.top - pad ||
        event.clientY > rootRect.bottom + pad + options.drop + options.heightGrowth
      );
      if (outside) reset();
    }

    function onFocusIn(event) {
      const targetElement = event.target;
      const item = targetElement ? targetElement.closest("[data-dock-item]") : null;
      if (item) focusItem(item);
    }

    function onFocusOut() {
      requestAnimationFrame(function () {
        if (!root.contains(document.activeElement)) reset();
      });
    }

    function onKeyDown(event) {
      const targetElement = event.target;
      const item = targetElement ? targetElement.closest("[data-dock-item]") : null;
      if (item && (event.key === "Enter" || event.key === " ")) {
        if (item.tagName.toLowerCase() !== "a") {
          event.preventDefault();
          item.click();
        }
      }
    }

    function onClick() {
      reset();
    }

    // Font load handler
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!pointerActive) measure();
      });
    }

    // Window resize handler: only measure when idle and width actually changes
    let lastWindowWidth = window.innerWidth;
    function onWindowResize() {
      if (Math.abs(window.innerWidth - lastWindowWidth) > 5) {
        lastWindowWidth = window.innerWidth;
        if (!pointerActive) {
          measure();
        }
      }
    }
    window.addEventListener("resize", onWindowResize, { passive: true });

    // Root event listeners
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("mousemove", onPointerMove);
    root.addEventListener("pointerleave", reset);
    root.addEventListener("mouseleave", reset);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    root.addEventListener("keydown", onKeyDown);
    root.addEventListener("click", onClick);

    // Attach directly to each item for instantaneous response
    items.forEach(function (state) {
      state.element.addEventListener("pointermove", onPointerMove);
      state.element.addEventListener("mousemove", onPointerMove);
      state.element.addEventListener("mouseenter", function (e) {
        setTargets(e.clientX, e.clientY);
      });
    });

    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
    window.addEventListener("mousemove", onWindowPointerMove, { passive: true });

    // Initial progressive measurement schedule
    measure();
    setTimeout(function () { if (!pointerActive) measure(); }, 120);
    setTimeout(function () { if (!pointerActive) measure(); }, 400);
    frame = requestAnimationFrame(draw);

    return {
      destroy: function () {
        released = true;
        root.style.width = "";
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", onWindowResize);
        root.removeEventListener("pointermove", onPointerMove);
        root.removeEventListener("mousemove", onPointerMove);
        root.removeEventListener("pointerleave", reset);
        root.removeEventListener("mouseleave", reset);
        root.removeEventListener("focusin", onFocusIn);
        root.removeEventListener("focusout", onFocusOut);
        root.removeEventListener("keydown", onKeyDown);
        root.removeEventListener("click", onClick);
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("mousemove", onWindowPointerMove);
      },
      remeasure: measure,
    };
  }

  function initThreeUIDocks() {
    try {
      // 0. Active route sync
      const currentPath = window.location.pathname.toLowerCase();
      const currentHash = window.location.hash.toLowerCase();
      const allDockItems = document.querySelectorAll("[data-dock-item]");
      let matchedAny = false;
      allDockItems.forEach(function (item) {
        const href = item.getAttribute("href");
        if (href) {
          const hrefClean = href.split("?")[0].toLowerCase();
          if (
            (hrefClean.indexOf("#") !== -1 && currentHash && hrefClean.endsWith(currentHash)) ||
            (hrefClean.indexOf(".jsp") !== -1 && currentPath.endsWith(hrefClean))
          ) {
            item.setAttribute("aria-pressed", "true");
            matchedAny = true;
          }
        }
        item.addEventListener("click", function () {
          const navGroup = item.closest("[data-threeui-dock]");
          if (navGroup) {
            navGroup.querySelectorAll("[data-dock-item]").forEach(function (sib) {
              sib.removeAttribute("aria-pressed");
            });
          }
          item.setAttribute("aria-pressed", "true");
        });
      });
      if (!matchedAny && (currentPath.endsWith("index.jsp") || currentPath.endsWith("/iryotek/") || currentPath.endsWith("/iryotek"))) {
        const firstMainItem = document.querySelector("[data-threeui-dock='sable-nav'] [data-dock-item]");
        if (firstMainItem) firstMainItem.setAttribute("aria-pressed", "true");
      }
    } catch (e) {
      console.warn("ThreeUI active link init error:", e);
    }

    // 1. Main Navigation Dock (Sable variant preset: proximity 170, spring 0.19, damping 0.70, widthGrowth 18, heightGrowth 14, drop 4.5)
    const mainDocks = document.querySelectorAll("[data-threeui-dock='sable-nav']");
    mainDocks.forEach(function (dock) {
      // Direct track binding: if placed on outer navbar, bind to the inner track
      const navTrack = dock.querySelector(".threeui-dock-nav") || dock;
      createTopDockController(navTrack, {
        proximity: 170,
        spring: 0.19,
        damping: 0.70,
        widthGrowth: 18,
        heightGrowth: 14,
        drop: 4.5,
        lockTrack: false,
      });
    });

    // 2. Super Top Bar Utility Dock (Compact preset: proximity 90, spring 0.20, damping 0.72, widthGrowth 10, heightGrowth 6, drop 2.0)
    const utilityDocks = document.querySelectorAll("[data-threeui-dock='sable-utility']");
    utilityDocks.forEach(function (dock) {
      createTopDockController(dock, {
        proximity: 90,
        spring: 0.20,
        damping: 0.72,
        widthGrowth: 10,
        heightGrowth: 6,
        drop: 2.0,
        lockTrack: false,
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThreeUIDocks);
  } else {
    initThreeUIDocks();
  }

  window.createThreeUITopDock = createTopDockController;
})(window, document);
