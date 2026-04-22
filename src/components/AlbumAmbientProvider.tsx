"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  cacheKey,
  extractGradientFromImage,
  getCachedGradient,
  setCachedGradient,
} from "@/lib/album-ambient/extract-palette";

const FALLBACK_GRADIENT =
  "radial-gradient(ellipse 95% 72% at 18% 28%, rgba(90,70,120,0.4), transparent 60%), radial-gradient(ellipse 78% 58% at 88% 12%, rgba(45,40,65,0.32), transparent 56%), linear-gradient(180deg, rgba(4,4,8,0.5) 0%, transparent 48%, rgba(3,3,6,0.82) 100%)";

type AlbumAmbientContextValue = {
  isAlbumAmbientActive: boolean;
  registerAlbumAmbient: (
    albumId: string,
    source: string,
    imageUrl: string | null,
  ) => Promise<void>;
  clearAlbumAmbient: () => void;
};

const AlbumAmbientContext = createContext<AlbumAmbientContextValue | null>(null);

export function useAlbumAmbient(): AlbumAmbientContextValue | null {
  return useContext(AlbumAmbientContext);
}

const ENTER_MS = 520;
const CROSS_MS = 520;
const EXIT_MS = 520;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

export function AlbumAmbientProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const msCross = reducedMotion ? 0 : CROSS_MS;
  const msExit = reducedMotion ? 0 : EXIT_MS;

  const firstGradientRef = useRef(true);

  const [chromeActive, setChromeActive] = useState(false);
  const [shellOpacity, setShellOpacity] = useState(0);
  const [g0, setG0] = useState(FALLBACK_GRADIENT);
  const [g1, setG1] = useState(FALLBACK_GRADIENT);
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0);

  const layerTransition = useMemo(
    () =>
      reducedMotion ? "none" : `opacity ${msCross}ms cubic-bezier(0.25, 1, 0.5, 1)`,
    [reducedMotion, msCross],
  );

  const shellTransition = useMemo(
    () =>
      reducedMotion
        ? "none"
        : `opacity ${ENTER_MS}ms cubic-bezier(0.25, 1, 0.5, 1), opacity ${EXIT_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`,
    [reducedMotion, msExit],
  );

  useEffect(() => {
    if (chromeActive) {
      document.body.dataset.albumAmbient = "true";
    } else {
      delete document.body.dataset.albumAmbient;
    }
  }, [chromeActive]);

  const pushGradient = useCallback((gradientCss: string) => {
    if (firstGradientRef.current) {
      firstGradientRef.current = false;
      setG0(gradientCss);
      setG1(gradientCss);
      setActiveLayer(0);
      return;
    }
    setActiveLayer((prev) => {
      const next = (1 - prev) as 0 | 1;
      if (next === 0) setG0(gradientCss);
      else setG1(gradientCss);
      return next;
    });
  }, []);

  const registerAlbumAmbient = useCallback(
    async (albumId: string, source: string, imageUrl: string | null) => {
      let gradientCss = FALLBACK_GRADIENT;

      if (imageUrl) {
        const key = cacheKey(albumId, source);
        const cached = getCachedGradient(key);
        if (cached) {
          gradientCss = cached;
        } else {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.referrerPolicy = "no-referrer";

          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = imageUrl!;
          });

          if (img.complete && img.naturalWidth > 0) {
            const extracted = await extractGradientFromImage(img);
            gradientCss = extracted ?? FALLBACK_GRADIENT;
            setCachedGradient(key, gradientCss);
          }
        }
      }

      setChromeActive(true);
      pushGradient(gradientCss);

      if (reducedMotion) {
        setShellOpacity(1);
      } else {
        setShellOpacity(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setShellOpacity(1));
        });
      }
    },
    [pushGradient, reducedMotion],
  );

  const clearAlbumAmbient = useCallback(() => {
    firstGradientRef.current = true;
    setShellOpacity(0);
    window.setTimeout(
      () => {
        setChromeActive(false);
        setActiveLayer(0);
        setG0(FALLBACK_GRADIENT);
        setG1(FALLBACK_GRADIENT);
      },
      reducedMotion ? 0 : msExit,
    );
  }, [msExit, reducedMotion]);

  const ctxValue = useMemo<AlbumAmbientContextValue>(
    () => ({
      isAlbumAmbientActive: chromeActive,
      registerAlbumAmbient,
      clearAlbumAmbient,
    }),
    [chromeActive, registerAlbumAmbient, clearAlbumAmbient],
  );

  const op0 = activeLayer === 0 ? 1 : 0;
  const op1 = activeLayer === 1 ? 1 : 0;

  return (
    <AlbumAmbientContext.Provider value={ctxValue}>
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden
        style={{
          opacity: shellOpacity,
          transition: shellTransition,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: g0,
            opacity: op0,
            transition: layerTransition,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: g1,
            opacity: op1,
            transition: layerTransition,
          }}
        />
      </div>
      <div className="relative z-[10] flex min-h-screen flex-col">{children}</div>
    </AlbumAmbientContext.Provider>
  );
}
