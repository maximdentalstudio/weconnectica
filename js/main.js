/* Typewriter: печатает -> пауза -> удаляет -> следующий текст (циклом) */
(function () {
    const el = document.querySelector(".typewrite");
    if (!el) return;
  
    const words = JSON.parse(el.getAttribute("data-words") || "[]");
    const typeSpeed = Number(el.getAttribute("data-type-speed") || 70);
    const deleteSpeed = Number(el.getAttribute("data-delete-speed") || 40);
    const pause = Number(el.getAttribute("data-pause") || 1200);
    const loop = (el.getAttribute("data-loop") || "true") === "true";
  
    if (!words.length) return;
  
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
  
    function tick() {
      const current = words[wordIndex];
      const visible = current.slice(0, charIndex);
      el.textContent = visible;
  
      if (!isDeleting) {
        // печать
        if (charIndex < current.length) {
          charIndex++;
          setTimeout(tick, typeSpeed);
        } else {
          // слово допечатано -> пауза -> удаление
          isDeleting = true;
          setTimeout(tick, pause);
        }
      } else {
        // удаление
        if (charIndex > 0) {
          charIndex--;
          setTimeout(tick, deleteSpeed);
        } else {
          // удалили -> следующее слово
          isDeleting = false;
          wordIndex++;
  
          if (wordIndex >= words.length) {
            if (!loop) return;
            wordIndex = 0;
          }
          setTimeout(tick, 350);
        }
      }
    }
  
    tick();
  })();






// FAQ accordion
document.querySelectorAll("[data-accordion]").forEach((acc) => {
  const items = Array.from(acc.querySelectorAll(".faq__item"));

  // init: open ones with aria-expanded="true"
  items.forEach((item) => {
    const btn = item.querySelector(".faq__q");
    const panel = item.querySelector(".faq__a");
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    item.classList.toggle("is-open", isOpen);
    panel.style.maxHeight = isOpen ? panel.scrollHeight + "px" : "0px";
  });

  items.forEach((item) => {
    const btn = item.querySelector(".faq__q");
    const panel = item.querySelector(".faq__a");

    btn.addEventListener("click", () => {
      const willOpen = btn.getAttribute("aria-expanded") !== "true";

      // закрыть остальные (как в макете — один открыт)
      items.forEach((it) => {
        const b = it.querySelector(".faq__q");
        const p = it.querySelector(".faq__a");
        b.setAttribute("aria-expanded", "false");
        it.classList.remove("is-open");
        p.style.maxHeight = "0px";
      });

      // открыть текущий
      if (willOpen) {
        btn.setAttribute("aria-expanded", "true");
        item.classList.add("is-open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  // на ресайзе пересчитать высоту открытого
  window.addEventListener("resize", () => {
    items.forEach((item) => {
      const btn = item.querySelector(".faq__q");
      const panel = item.querySelector(".faq__a");
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      panel.style.maxHeight = isOpen ? panel.scrollHeight + "px" : "0px";
    });
  });
});


// ===== Courses: tabs + dropdown + live search =====
(function () {
  const section = document.querySelector(".courses-listing");
  if (!section) return;

  // --- Tabs active switch ---
  const tabs = section.querySelectorAll(".courses-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      // Тут можно позже добавить реальную фильтрацию по категориям
    });
  });

  // --- Dropdown open/close ---
  const dd = section.querySelector(".courses-dd");
  if (dd) {
    const btn = dd.querySelector(".courses-dd__btn");
    const menu = dd.querySelector(".courses-dd__menu");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const opened = dd.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", opened ? "true" : "false");
    });

    // click on item (optional: put text into button)
    if (menu) {
      menu.querySelectorAll("button").forEach((item) => {
        item.addEventListener("click", () => {
          btn.firstChild.textContent = item.textContent + " ";
          dd.classList.remove("is-open");
          btn.setAttribute("aria-expanded", "false");
        });
      });
    }

    document.addEventListener("click", (e) => {
      if (!dd.contains(e.target)) {
        dd.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // --- Live search (filter cards) ---
  const input = section.querySelector(".courses-search__input");
  const cards = Array.from(section.querySelectorAll(".course-card"));

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function getCardText(card) {
    // Ищем заголовок и текст (под твой HTML)
    const title = card.querySelector(".course-card__title")?.textContent || "";
    const text = card.querySelector(".course-card__text")?.textContent || "";
    return normalize(title + " " + text);
  }

  if (input && cards.length) {
    const cardIndex = new Map(cards.map((c) => [c, getCardText(c)]));

    input.addEventListener("input", () => {
      const q = normalize(input.value);

      // если пусто — показываем всё (кроме is-hidden — если ты load more используешь)
      if (!q) {
        cards.forEach((card) => {
          // если у тебя есть "скрытые" для Load more — оставляем скрытыми
          if (card.classList.contains("is-hidden")) return;
          card.style.display = "";
        });
        return;
      }

      // фильтрация
      cards.forEach((card) => {
        const hay = cardIndex.get(card) || "";
        const match = hay.includes(q);

        // match => показываем
        if (match) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
})();
document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".courses-search__input");
  const empty = document.getElementById("coursesEmpty");
  const cards = Array.from(document.querySelectorAll(".course-card"));

  // если на странице нет карточек — можно сразу показать empty (по желанию)
  if (!input || !empty || cards.length === 0) return;

  const index = cards.map((card) => {
    const title = card.querySelector(".course-card__title")?.textContent ?? "";
    const text = card.querySelector(".course-card__text")?.textContent ?? "";
    return { card, hay: (title + " " + text).toLowerCase() };
  });

  function applyFilter(value) {
    const q = value.trim().toLowerCase();
    let visibleCount = 0;

    // если пусто — показываем всё и прячем empty
    if (!q) {
      index.forEach(({ card }) => (card.style.display = ""));
      empty.style.display = "none";
      return;
    }

    index.forEach(({ card, hay }) => {
      const ok = hay.includes(q);
      card.style.display = ok ? "" : "none";
      if (ok) visibleCount++;
    });

    empty.style.display = visibleCount === 0 ? "block" : "none";
  }

  input.addEventListener("input", (e) => applyFilter(e.target.value));
});
document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".courses-search__input");
  const empty = document.getElementById("coursesEmpty");
  const cards = Array.from(document.querySelectorAll(".course-card"));

  // быстрый тест что скрипт реально загрузился
  console.log("[courses] init", { input: !!input, empty: !!empty, cards: cards.length });

  if (!input || !empty || cards.length === 0) return;

  const data = cards.map((card) => {
    const title = card.querySelector(".course-card__title")?.textContent || "";
    const text = card.querySelector(".course-card__text")?.textContent || "";
    return { card, hay: (title + " " + text).toLowerCase() };
  });

  function filterCourses(q) {
    const query = q.trim().toLowerCase();
    let shown = 0;

    data.forEach(({ card, hay }) => {
      const ok = query === "" ? true : hay.includes(query);
      card.style.display = ok ? "" : "none";
      if (ok) shown++;
    });

    // если запрос НЕ пустой и совпадений 0 → показываем empty
    empty.hidden = !(query !== "" && shown === 0);
  }

  input.addEventListener("input", (e) => filterCourses(e.target.value));
});
