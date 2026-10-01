import React, { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { ArrowLeftIcon, ArrowRightIcon } from "../icons";
import {
  TILE_SPIN_CELLS,
  TILE_SPIN_DURATION,
  SPIN_START_DELAY,
  REVEAL_BEAT,
  SETTLE_BUFFER,
} from "./spinConfig";
import styles from "./ItemSelector.module.css";

const BLUR_FAST = "blur(7px)";
const BLUR_SLOW = "blur(2.5px)";

function ItemSelector({
  title,
  type,
  current,
  total,
  onPrevious,
  onNext,
  spin = null,
  onSpinComplete,
  onSpinCancel,
}) {
  const prevIndex = (current - 1 + total) % total;
  const nextIndex = (current + 1) % total;

  // Geçiş yönünü takip et (sarmal dahil) — animasyon buna göre kayar
  const [direction, setDirection] = useState("next");
  const previousCurrentRef = useRef(current);

  useEffect(() => {
    const previous = previousCurrentRef.current;
    if (previous !== current) {
      const wentNext =
        previous < current || (previous === total - 1 && current === 0);
      setDirection(wentNext ? "next" : "prev");
      previousCurrentRef.current = current;
    }
  }, [current, total]);

  const stripRefs = useRef([]);
  const spinning = Boolean(spin);

  // Slot şeritleri: anime.js translateY + yavaşlarken kademeli blur.
  // Reveal, en yavaş kolonun anime `complete`'ine bağlı — duvar saati değil,
  // animasyonun kendisi tek doğruluk kaynağı (ağır ilk karelerde de kesilmez).
  useEffect(() => {
    if (!spin) return undefined;

    let settled = false;
    let spinning = 0;
    let settleTimer = null;
    const anims = [];

    const settle = () => {
      if (settled) return;
      settled = true;
      onSpinComplete();
    };

    // Safety net: normal akışta `complete` önce vurur, bu timer hiç işlemez
    const totalSpinMs = SPIN_START_DELAY + Math.max(...TILE_SPIN_DURATION);
    settleTimer = setTimeout(settle, totalSpinMs + REVEAL_BEAT + SETTLE_BUFFER);

    TILE_SPIN_CELLS.forEach((cells, tileIndex) => {
      const strip = stripRefs.current[tileIndex];
      const seq = spin.seqs[tileIndex];
      if (!strip || !seq) return;

      anime.remove(strip);
      anime.set(strip, { translateY: "0%" });
      strip.style.filter = BLUR_FAST;

      const endOffset = `-${(((seq.length - 1) / seq.length) * 100).toFixed(4)}%`;
      let blurStep = BLUR_FAST;
      spinning += 1;

      anims.push(
        anime({
          targets: strip,
          translateY: ["0%", endOffset],
          duration: TILE_SPIN_DURATION[tileIndex],
          delay: SPIN_START_DELAY,
          easing: "easeInOutCubic",
          update: (anim) => {
            const step =
              anim.progress < 50
                ? BLUR_FAST
                : anim.progress < 85
                ? BLUR_SLOW
                : "none";
            if (step !== blurStep) {
              blurStep = step;
              strip.style.filter = step;
            }
          },
          complete: () => {
            spinning -= 1;
            if (spinning === 0) {
              // Son kolon da durdu: kısa beat sonrası reveal
              clearTimeout(settleTimer);
              settleTimer = setTimeout(settle, REVEAL_BEAT);
            }
          },
        })
      );
    });

    // Hiç şerit başlatılamadıysa (refs hazır değil) yine de settle et
    if (spinning === 0) {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, SPIN_START_DELAY + REVEAL_BEAT);
    }

    return () => {
      clearTimeout(settleTimer);
      anims.forEach((anim) => anim.pause());
      if (!settled) onSpinCancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin && spin.token]);

  const getImagePath = (index) => {
    if (!type) return null;
    return `/elements/${type}/${type}-${index + 1}.png`;
  };

  const slideClass = direction === "prev" ? styles.slidePrev : styles.slideNext;

  const renderStrip = (tileIndex) =>
    spin && (
      <div className={styles.slotStripOverlay} aria-hidden="true">
        <div
          className={styles.slotStrip}
          ref={(el) => {
            stripRefs.current[tileIndex] = el;
          }}
        >
          {spin.seqs[tileIndex].map((seqIndex, i) => (
            <img
              key={i}
              src={`/elements/${spin.type}/${spin.type}-${seqIndex + 1}.png`}
              alt=""
              draggable={false}
            />
          ))}
        </div>
      </div>
    );

  return (
    <div className={styles.itemSelector} role="tabpanel" id={`panel-${type}`}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.tiles}>
        <button
          type="button"
          className={styles.tile}
          onClick={onPrevious}
          disabled={spinning}
          aria-label={`Previous ${title}`}
        >
          <img key={`prev-${prevIndex}`} src={getImagePath(prevIndex)} alt="" />
          {renderStrip(0)}
        </button>

        <div className={`${styles.tile} ${styles.currentTile}`}>
          <img
            key={current}
            src={getImagePath(current)}
            alt={`${title} option ${current + 1}`}
            className={spinning ? undefined : slideClass}
          />
          {renderStrip(1)}
        </div>

        <button
          type="button"
          className={styles.tile}
          onClick={onNext}
          disabled={spinning}
          aria-label={`Next ${title}`}
        >
          <img key={`next-${nextIndex}`} src={getImagePath(nextIndex)} alt="" />
          {renderStrip(2)}
        </button>
      </div>

      <div className={styles.navRow}>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={onPrevious}
          disabled={spinning}
          aria-label="Önceki"
        >
          <ArrowLeftIcon className={styles.arrowIcon} />
        </button>
        <span
          key={spinning ? "spinning" : current}
          className={`${styles.counter} ${
            spinning ? styles.counterSpinning : slideClass
          }`}
        >
          {current + 1} / {total}
        </span>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={onNext}
          disabled={spinning}
          aria-label="Sonraki"
        >
          <ArrowRightIcon className={styles.arrowIcon} />
        </button>
      </div>
    </div>
  );
}

export default ItemSelector;
