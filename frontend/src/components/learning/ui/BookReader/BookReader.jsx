import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import PageContent from "./PageContent";
import {
  buildPages,
  totalSpreads,
  spreadLabel,
  spreadForLesson,
} from "./useBookPages";
import {
  SCENE, BOOK, BOOK_SINGLE,
  BG_LEFT, BG_RIGHT, BG_SINGLE,
  EDGES_LEFT, EDGES_RIGHT, PAGES_STACK,
  SPINE, SPINE_SHADOW,
  CURL_LEFT, CURL_RIGHT, CURL_LEFT_SINGLE, CURL_RIGHT_SINGLE,
  PG_NUM, NAV, NAV_ARROW, NAV_DOTS, NAV_DOT, NAV_DOT_ACTIVE, NAV_LABEL, NAV_HINT,
  flipContainerClass, flipFrontClass, FLIP_BACK,
} from "./bookStyles";

const FLIP_DURATION = 620;

/** True when the viewport is narrow (mobile single-page mode) */
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 700);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 699px)");
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

/**
 * Creates the temporary animated flip page, runs the turn animation
 * (including the curl shadow sweep), and swaps content halfway through.
 */
function runFlip({ book, dir, mobile, sourceSelector, onHalfway, onDone }) {
  const fc = document.createElement("div");
  fc.className = flipContainerClass(dir > 0, mobile);

  const front = document.createElement("div");
  front.className = flipFrontClass(dir > 0, mobile);
  const back = document.createElement("div");
  back.className = FLIP_BACK;
  fc.appendChild(front);
  fc.appendChild(back);

  const source = book.querySelector(sourceSelector);
  front.innerHTML = source ? source.innerHTML : "";

  book.appendChild(fc);
  fc.getBoundingClientRect();

  const halfDur = FLIP_DURATION / 2;
  fc.style.transition = `transform ${FLIP_DURATION}ms cubic-bezier(0.645,0.045,0.355,1.000)`;
  fc.style.transform = dir > 0 ? "rotateY(-180deg)" : "rotateY(180deg)";

  const curlEl = book.querySelector(dir > 0 ? "[data-br='curl-right']" : "[data-br='curl-left']");
  if (curlEl) {
    curlEl.style.transition = `opacity ${halfDur}ms ease-in`;
    curlEl.style.opacity = mobile ? "0.5" : "0.55";
    setTimeout(() => {
      curlEl.style.transition = `opacity ${halfDur}ms ease-out`;
      curlEl.style.opacity = "0";
    }, halfDur);
  }

  setTimeout(onHalfway, halfDur);
  setTimeout(() => {
    fc.remove();
    onDone();
  }, FLIP_DURATION + 30);
}

/**
 * @param {object} course
 * @param {string|number} [initialLessonId] - if given, the book opens
 *   directly to that lesson's page/spread instead of the cover.
 */
export default function BookReader({ course, initialLessonId }) {
  const isMobile = useIsMobile();

  // Resolve which lesson index (if any) we should open on.
  const initialLessonIndex = useMemo(() => {
    if (initialLessonId == null) return -1;
    return (course.lessons || []).findIndex(
      (l) => String(l.id) === String(initialLessonId)
    );
  }, [course.lessons, initialLessonId]);

  // Desktop: spread index (0, 1, 2…), each spread = 2 pages
  // Mobile:  page index (0, 1, 2…), each step = 1 page
  // Both default to the resolved lesson's position when one is given,
  // otherwise fall back to the cover (index 0).
  const [spread, setSpread] = useState(() =>
    initialLessonIndex >= 0 ? spreadForLesson(initialLessonIndex) : 0
  );
  const [pageIdx, setPageIdx] = useState(() =>
    initialLessonIndex >= 0 ? 2 + initialLessonIndex : 0
  ); // mobile only; 0=cover, 1=toc, 2+n=lesson n
  const [enrolled, setEnrolled] = useState(false);
  const animatingRef = useRef(false);
  const bookRef = useRef(null);
  const dragStartX = useRef(null);

  const pages = buildPages(course);
  const totalDesktop = totalSpreads(pages);
  const totalMobile  = pages.length;

  // If the requested lesson changes (e.g. user opens a different lesson
  // from the same mounted reader via route change), jump to it.
  const lastInitialId = useRef(initialLessonId);
  useEffect(() => {
    if (initialLessonId === lastInitialId.current) return;
    lastInitialId.current = initialLessonId;
    if (initialLessonIndex >= 0) {
      setSpread(spreadForLesson(initialLessonIndex));
      setPageIdx(2 + initialLessonIndex);
    }
  }, [initialLessonId, initialLessonIndex]);

  /* ── MOBILE — single-page flip ── */
  const goToPageMobile = useCallback(
    (target) => {
      if (animatingRef.current) return;
      if (target < 0 || target >= totalMobile) return;
      if (target === pageIdx) return;

      const dir = target > pageIdx ? 1 : -1;
      animatingRef.current = true;

      const book = bookRef.current;
      if (!book) { setPageIdx(target); animatingRef.current = false; return; }

      runFlip({
        book,
        dir,
        mobile: true,
        sourceSelector: "[data-br='bg-single']",
        onHalfway: () => setPageIdx(target),
        onDone: () => { animatingRef.current = false; },
      });
    },
    [pageIdx, totalMobile]
  );

  /* ── DESKTOP — two-page spread flip ── */
  const goToSpreadDesktop = useCallback(
    (targetSpread) => {
      if (animatingRef.current) return;
      if (targetSpread < 0 || targetSpread >= totalDesktop) return;
      if (targetSpread === spread) return;

      const dir = targetSpread > spread ? 1 : -1;
      animatingRef.current = true;

      const book = bookRef.current;
      if (!book) { setSpread(targetSpread); animatingRef.current = false; return; }

      runFlip({
        book,
        dir,
        mobile: false,
        sourceSelector: dir > 0 ? "[data-br='bg-right']" : "[data-br='bg-left']",
        onHalfway: () => setSpread(targetSpread),
        onDone: () => { animatingRef.current = false; },
      });
    },
    [spread, totalDesktop]
  );

  /* ── Unified nav ── */
  const goNext = useCallback(() => {
    if (isMobile) goToPageMobile(pageIdx + 1);
    else          goToSpreadDesktop(spread + 1);
  }, [isMobile, pageIdx, spread, goToPageMobile, goToSpreadDesktop]);

  const goPrev = useCallback(() => {
    if (isMobile) goToPageMobile(pageIdx - 1);
    else          goToSpreadDesktop(spread - 1);
  }, [isMobile, pageIdx, spread, goToPageMobile, goToSpreadDesktop]);

  const jumpToLesson = useCallback(
    (lessonIndex) => {
      if (isMobile) {
        // page 0=cover, 1=toc, 2+lesson index
        goToPageMobile(2 + lessonIndex);
      } else {
        goToSpreadDesktop(spreadForLesson(lessonIndex));
      }
    },
    [isMobile, goToPageMobile, goToSpreadDesktop]
  );

  /* ── Keyboard ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  /* ── Swipe / drag ── */
  const onDragStart = (x) => { dragStartX.current = x; };
  const onDragEnd   = (x) => {
    if (dragStartX.current === null) return;
    const dx = x - dragStartX.current;
    if (Math.abs(dx) > 44) { dx < 0 ? goNext() : goPrev(); }
    dragStartX.current = null;
  };

  /* ── Derived display values ── */
  const currentPage   = pages[pageIdx] ?? null;             // mobile
  const leftPageData  = pages[spread * 2] ?? null;          // desktop
  const rightPageData = pages[spread * 2 + 1] ?? null;      // desktop

  const isAtStart = isMobile ? pageIdx === 0          : spread === 0;
  const isAtEnd   = isMobile ? pageIdx >= totalMobile - 1 : spread >= totalDesktop - 1;

  // Label
  const mobilePgName = (p) => {
    if (!p) return "";
    if (p.type === "cover")  return "Cover";
    if (p.type === "toc")    return "Contents";
    if (p.type === "lesson") return `Lesson ${p.num} of ${course.lessons.length}`;
    return "Enroll";
  };
  const label = isMobile
    ? mobilePgName(currentPage)
    : spreadLabel(pages, spread);

  const dotCount  = isMobile ? totalMobile : totalDesktop;
  const dotActive = isMobile ? pageIdx : spread;

  const sharedDrag = {
    onMouseDown:  (e) => onDragStart(e.clientX),
    onMouseUp:    (e) => onDragEnd(e.clientX),
    onMouseLeave: ()  => { dragStartX.current = null; },
    onTouchStart: (e) => onDragStart(e.touches[0].clientX),
    onTouchEnd:   (e) => onDragEnd(e.changedTouches[0].clientX),
  };

  /* ── RENDER ── */
  return (
    <div className={SCENE}>

      {/* ══════════ MOBILE: single page ══════════ */}
      {isMobile && (
        <div className={BOOK_SINGLE} ref={bookRef} {...sharedDrag}>
          {/* The single visible page */}
          <div className={BG_SINGLE} data-br="bg-single">
            <div className={EDGES_RIGHT} />
            <PageContent
              page={currentPage}
              course={course}
              onJumpToLesson={jumpToLesson}
              enrolled={enrolled}
              onEnroll={() => setEnrolled((e) => !e)}
            />
            {currentPage && (
              <span className={PG_NUM}>{pageIdx + 1} / {totalMobile}</span>
            )}
          </div>

          {/* Curl shadows */}
          <div className={CURL_LEFT_SINGLE} data-br="curl-left" />
          <div className={CURL_RIGHT_SINGLE} data-br="curl-right" />

          {/* Page edge stack on the right */}
          <div className={PAGES_STACK} />
        </div>
      )}

      {/* ══════════ DESKTOP: two-page spread ══════════ */}
      {!isMobile && (
        <div className={BOOK} ref={bookRef} {...sharedDrag}>
          {/* Left page */}
          <div className={BG_LEFT} data-br="bg-left">
            <div className={EDGES_LEFT} />
            <PageContent
              page={leftPageData}
              course={course}
              onJumpToLesson={jumpToLesson}
              enrolled={enrolled}
              onEnroll={() => setEnrolled((e) => !e)}
            />
            {leftPageData && (
              <span className={PG_NUM}>{spread * 2 + 1}</span>
            )}
          </div>

          {/* Right page */}
          <div className={BG_RIGHT} data-br="bg-right">
            <div className={EDGES_RIGHT} />
            {rightPageData ? (
              <>
                <PageContent
                  page={rightPageData}
                  course={course}
                  onJumpToLesson={jumpToLesson}
                  enrolled={enrolled}
                  onEnroll={() => setEnrolled((e) => !e)}
                />
                <span className={PG_NUM}>{spread * 2 + 2}</span>
              </>
            ) : null}
          </div>

          {/* Curl shadows */}
          <div className={CURL_LEFT} data-br="curl-left" />
          <div className={CURL_RIGHT} data-br="curl-right" />

          {/* Spine */}
          <div className={SPINE} />
          <div className={SPINE_SHADOW} />
        </div>
      )}

      {/* ══════════ Navigation bar (shared) ══════════ */}
      <div className={NAV}>
        <button
          className={NAV_ARROW}
          onClick={goPrev}
          disabled={isAtStart}
          aria-label="Previous"
        >
          ←
        </button>

        <div className={NAV_DOTS}>
          {Array.from({ length: dotCount }, (_, i) => (
            <button
              key={i}
              className={i === dotActive ? NAV_DOT_ACTIVE : NAV_DOT}
              onClick={() =>
                isMobile ? goToPageMobile(i) : goToSpreadDesktop(i)
              }
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>

        <button
          className={NAV_ARROW}
          onClick={goNext}
          disabled={isAtEnd}
          aria-label="Next"
        >
          →
        </button>
      </div>

      <p className={NAV_LABEL}>{label}</p>
      <p className={NAV_HINT}>swipe or tap arrows to turn pages</p>
    </div>
  );
}
